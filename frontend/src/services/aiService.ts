import axios from "axios";

const aiServiceApi = axios.create({
  baseURL: "",
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

  getConfig: () =>
    aiServiceApi.get("/api/config"),
};