import { api } from "@/lib/api";

export const adminService = {
  getDashboardStats: async () => {
    const [startupsRes, investorsRes, evaluatorsRes] = await Promise.allSettled([
      api.get("/api/users?role=STARTUP"),
      api.get("/api/users?role=INVESTOR"),
      api.get("/api/users?role=EVALUATOR"),
    ]);

    const startups = startupsRes.status === "fulfilled"
      ? (startupsRes.value.data?.data ?? []) : [];
    const investors = investorsRes.status === "fulfilled"
      ? (investorsRes.value.data?.data ?? []) : [];
    const evaluators = evaluatorsRes.status === "fulfilled"
      ? (evaluatorsRes.value.data?.data ?? []) : [];

    return {
      data: {
        data: {
          totalExecutions: startups.length + investors.length,
          totalApproved: 0,
          totalRejected: 0,
          totalMatched: 0,
          totalPending: 0,
          averageScore: 0,
          scoreByIndustry: [],
          executionTrend: [],
          classificationDistribution: {
            highlyReady: 0,
            moderatelyReady: 0,
            notReady: 0,
          },
          totalUsers: startups.length + investors.length + evaluators.length,
          totalStartups: startups.length,
          totalInvestors: investors.length,
          totalEvaluators: evaluators.length,
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

  getSystemConfig: () =>
    api.get("/api/admin/config"),

  updateSystemConfig: (data: any) =>
    api.put("/api/admin/config", data),

  getEvaluators: () =>
    api.get("/api/admin/evaluators"),

  assignEvaluator: (data: { evaluatorId: string; executionId: string }) =>
    api.post("/api/admin/evaluators/assign", data),

  getAllExecutions: (params?: { status?: string; page?: number }) =>
    api.get("/api/admin/executions", { params }),

  getNotifications: () =>
    api.get("/api/admin/notifications"),
};