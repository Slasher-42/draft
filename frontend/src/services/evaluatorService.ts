import axios from "axios";

const evaluationServiceApi = axios.create({
  baseURL: "http://localhost:8084",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

evaluationServiceApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const evaluatorService = {
  getReviews: () =>
    evaluationServiceApi.get("/api/evaluator/reviews"),

  getReviewById: (id: string) =>
    evaluationServiceApi.get(`/api/evaluator/reviews/${id}`),

  submitDecision: (id: string, data: {
    decision: "APPROVED" | "REJECTED" | "ESCALATED";
    reason: string;
  }) => evaluationServiceApi.post(`/api/evaluator/reviews/${id}/decision`, data),

  getDashboardStats: () =>
    evaluationServiceApi.get("/api/evaluator/dashboard"),

  getEscalatedReviews: () =>
    evaluationServiceApi.get("/api/evaluator/reviews/escalated"),

  submitAdminDecision: (id: string, data: { decision: "APPROVED" | "REJECTED"; reason: string }) =>
    evaluationServiceApi.post(`/api/evaluator/reviews/${id}/admin-decision`, data),
};