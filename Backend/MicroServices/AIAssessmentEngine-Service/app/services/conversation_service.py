import uuid
from groq import Groq
from sqlalchemy.orm import Session
from app.models import AISession, SessionType, SessionStatus
from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)
MODEL = "llama-3.3-70b-versatile"

ARIA_SYSTEM_PROMPT = """
You are Aria, the AI Investment Analyst for Annick AI, powered by RG Partners.

Your personality:
- Warm, encouraging, and genuinely interested in the person you are speaking with
- Honest and direct — you do not sugarcoat weaknesses, but you deliver feedback with care
- Professional and knowledgeable about startups, investment, and African markets especially East Africa
- You speak naturally like a real person, not like a bot or a form
- You remember everything said earlier in the conversation and reference it naturally

Your role in this conversation:
- You have already reviewed the person's submission form before this conversation began
- You are conducting a deeper qualitative assessment to understand things the form cannot capture
- You ask one focused question at a time — never multiple questions at once
- You listen carefully to answers and ask follow-up questions based on what was said
- You are assessing: depth of founder understanding, realism of financial expectations, team credibility, market clarity, and problem-solution fit
- For investors: investment thesis clarity, risk tolerance, timeline realism, and criteria for success

Important rules:
- Never reveal your internal scoring or assessment criteria
- Never tell the person what score they will receive
- Never ask more than one question per message
- When you have gathered enough information (usually 6-8 exchanges), ask: "Is there anything else you would like me to consider or factor into your assessment?"
- After they respond to that final question, close the conversation warmly and tell them their submission has been saved and they will receive an update within the configured time
- Always sign off as Aria from Annick AI powered by RG Partners
- This conversation is private and will not be shown to anyone — it is purely for your assessment
"""


def build_startup_intro(form_data: dict) -> str:
    return f"""
I have reviewed your submission. Here is what I noted:
- Company targeting: {form_data.get('targetCompanySize', 'N/A')} stage
- Problem you are solving: {form_data.get('problemStatement', 'N/A')}
- Business model: {form_data.get('businessModel', 'N/A')}
- Target market: {form_data.get('targetMarket', 'N/A')}
- Team: {form_data.get('teamDetails', 'N/A')}
- Annual revenue: ${form_data.get('annualRevenue', 0):,}
- Monthly burn rate: ${form_data.get('monthlyBurnRate', 0):,}
- Funding needed: ${form_data.get('fundingNeeded', 0):,}

Now start the conversation. Greet them warmly as Aria from Annick AI, briefly acknowledge what you have seen in their submission, and ask your first focused question to understand them better. Start with understanding the founder's personal motivation.
"""


def build_investor_intro(form_data: dict) -> str:
    return f"""
I have reviewed this investor's submission. Here is what I noted:
- Preferred industry: {form_data.get('preferredIndustry', 'N/A')}
- Investment reason: {form_data.get('investmentReason', 'N/A')}
- Investment budget: ${form_data.get('investmentBudget', 0):,}
- Expected return timeline: {form_data.get('expectedReturnTimeline', 'N/A')}
- Success criteria: {form_data.get('successCriteria', 'N/A')}

Now start the conversation. Greet them warmly as Aria from Annick AI, briefly acknowledge their investment interest, and ask your first focused question to understand their investment thesis and goals more deeply.
"""


def start_session(db: Session, execution_id: int, user_id: int,
                  session_type: str, form_data: dict) -> tuple[str, str]:
    session_id = str(uuid.uuid4())

    if session_type == SessionType.STARTUP:
        intro_prompt = build_startup_intro(form_data)
    else:
        intro_prompt = build_investor_intro(form_data)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": ARIA_SYSTEM_PROMPT},
            {"role": "user", "content": intro_prompt},
        ]
    )
    aria_opening = response.choices[0].message.content

    conversation_history = [
        {"role": "model", "content": aria_opening}
    ]

    session = AISession(
        id=session_id,
        execution_id=execution_id,
        user_id=user_id,
        session_type=session_type,
        status=SessionStatus.ACTIVE,
        conversation_history=conversation_history,
        form_data=form_data
    )
    db.add(session)
    db.commit()

    return session_id, aria_opening


def send_message(db: Session, session_id: str, user_message: str) -> tuple[str, bool]:
    session = db.query(AISession).filter(AISession.id == session_id).first()
    if not session:
        raise ValueError("Session not found")

    history = session.conversation_history or []
    history.append({"role": "user", "content": user_message})

    messages = [{"role": "system", "content": ARIA_SYSTEM_PROMPT}]
    for msg in history:
        role = "user" if msg["role"] == "user" else "assistant"
        messages.append({"role": role, "content": msg["content"]})

    response = client.chat.completions.create(
        model=MODEL,
        messages=messages
    )
    aria_reply = response.choices[0].message.content

    history.append({"role": "model", "content": aria_reply})
    session.conversation_history = history
    db.commit()

    closing_signals = [
        "anything else you would like me to consider",
        "anything else you'd like me to consider",
        "your submission has been saved",
        "you will receive an update",
        "on behalf of rg partners"
    ]
    is_complete = any(signal in aria_reply.lower() for signal in closing_signals)

    return aria_reply, is_complete


def finish_session(db: Session, session_id: str,
                   additional_considerations: str, update_interval: str) -> str:
    session = db.query(AISession).filter(AISession.id == session_id).first()
    if not session:
        raise ValueError("Session not found")

    session.additional_considerations = additional_considerations
    session.status = SessionStatus.COMPLETED

    history = session.conversation_history or []

    if additional_considerations and additional_considerations.strip():
        closing_prompt = f"""
The person has shared these additional considerations: "{additional_considerations}"

Acknowledge their additional input warmly, confirm their submission has been saved,
and let them know they will receive an update within {update_interval}.
Sign off as Aria from Annick AI powered by RG Partners.
"""
        messages = [{"role": "system", "content": ARIA_SYSTEM_PROMPT}]
        for msg in history:
            role = "user" if msg["role"] == "user" else "assistant"
            messages.append({"role": role, "content": msg["content"]})
        messages.append({"role": "user", "content": closing_prompt})

        response = client.chat.completions.create(
            model=MODEL,
            messages=messages
        )
        closing_message = response.choices[0].message.content
    else:
        closing_message = (
            f"Thank you for your time today. Your submission has been saved and "
            f"you will receive an update within {update_interval}. "
            f"Warm regards, Aria — Annick AI, powered by RG Partners."
        )

    history.append({"role": "model", "content": closing_message})
    session.conversation_history = history
    db.commit()

    return closing_message


def get_session(db: Session, session_id: str) -> AISession:
    session = db.query(AISession).filter(AISession.id == session_id).first()
    if not session:
        raise ValueError("Session not found")
    return session
