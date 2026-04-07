
import axios from "axios";
import { api } from "@/lib/api";


const execServiceApi = axios.create({
  baseURL: "http://localhost:8082",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

execServiceApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const auditServiceApi = axios.create({
  baseURL: "http://localhost:8087",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

auditServiceApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const matchingServiceApi = axios.create({
  baseURL: "http://localhost:8085",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

matchingServiceApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminService = {
  getDashboardStats: async () => {
    const evalServiceApi = axios.create({ baseURL: "http://localhost:8084", timeout: 30000 });
    evalServiceApi.interceptors.request.use((config) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    const [startupsRes, investorsRes, evaluatorsRes, startupExecRes, investorExecRes, reviewsRes] =
      await Promise.allSettled([
        api.get("/api/users?role=STARTUP"),
        api.get("/api/users?role=INVESTOR"),
        api.get("/api/users?role=EVALUATOR"),
        execServiceApi.get("/api/executions/startup/all"),
        execServiceApi.get("/api/executions/investor/all"),
        evalServiceApi.get("/api/evaluator/reviews/all"),
      ]);

    const startups   = startupsRes.status   === "fulfilled" ? (startupsRes.value.data?.data   ?? []) : [];
    const investors  = investorsRes.status  === "fulfilled" ? (investorsRes.value.data?.data  ?? []) : [];
    const evaluators = evaluatorsRes.status === "fulfilled" ? (evaluatorsRes.value.data?.data ?? []) : [];
    const startupExecs  = startupExecRes.status  === "fulfilled" ? (startupExecRes.value.data?.data  ?? []) : [];
    const investorExecs = investorExecRes.status === "fulfilled" ? (investorExecRes.value.data?.data ?? []) : [];
    const reviews = reviewsRes.status === "fulfilled" ? (reviewsRes.value.data?.data ?? []) : [];

    const reviewStatusMap: Record<number, string> = {};
    reviews.forEach((r: any) => {
      if (r.decision) reviewStatusMap[r.executionId] = r.decision;
    });

    const mergedStartups = startupExecs.map((e: any) => ({
      ...e,
      status: reviewStatusMap[e.id] ?? e.status,
    }));

    const allExecs = [...mergedStartups, ...investorExecs];


    const monthCounts: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en-US", { month: "short", year: "numeric" });
      monthCounts[key] = 0;
    }
    allExecs.forEach((e: any) => {
      if (!e.createdAt) return;
      const d = new Date(e.createdAt);
      const key = d.toLocaleString("en-US", { month: "short", year: "numeric" });
      if (key in monthCounts) monthCounts[key] = (monthCounts[key] ?? 0) + 1;
    });
    const executionTrend = Object.entries(monthCounts).map(([date, count]) => ({
      date,
      count,
    }));

   
    const highlyReady    = mergedStartups.filter((e: any) => e.status === "MATCHED").length;
    const moderatelyReady = mergedStartups.filter((e: any) => e.status === "APPROVED").length;
    const notReady       = mergedStartups.filter(
      (e: any) => e.status === "REJECTED" || e.status === "PENDING"
    ).length;

    return {
      data: {
        data: {
          totalExecutions: allExecs.length,
          totalApproved:   allExecs.filter((e: any) => e.status === "APPROVED").length,
          totalRejected:   allExecs.filter((e: any) => e.status === "REJECTED").length,
          totalMatched:    allExecs.filter((e: any) => e.status === "MATCHED").length,
          totalPending:    allExecs.filter((e: any) => e.status === "PENDING").length,
          totalUsers:      startups.length + investors.length + evaluators.length,
          totalStartups:   startups.length,
          totalInvestors:  investors.length,
          totalEvaluators: evaluators.length,
          averageScore: 0,
          scoreByIndustry: [],
          executionTrend,
          classificationDistribution: { highlyReady, moderatelyReady, notReady },
        }
      }
    };
  },

  getAuditLogs: (params?: {
    userId?: string;
    actionType?: string;
    serviceName?: string;
    outcome?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }) => {
    return auditServiceApi.get("/api/admin/audit-logs", { params });
  },

  getSystemConfig: () => api.get("/api/admin/config"),

  updateSystemConfig: (data: any) => api.put("/api/admin/config", data),

  getEvaluators: () => api.get("/api/admin/evaluators"),

  assignEvaluator: (data: { evaluatorId: string; executionId: string }) =>
    api.post("/api/admin/evaluators/assign", data),

  getAllExecutions: (params?: { status?: string; page?: number }) =>
    execServiceApi.get("/api/executions/startup/all").then(async (startupRes) => {
      const investorRes = await execServiceApi.get("/api/executions/investor/all");
      const all = [
        ...(startupRes.data?.data ?? []).map((e: any) => ({ ...e, type: "STARTUP" })),
        ...(investorRes.data?.data ?? []).map((e: any) => ({ ...e, type: "INVESTOR" })),
      ];
      return { data: { data: params?.status ? all.filter(e => e.status === params.status) : all } };
    }),

  getNotifications: () => api.get("/api/admin/notifications"),

  getAllMatches: () => matchingServiceApi.get("/api/matching/admin/all"),

  getAllStartupExecutions: () => execServiceApi.get("/api/executions/startup/all"),

  getAllInvestorExecutions: () => execServiceApi.get("/api/executions/investor/all"),

  getAllUsers: (role?: string) =>
    role ? api.get(`/api/users?role=${role}`) : api.get("/api/users"),
};