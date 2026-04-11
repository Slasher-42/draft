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

export const startupService = {
  getExecutions: () =>
    startupServiceApi.get("/api/executions/startup"),

  getExecutionById: (id: string) =>
    startupServiceApi.get(`/api/executions/startup/${id}`),

  createExecution: (data: any) =>
    startupServiceApi.post("/api/executions/startup", data),

  updateExecution: (id: string, data: any) =>
    startupServiceApi.put(`/api/executions/startup/${id}`, data),

  attachAiSession: (executionId: string, aiSessionId: string) =>
    startupServiceApi.patch(`/api/executions/startup/${executionId}/ai-session?aiSessionId=${encodeURIComponent(aiSessionId)}`),

  saveConsiderations: (executionId: string, additionalConsiderations: string) =>
    startupServiceApi.patch(`/api/executions/startup/${executionId}/considerations?additionalConsiderations=${encodeURIComponent(additionalConsiderations)}`),

  getExecutionByIdInternal: (id: number | string) =>
    startupServiceApi.get(`/api/executions/startup/internal/${id}`),

  withdrawExecution: (id: string) =>
    startupServiceApi.delete(`/api/executions/startup/${id}`),

  uploadExecutionImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return startupServiceApi.patch(`/api/executions/startup/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};