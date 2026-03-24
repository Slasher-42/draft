import { api } from "@/lib/api";

export const startupService = {
  getExecutions: () =>
    api.get("/api/startup/executions"),

  getExecutionById: (id: string) =>
    api.get(`/api/startup/executions/${id}`),

  createExecution: (data: any) =>
    api.post("/api/startup/executions", data),

  updateExecution: (id: string, data: any) =>
    api.put(`/api/startup/executions/${id}`, data),
};