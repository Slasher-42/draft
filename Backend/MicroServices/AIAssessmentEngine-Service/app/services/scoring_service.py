import json
from groq import Groq
from sqlalchemy.orm import Session
from app.models import AISession, AssessmentScore, Classification, SessionStatus
from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)
MODEL = "llama-3.3-70b-versatile"


def compute_score(
    db: Session,
    execution_id: int,
    weight_financial_health: float,
    weight_team_strength: float,
    weight_market_potential: float,
    weight_business_viability: float,
    minimum_passing_score: float
) -> AssessmentScore:

    session = db.query(AISession).filter(
        AISession.execution_id == execution_id,
        AISession.status == SessionStatus.COMPLETED
    ).first()

    if not session:
        raise ValueError(f"No completed session found for execution {execution_id}")

    conversation_text = "\n".join([
        f"{'Applicant' if msg['role'] == 'user' else 'Aria'}: {msg['content']}"
        for msg in session.conversation_history
    ])

    scoring_prompt = f"""
You are Aria, the AI Investment Analyst for Annick AI powered by RG Partners.

You have completed a conversation with a {'startup founder' if session.session_type == 'STARTUP' else 'potential investor'}
and you must now produce a final investment readiness assessment.

--- FORM SUBMISSION DATA ---
{json.dumps(session.form_data, indent=2)}

--- ADDITIONAL CONSIDERATIONS PROVIDED ---
{session.additional_considerations or 'None provided'}

--- FULL CONVERSATION TRANSCRIPT ---
{conversation_text}

--- SCORING INSTRUCTIONS ---
Based on everything above, score this {'startup' if session.session_type == 'STARTUP' else 'investor'}
across these four dimensions. Each dimension is scored out of 100.

The admin has configured these weights:
- Financial Health: {weight_financial_health}%
- Team Strength: {weight_team_strength}%
- Market Potential: {weight_market_potential}%
- Business Viability: {weight_business_viability}%

The minimum passing score is: {minimum_passing_score}

Classification rules:
- HIGHLY_READY: overall score above passing threshold with no dimension below 60
- MODERATELY_READY: overall score meets threshold but has at least one weak dimension
- NOT_READY: overall score below the minimum passing score

Be honest and precise in your scoring. Consider the depth of answers, realism of numbers,
team credibility, market understanding, and business model clarity.

--- REASONING INSTRUCTIONS ---
For the "reasoning" field, produce a structured analytical assessment that a senior investment analyst
would write after a real due-diligence conversation. Be specific to the data above — never give generic praise.
Do NOT say things like "the amount specified is good" without explaining why based on stage, sector, and market.

Write the reasoning with EXACTLY these six section labels, each on its own line, followed by a colon and your analysis.
Separate each section with a blank line. Do not add any text outside the sections.

MARKET & COMPETITIVE LANDSCAPE: [Analyze the local and regional market for this specific type of business. Are there already many similar businesses in the same city, region, or target area? Is this niche saturated or underserved? Name realistic competitors or business categories that already exist nearby. Assess whether the stated target market is actually reachable or is too vague.]

FINANCIAL REALISM: [Critically assess whether the funding amount requested makes sense for this business stage, sector, and operating context. Examine revenue projections and burn rate — are they credible or inflated? Would a real investor find the financial assumptions defensible? If numbers raise concerns, state them directly. Do not validate numbers just because the applicant stated them.]

GROWTH TRAJECTORY: [Describe how this business would realistically grow over the next 12 to 24 months given its team, market, and available capital. Identify specific milestones that are achievable and which ones are optimistic. Note what could realistically slow or block growth. Tie analysis directly to the business model, not generic startup advice.]

KEY STRENGTHS: [List what is genuinely strong about this application, referencing specific answers or data points from the conversation and form. Only include real strengths — not flattery. If there are no standout strengths, say so honestly.]

CONCERNS & RED FLAGS: [List concrete risks and concerns. Flag unrealistic growth projections, vague market claims, thin team credentials, single points of failure, regulatory exposure, or anything that signals poor preparation or elevated risk. Be direct. This section must never be left empty — every business has risks worth noting.]

OVERALL VERDICT: [One to two sentences summarizing the investment readiness classification and the single most decisive factor behind it.]

Respond ONLY with this exact JSON structure and nothing else:
{{
  "financial_health": <number 0-100>,
  "team_strength": <number 0-100>,
  "market_potential": <number 0-100>,
  "business_viability": <number 0-100>,
  "overall_score": <weighted total>,
  "classification": "<HIGHLY_READY | MODERATELY_READY | NOT_READY>",
  "reasoning": "<the full structured reasoning with all six sections as described above>"
}}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": scoring_prompt}],
        response_format={"type": "json_object"}
    )

    raw = response.choices[0].message.content.strip()
    result = json.loads(raw)

    classification_map = {
        "HIGHLY_READY": Classification.HIGHLY_READY,
        "MODERATELY_READY": Classification.MODERATELY_READY,
        "NOT_READY": Classification.NOT_READY,
    }

    score = AssessmentScore(
        session_id=session.id,
        execution_id=execution_id,
        user_id=session.user_id,
        financial_health=result["financial_health"],
        team_strength=result["team_strength"],
        market_potential=result["market_potential"],
        business_viability=result["business_viability"],
        overall_score=result["overall_score"],
        classification=classification_map[result["classification"]],
        reasoning=result["reasoning"]
    )

    db.add(score)
    db.commit()
    db.refresh(score)

    return score
