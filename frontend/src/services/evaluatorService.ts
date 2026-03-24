import { api } from "@/lib/api";

export const evaluatorService = {
  getReviews: () =>
    api.get("/api/evaluator/reviews"),

  getReviewById: (id: string) =>
    api.get(`/api/evaluator/reviews/${id}`),

  submitDecision: (id: string, data: {
    decision: "APPROVED" | "REJECTED" | "ESCALATED";
    reason: string;
  }) => api.post(`/api/evaluator/reviews/${id}/decision`, data),

  getDashboardStats: () =>
    api.get("/api/evaluator/dashboard"),
};