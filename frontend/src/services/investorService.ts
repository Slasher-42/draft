import { api } from "@/lib/api";

export const investorService = {
  getExecutions: () =>
    api.get("/api/investor/executions"),

  getExecutionById: (id: string) =>
    api.get(`/api/investor/executions/${id}`),

  createExecution: (data: any) =>
    api.post("/api/investor/executions", data),

  updateExecution: (id: string, data: any) =>
    api.put(`/api/investor/executions/${id}`, data),
};