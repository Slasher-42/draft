import axios from "axios";
import { User } from "@/types/user";

const BASE_STARTUP_SVC = "https://startupapplicationservice.onrender.com";
const BASE_EVAL_SVC = "https://evaluation-and-decision-service.onrender.com";
const BASE_USER_SVC = "https://usermanagement-microservice.onrender.com";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
}

async function safeGet<T = any>(url: string): Promise<T | null> {
  try {
    const res = await axios.get(url, { headers: authHeaders(), timeout: 12000 });
    return (res.data?.data ?? res.data) as T;
  } catch {
    return null;
  }
}

function fmt(n: number | undefined) {
  return n?.toLocaleString() ?? "0";
}

function summariseExecution(e: any): string {
  const company = e.companyName ?? e.organizationName ?? e.id;
  const status = e.status ?? "PENDING";
  const industry = e.industry ?? e.preferredIndustry ?? "N/A";
  const country = e.country ?? "N/A";
  return `• ${company} | Industry: ${industry} | Country: ${country} | Status: ${status}`;
}

async function buildStartupContext(user: User): Promise<string> {
  const [myExecs, investors] = await Promise.all([
    safeGet<any[]>(`${BASE_STARTUP_SVC}/api/executions/startup`),
    safeGet<any[]>(`${BASE_USER_SVC}/api/users?role=INVESTOR`),
  ]);

  const profile = user.startupProfile;
  const execList = Array.isArray(myExecs) ? myExecs : [];
  const investorList = Array.isArray(investors) ? investors : [];

  const statusCounts = { PENDING: 0, APPROVED: 0, REJECTED: 0, MATCHED: 0 };
  execList.forEach((e: any) => {
    const s = e.status as keyof typeof statusCounts;
    if (s in statusCounts) statusCounts[s]++;
  });

  const investorIndustries = [
    ...new Set(
      investorList
        .map((inv: any) => inv.investorProfile?.preferredIndustry)
        .filter(Boolean)
    ),
  ];
  const budgetRanges = [
    ...new Set(
      investorList
        .map((inv: any) => inv.investorProfile?.investmentBudgetRange)
        .filter(Boolean)
    ),
  ];

  return `
CURRENT USER:
- Name: ${user.fullName}
- Role: STARTUP
- Company: ${profile?.companyName ?? "Not set"}
- Industry: ${profile?.industry ?? "Not set"}
- Country: ${profile?.country ?? "Not set"}
- City: ${profile?.city ?? "Not set"}
- Team size: ${profile?.teamSize ?? "Not set"}
- Founded: ${profile?.foundedYear ?? "Not set"}

YOUR SUBMISSIONS IN THE SYSTEM (${execList.length} total):
${execList.length === 0 ? "No submissions yet." : execList.map(summariseExecution).join("\n")}

SUBMISSION STATUS SUMMARY:
- Pending review: ${statusCounts.PENDING}
- Approved: ${statusCounts.APPROVED}
- Rejected: ${statusCounts.REJECTED}
- Matched with investor: ${statusCounts.MATCHED}

INVESTOR LANDSCAPE (${fmt(investorList.length)} investors in the system):
- Industries investors prefer: ${investorIndustries.length > 0 ? investorIndustries.join(", ") : "Various"}
- Investment budget ranges available: ${budgetRanges.length > 0 ? budgetRanges.join(", ") : "Various"}
`;
}

async function buildInvestorContext(user: User): Promise<string> {
  const [myExecs, allStartups] = await Promise.all([
    safeGet<any[]>(`${BASE_STARTUP_SVC}/api/executions/investor`),
    safeGet<any[]>(`${BASE_STARTUP_SVC}/api/executions/startup/all`),
  ]);

  const profile = user.investorProfile;
  const execList = Array.isArray(myExecs) ? myExecs : [];
  const startupList = Array.isArray(allStartups) ? allStartups : [];

  const approvedStartups = startupList.filter((s: any) =>
    ["APPROVED", "MATCHED"].includes(s.status)
  );
  const pendingStartups = startupList.filter(
    (s: any) => s.status === "PENDING"
  );

  const industryBreakdown = startupList.reduce(
    (acc: Record<string, number>, s: any) => {
      const ind = s.industry ?? "Unknown";
      acc[ind] = (acc[ind] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const regionBreakdown = startupList.reduce(
    (acc: Record<string, number>, s: any) => {
      const c = s.country ?? "Unknown";
      acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const topIndustries = Object.entries(industryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([ind, cnt]) => `${ind} (${cnt})`)
    .join(", ");

  const topRegions = Object.entries(regionBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([c, cnt]) => `${c} (${cnt})`)
    .join(", ");

  const sampleApproved = approvedStartups.slice(0, 10).map(summariseExecution).join("\n");

  return `
CURRENT USER:
- Name: ${user.fullName}
- Role: INVESTOR
- Organization: ${profile?.organizationName ?? "Not set"}
- Preferred Industry: ${profile?.preferredIndustry ?? "Not set"}
- Investment Budget Range: ${profile?.investmentBudgetRange ?? "Not set"}
- Country: ${profile?.country ?? "Not set"}
- City: ${profile?.city ?? "Not set"}

YOUR ASSESSMENTS (${execList.length} total):
${execList.length === 0 ? "No assessments yet." : execList.map(summariseExecution).join("\n")}

ALL STARTUPS IN THE SYSTEM:
- Total startups: ${fmt(startupList.length)}
- Approved / Ready for matching: ${fmt(approvedStartups.length)}
- Pending review: ${fmt(pendingStartups.length)}
- Industries represented: ${topIndustries || "Various"}
- Top regions: ${topRegions || "Various"}

SAMPLE APPROVED STARTUPS:
${sampleApproved || "None available yet."}
`;
}

async function buildAdminContext(user: User): Promise<string> {
  const [startups, investors, evaluators, startupExecs, investorExecs, reviews] =
    await Promise.all([
      safeGet<any[]>(`${BASE_USER_SVC}/api/users?role=STARTUP`),
      safeGet<any[]>(`${BASE_USER_SVC}/api/users?role=INVESTOR`),
      safeGet<any[]>(`${BASE_USER_SVC}/api/users?role=EVALUATOR`),
      safeGet<any[]>(`${BASE_STARTUP_SVC}/api/executions/startup/all`),
      safeGet<any[]>(`${BASE_STARTUP_SVC}/api/executions/investor/all`),
      safeGet<any[]>(`${BASE_EVAL_SVC}/api/evaluator/reviews/all`),
    ]);

  const startupList = Array.isArray(startups) ? startups : [];
  const investorList = Array.isArray(investors) ? investors : [];
  const evaluatorList = Array.isArray(evaluators) ? evaluators : [];
  const sExecs = Array.isArray(startupExecs) ? startupExecs : [];
  const iExecs = Array.isArray(investorExecs) ? investorExecs : [];
  const reviewList = Array.isArray(reviews) ? reviews : [];

  const countByStatus = (arr: any[], status: string) =>
    arr.filter((e) => e.status === status).length;

  const escalated = reviewList.filter(
    (r: any) => r.decision === "ESCALATED" || r.status === "ESCALATED"
  ).length;

  const industryMap = sExecs.reduce((acc: Record<string, number>, e: any) => {
    const ind = e.industry ?? "Unknown";
    acc[ind] = (acc[ind] ?? 0) + 1;
    return acc;
  }, {});
  const topIndustries = Object.entries(industryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([ind, cnt]) => `${ind} (${cnt})`)
    .join(", ");

  return `
CURRENT USER:
- Name: ${user.fullName}
- Role: ADMIN (full platform access)

PLATFORM USERS:
- Total startups: ${fmt(startupList.length)}
- Total investors: ${fmt(investorList.length)}
- Total evaluators: ${fmt(evaluatorList.length)}
- Grand total users: ${fmt(startupList.length + investorList.length + evaluatorList.length)}

STARTUP EXECUTIONS / SUBMISSIONS (${fmt(sExecs.length)} total):
- Pending review: ${fmt(countByStatus(sExecs, "PENDING"))}
- Approved: ${fmt(countByStatus(sExecs, "APPROVED"))}
- Rejected: ${fmt(countByStatus(sExecs, "REJECTED"))}
- Matched with investor: ${fmt(countByStatus(sExecs, "MATCHED"))}
- Industries represented: ${topIndustries || "Various"}

INVESTOR ASSESSMENTS (${fmt(iExecs.length)} total):
- Pending: ${fmt(countByStatus(iExecs, "PENDING"))}
- Approved: ${fmt(countByStatus(iExecs, "APPROVED"))}
- Rejected: ${fmt(countByStatus(iExecs, "REJECTED"))}

REVIEW QUEUE:
- Total reviews on record: ${fmt(reviewList.length)}
- Escalated to admin: ${fmt(escalated)}
- Approved decisions: ${fmt(reviewList.filter((r: any) => r.decision === "APPROVED").length)}
- Rejected decisions: ${fmt(reviewList.filter((r: any) => r.decision === "REJECTED").length)}
`;
}

async function buildEvaluatorContext(user: User): Promise<string> {
  const [myReviews, dashStats, escalated] = await Promise.all([
    safeGet<any[]>(`${BASE_EVAL_SVC}/api/evaluator/reviews`),
    safeGet<any>(`${BASE_EVAL_SVC}/api/evaluator/dashboard`),
    safeGet<any[]>(`${BASE_EVAL_SVC}/api/evaluator/reviews/escalated`),
  ]);

  const profile = user.evaluatorProfile;
  const reviewList = Array.isArray(myReviews) ? myReviews : [];
  const escalatedList = Array.isArray(escalated) ? escalated : [];

  const pending = reviewList.filter(
    (r: any) => !r.decision || r.decision === "PENDING" || r.status === "PENDING"
  );
  const decided = reviewList.filter(
    (r: any) => r.decision === "APPROVED" || r.decision === "REJECTED"
  );

  const pendingDetails = pending
    .slice(0, 10)
    .map(
      (r: any) =>
        `• Review #${r.id ?? r.executionId} | Startup: ${r.companyName ?? r.executionId ?? "Unknown"} | Submitted: ${r.submittedAt ?? r.createdAt ?? "N/A"}`
    )
    .join("\n");

  return `
CURRENT USER:
- Name: ${user.fullName}
- Role: EVALUATOR
- Department: ${profile?.department ?? "Not set"}
- Specialization: ${profile?.specialization ?? "Not set"}
- Country: ${profile?.country ?? "Not set"}

YOUR REVIEW QUEUE (${fmt(reviewList.length)} total assigned):
- Pending decision: ${fmt(pending.length)}
- Decided (approved/rejected): ${fmt(decided.length)}
- Escalated to admin: ${fmt(escalatedList.length)}

PENDING REVIEWS NEEDING DECISION:
${pending.length === 0 ? "All reviews are decided — great work!" : pendingDetails}

${dashStats ? `DASHBOARD STATS FROM SERVER:\n${JSON.stringify(dashStats, null, 2)}` : ""}
`;
}

export async function buildSystemPrompt(user: User): Promise<string> {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const roleContext = await (async () => {
    if (user.role === "STARTUP") return buildStartupContext(user);
    if (user.role === "INVESTOR") return buildInvestorContext(user);
    if (user.role === "ADMIN") return buildAdminContext(user);
    if (user.role === "EVALUATOR") return buildEvaluatorContext(user);
    return "";
  })();

  return `You are Aria, an AI assistant integrated into the Investment Readiness Assessment platform by Annick AI powered by RG Partners.
Today is ${today}.

${roleContext}

YOUR CAPABILITIES:
- Answer any platform-specific question using the live data above
- Answer any general knowledge question freely (finance, business strategy, startups, investing, markets, economics, science, technology, etc.)
- Help with idea expansion, business planning, pitch preparation, due diligence
- You are NOT limited to platform questions — you are a general-purpose intelligent assistant

TONE: Warm, professional, direct. Format complex answers with bullet points or numbered lists for clarity. Keep answers concise unless depth is needed.`;
}

export function getWelcomeMessage(user: User): string {
  const name = user.fullName?.split(" ")[0] ?? "there";
  if (user.role === "STARTUP") {
    const company = user.startupProfile?.companyName;
    return `Hi ${name}! 👋 I'm Aria, your AI assistant. ${company ? `I can see you're working on **${company}**. ` : ""}I have your live platform data loaded — ask me anything about your submissions, what investors are looking for, or any business, finance, or strategy question. How can I help you today?`;
  }
  if (user.role === "INVESTOR") {
    return `Hi ${name}! 👋 I'm Aria. I've loaded the latest startup data from the platform. Ask me about available startups, which ones match your investment criteria, due diligence questions, or anything else on your mind.`;
  }
  if (user.role === "ADMIN") {
    return `Hi ${name}! 👋 I'm Aria. I have full access to the platform's live data — users, submissions, reviews, escalations. Ask me anything about the system or any general question.`;
  }
  if (user.role === "EVALUATOR") {
    return `Hi ${name}! 👋 I'm Aria. I've loaded your current review queue and assignment data. Ask me about pending reviews, evaluation criteria, or any general question.`;
  }
  return `Hi ${name}! 👋 I'm Aria, your AI assistant. How can I help you today?`;
}
