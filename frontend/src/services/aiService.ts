import { api } from "@/lib/api";

export const aiService = {
  startSession: (data: { type: "STARTUP" | "INVESTOR"; formData: any }) =>
    api.post("/api/ai/session/start", data),

  sendAnswer: (data: { sessionId: string; answer: string }) =>
    api.post("/api/ai/session/respond", data),

  getConfig: () =>
    api.get("/api/config"),
};