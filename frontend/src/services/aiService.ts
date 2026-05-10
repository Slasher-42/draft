import axios from "axios";
import { api } from "@/lib/api";

const aiServiceApi = axios.create({
  baseURL: "https://ai-assessment-service.onrender.com",
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

aiServiceApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const aiService = {
  startSession: (data: { type: "STARTUP" | "INVESTOR"; formData: any }) =>
    aiServiceApi.post("/api/conversation/start", {
      execution_id: data.formData.executionId,
      user_id: data.formData.userId,
      session_type: data.type,
      form_data: data.formData,
    }),

  sendAnswer: (data: { sessionId: string; answer: string }) =>
    aiServiceApi.post("/api/conversation/message", {
      session_id: data.sessionId,
      message: data.answer,
    }),

  finishSession: (data: { sessionId: string; additionalConsiderations: string | null }) =>
    aiServiceApi.post("/api/conversation/finish", {
      session_id: data.sessionId,
      additional_considerations: data.additionalConsiderations,
    }),

  triggerScoring: (data: {
    executionId: number;
    weightFinancialHealth: number;
    weightTeamStrength: number;
    weightMarketPotential: number;
    weightBusinessViability: number;
    minimumPassingScore: number;
  }) =>
    aiServiceApi.post("/api/assessment/score", {
      execution_id: data.executionId,
      weight_financial_health: data.weightFinancialHealth,
      weight_team_strength: data.weightTeamStrength,
      weight_market_potential: data.weightMarketPotential,
      weight_business_viability: data.weightBusinessViability,
      minimum_passing_score: data.minimumPassingScore,
    }),

  getConfig: () =>
    api.get("/api/config"),
};