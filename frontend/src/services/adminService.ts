
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

export const adminService = {
  getDashboardStats: async () => {
    const [startupsRes, investorsRes, evaluatorsRes, startupExecRes, investorExecRes] =
      await Promise.allSettled([
        api.get("/api/users?role=STARTUP"),
        api.get("/api/users?role=INVESTOR"),
        api.get("/api/users?role=EVALUATOR"),
        execServiceApi.get("/api/executions/startup/all"),   
        execServiceApi.get("/api/executions/investor/all"),  
      ]);

    const startups   = startupsRes.status   === "fulfilled" ? (startupsRes.value.data?.data   ?? []) : [];
    const investors  = investorsRes.status  === "fulfilled" ? (investorsRes.value.data?.data  ?? []) : [];
    const evaluators = evaluatorsRes.status === "fulfilled" ? (evaluatorsRes.value.data?.data ?? []) : [];

    const startupExecs  = startupExecRes.status  === "fulfilled" ? (startupExecRes.value.data?.data  ?? []) : [];
    const investorExecs = investorExecRes.status === "fulfilled" ? (investorExecRes.value.data?.data ?? []) : [];

   
    if (startupExecRes.status === "rejected") {
      console.error("[adminService] startup/all failed:", startupExecRes.reason?.response?.status, startupExecRes.reason?.message);
    }
    if (investorExecRes.status === "rejected") {
      console.error("[adminService] investor/all failed:", investorExecRes.reason?.response?.status, investorExecRes.reason?.message);
    }

    const allExecs = [...startupExecs, ...investorExecs];

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
          executionTrend: [],
          classificationDistribution: { highlyReady: 0, moderatelyReady: 0, notReady: 0 },
        }
      }
    };
  },

  getAuditLogs: (params?: {
    userId?: string;
    actionType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
  }) => api.get("/api/admin/audit-logs", { params }),

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
};