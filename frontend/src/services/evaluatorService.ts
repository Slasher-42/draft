import axios from "axios";

const evaluationServiceApi = axios.create({
  baseURL: "",
  timeout: 8000,
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
};