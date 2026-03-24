import { api } from "@/lib/api";

export const adminService = {
  getDashboardStats: () =>
    api.get("/api/admin/analytics"),

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