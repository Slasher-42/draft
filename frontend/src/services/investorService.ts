import { api } from "@/lib/api";

export const investorService = {
  getExecutions: () =>
    api.get("/api/executions/investor"),         

  getExecutionById: (id: string) =>
    api.get(`/api/executions/investor/${id}`),    

  createExecution: (data: any) =>
    api.post("/api/executions/investor", data),   

  updateExecution: (id: string, data: any) =>
    api.put(`/api/executions/investor/${id}`, data), 
};