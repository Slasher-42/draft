import json
import google.generativeai as genai
from sqlalchemy.orm import Session
from app.models import AISession, AssessmentScore, Classification, SessionStatus
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

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

Respond ONLY with this exact JSON structure and nothing else:
{{
  "financial_health": <number 0-100>,
  "team_strength": <number 0-100>,
  "market_potential": <number 0-100>,
  "business_viability": <number 0-100>,
  "overall_score": <weighted total>,
  "classification": "<HIGHLY_READY | MODERATELY_READY | NOT_READY>",
  "reasoning": "<2-3 sentences explaining the overall assessment and key strengths or concerns>"
}}
"""

    model = genai.GenerativeModel(model_name="gemini-2.0-flash")
    response = model.generate_content(scoring_prompt)

    raw = response.text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

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