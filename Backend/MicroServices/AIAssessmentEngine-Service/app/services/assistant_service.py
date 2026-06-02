import asyncio
from datetime import date
from groq import Groq
import httpx
from app.config import settings

groq_client = Groq(api_key=settings.GROQ_API_KEY)
MODEL = "llama-3.3-70b-versatile"

USER_SVC = settings.USER_MANAGEMENT_URL
STARTUP_SVC = settings.STARTUP_SERVICE_URL
EVAL_SVC = settings.EVALUATION_SERVICE_URL


async def _get(client: httpx.AsyncClient, url: str, token: str):
    try:
        res = await client.get(
            url,
            headers={"Authorization": f"Bearer {token}"},
            timeout=10.0,
        )
        if res.status_code == 200:
            body = res.json()
            return body.get("data", body)
        return None
    except Exception:
        return None


def _fmt_execs(execs: list, name_key="companyName") -> str:
    if not execs:
        return "None yet."
    lines = []
    for e in execs[:15]:
        name = e.get(name_key) or e.get("organizationName") or f"#{e.get('id','?')}"
        industry = e.get("industry") or e.get("preferredIndustry") or "N/A"
        country = e.get("country", "N/A")
        status = e.get("status", "PENDING")
        lines.append(f"  • {name} | {industry} | {country} | {status}")
    return "\n".join(lines)


async def _startup_context(token: str, user_data: dict) -> str:
    async with httpx.AsyncClient() as c:
        my_execs, investors = await asyncio.gather(
            _get(c, f"{STARTUP_SVC}/api/executions/startup", token),
            _get(c, f"{USER_SVC}/api/users?role=INVESTOR", token),
        )

    exec_list = my_execs if isinstance(my_execs, list) else []
    inv_list = investors if isinstance(investors, list) else []
    p = user_data.get("startupProfile") or {}

    counts = {s: sum(1 for e in exec_list if e.get("status") == s)
              for s in ("PENDING", "APPROVED", "REJECTED", "MATCHED")}
    industries = list({
        inv.get("investorProfile", {}).get("preferredIndustry")
        for inv in inv_list
        if (inv.get("investorProfile") or {}).get("preferredIndustry")
    })
    budgets = list({
        inv.get("investorProfile", {}).get("investmentBudgetRange")
        for inv in inv_list
        if (inv.get("investorProfile") or {}).get("investmentBudgetRange")
    })

    return f"""
CURRENT USER:
  Name: {user_data.get('fullName','N/A')} | Role: STARTUP
  Company: {p.get('companyName','Not set')} | Industry: {p.get('industry','Not set')}
  Country: {p.get('country','Not set')} | Team: {p.get('teamSize','?')} | Founded: {p.get('foundedYear','?')}

YOUR SUBMISSIONS ({len(exec_list)} total):
  Pending={counts['PENDING']}  Approved={counts['APPROVED']}  Rejected={counts['REJECTED']}  Matched={counts['MATCHED']}
{_fmt_execs(exec_list)}

INVESTOR LANDSCAPE ({len(inv_list)} investors in platform):
  Industries they prefer: {', '.join(industries) or 'Various'}
  Budget ranges available: {', '.join(budgets) or 'Various'}
"""


async def _investor_context(token: str, user_data: dict) -> str:
    async with httpx.AsyncClient() as c:
        my_execs, all_startups = await asyncio.gather(
            _get(c, f"{STARTUP_SVC}/api/executions/investor", token),
            _get(c, f"{STARTUP_SVC}/api/executions/startup/all", token),
        )

    exec_list = my_execs if isinstance(my_execs, list) else []
    startup_list = all_startups if isinstance(all_startups, list) else []
    p = user_data.get("investorProfile") or {}

    approved = [s for s in startup_list if s.get("status") in ("APPROVED", "MATCHED")]
    pending = [s for s in startup_list if s.get("status") == "PENDING"]

    industry_count: dict = {}
    region_count: dict = {}
    for s in startup_list:
        ind = s.get("industry", "Unknown")
        cnt = s.get("country", "Unknown")
        industry_count[ind] = industry_count.get(ind, 0) + 1
        region_count[cnt] = region_count.get(cnt, 0) + 1

    top_industries = ", ".join(
        f"{k}({v})" for k, v in sorted(industry_count.items(), key=lambda x: -x[1])[:8]
    )
    top_regions = ", ".join(
        f"{k}({v})" for k, v in sorted(region_count.items(), key=lambda x: -x[1])[:6]
    )

    return f"""
CURRENT USER:
  Name: {user_data.get('fullName','N/A')} | Role: INVESTOR
  Organization: {p.get('organizationName','Not set')}
  Preferred Industry: {p.get('preferredIndustry','Not set')}
  Budget Range: {p.get('investmentBudgetRange','Not set')}
  Country: {p.get('country','Not set')}

YOUR ASSESSMENTS ({len(exec_list)} total):
{_fmt_execs(exec_list, 'organizationName')}

ALL STARTUPS IN PLATFORM:
  Total: {len(startup_list)} | Approved/Ready: {len(approved)} | Pending: {len(pending)}
  Top industries: {top_industries or 'Various'}
  Top regions: {top_regions or 'Various'}

APPROVED STARTUPS (sample):
{_fmt_execs(approved[:10])}
"""


async def _admin_context(token: str, user_data: dict) -> str:
    async with httpx.AsyncClient() as c:
        startups, investors, evaluators, s_execs, i_execs, reviews = await asyncio.gather(
            _get(c, f"{USER_SVC}/api/users?role=STARTUP", token),
            _get(c, f"{USER_SVC}/api/users?role=INVESTOR", token),
            _get(c, f"{USER_SVC}/api/users?role=EVALUATOR", token),
            _get(c, f"{STARTUP_SVC}/api/executions/startup/all", token),
            _get(c, f"{STARTUP_SVC}/api/executions/investor/all", token),
            _get(c, f"{EVAL_SVC}/api/evaluator/reviews/all", token),
        )

    su = startups if isinstance(startups, list) else []
    inv = investors if isinstance(investors, list) else []
    ev = evaluators if isinstance(evaluators, list) else []
    se = s_execs if isinstance(s_execs, list) else []
    ie = i_execs if isinstance(i_execs, list) else []
    rv = reviews if isinstance(reviews, list) else []

    def cnt(lst, status): return sum(1 for x in lst if x.get("status") == status)
    escalated = sum(1 for r in rv if r.get("decision") == "ESCALATED" or r.get("status") == "ESCALATED")

    ind_map: dict = {}
    for e in se:
        k = e.get("industry", "Unknown")
        ind_map[k] = ind_map.get(k, 0) + 1
    top_ind = ", ".join(f"{k}({v})" for k, v in sorted(ind_map.items(), key=lambda x: -x[1])[:8])

    return f"""
CURRENT USER:
  Name: {user_data.get('fullName','N/A')} | Role: ADMIN (full platform access)

PLATFORM USERS:
  Startups: {len(su)} | Investors: {len(inv)} | Evaluators: {len(ev)} | Total: {len(su)+len(inv)+len(ev)}

STARTUP SUBMISSIONS ({len(se)} total):
  Pending={cnt(se,'PENDING')}  Approved={cnt(se,'APPROVED')}  Rejected={cnt(se,'REJECTED')}  Matched={cnt(se,'MATCHED')}
  Top industries: {top_ind or 'Various'}

INVESTOR ASSESSMENTS ({len(ie)} total):
  Pending={cnt(ie,'PENDING')}  Approved={cnt(ie,'APPROVED')}  Rejected={cnt(ie,'REJECTED')}

REVIEW QUEUE ({len(rv)} total):
  Approved decisions: {sum(1 for r in rv if r.get('decision')=='APPROVED')}
  Rejected decisions: {sum(1 for r in rv if r.get('decision')=='REJECTED')}
  Escalated to admin: {escalated}
"""


async def _evaluator_context(token: str, user_data: dict) -> str:
    async with httpx.AsyncClient() as c:
        my_reviews, dashboard, escalated = await asyncio.gather(
            _get(c, f"{EVAL_SVC}/api/evaluator/reviews", token),
            _get(c, f"{EVAL_SVC}/api/evaluator/dashboard", token),
            _get(c, f"{EVAL_SVC}/api/evaluator/reviews/escalated", token),
        )

    rv = my_reviews if isinstance(my_reviews, list) else []
    esc = escalated if isinstance(escalated, list) else []
    p = user_data.get("evaluatorProfile") or {}

    pending = [r for r in rv if not r.get("decision") or r.get("decision") == "PENDING"]
    decided = [r for r in rv if r.get("decision") in ("APPROVED", "REJECTED")]

    pending_lines = "\n".join(
        f"  • Review #{r.get('id','?')} | {r.get('companyName') or r.get('executionId','Unknown')} | Submitted: {r.get('submittedAt','N/A')}"
        for r in pending[:10]
    ) or "  All caught up — no pending reviews!"

    return f"""
CURRENT USER:
  Name: {user_data.get('fullName','N/A')} | Role: EVALUATOR
  Department: {p.get('department','Not set')} | Specialization: {p.get('specialization','Not set')}

YOUR REVIEW QUEUE ({len(rv)} total):
  Pending decision: {len(pending)} | Decided: {len(decided)} | Escalated: {len(esc)}

PENDING REVIEWS:
{pending_lines}
"""


async def build_system_prompt(token: str, user_data: dict) -> str:
    role = (user_data.get("role") or "").replace("ROLE_", "").upper()
    today = date.today().strftime("%A, %B %d, %Y")

    if role == "STARTUP":
        context = await _startup_context(token, user_data)
    elif role == "INVESTOR":
        context = await _investor_context(token, user_data)
    elif role == "ADMIN":
        context = await _admin_context(token, user_data)
    elif role == "EVALUATOR":
        context = await _evaluator_context(token, user_data)
    else:
        context = f"Name: {user_data.get('fullName','N/A')} | Role: {role}"

    return f"""You are Aria, an AI assistant integrated into the Investment Readiness Assessment platform by Annick AI powered by RG Partners.
Today is {today}.

LIVE PLATFORM DATA (fetched just now):
{context}

YOUR CAPABILITIES:
- Answer any platform-specific question using the live data above
- Answer general knowledge questions freely: finance, business strategy, startups, investing, markets, economics, technology, etc.
- Help with idea expansion, business planning, pitch preparation, due diligence, valuation
- You are a general-purpose intelligent assistant — not limited to platform topics

TONE: Warm, professional, direct. Use bullet points for clarity when listing multiple items. Be concise unless depth is requested."""


def stream_chat(system_prompt: str, messages: list):
    """Sync generator — yields bytes for FastAPI StreamingResponse."""
    stream = groq_client.chat.completions.create(
        model=MODEL,
        max_tokens=1024,
        stream=True,
        messages=[{"role": "system", "content": system_prompt}, *messages],
    )
    for chunk in stream:
        text = chunk.choices[0].delta.content or ""
        if text:
            yield text.encode("utf-8")
