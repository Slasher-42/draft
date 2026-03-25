import { api } from "@/lib/api";

export const authService = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),

  register: (data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: string;
  }) => api.post("/api/auth/register", data),

  verify2FA: (email: string, code: string) =>
    api.post("/api/auth/2fa/verify", { email, code }),

  send2FA: (email: string) =>
     api.post(`/api/auth/2fa/send?email=${encodeURIComponent(email)}`),

  forgotPassword: (email: string) =>
    api.post("/api/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    api.post("/api/auth/reset-password", { token, password }),

  getMe: () => api.get("/api/auth/me"),
};