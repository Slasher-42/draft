import axios from "axios";

const startupServiceApi = axios.create({
  baseURL: "http://localhost:8082",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

startupServiceApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const investorService = {
  getExecutions: () =>
    startupServiceApi.get("/api/executions/investor"),

  getExecutionById: (id: string) =>
    startupServiceApi.get(`/api/executions/investor/${id}`),

  createExecution: (data: any) =>
    startupServiceApi.post("/api/executions/investor", data),

  updateExecution: (id: string, data: any) =>
    startupServiceApi.put(`/api/executions/investor/${id}`, data),

  attachAiSession: (executionId: string, aiSessionId: string) =>
    startupServiceApi.patch(
      `/api/executions/investor/${executionId}/ai-session?aiSessionId=${encodeURIComponent(aiSessionId)}`
    ),

  saveConsiderations: (executionId: string, additionalConsiderations: string) =>
    startupServiceApi.patch(
      `/api/executions/investor/${executionId}/considerations?additionalConsiderations=${encodeURIComponent(additionalConsiderations)}`
    ),
};