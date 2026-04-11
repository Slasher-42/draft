import axios from "axios";

const followupApi = axios.create({
  baseURL: "http://localhost:8088",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

followupApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const followupService = {
  // ── Meetups ────────────────────────────────────────────
  getAllMeetups: () =>
    followupApi.get("/api/followup/meetups"),

  getMyMeetups: () =>
    followupApi.get("/api/followup/meetups/my"),

  getMeetupById: (id: number) =>
    followupApi.get(`/api/followup/meetups/${id}`),

  getMeetupByRoom: (roomId: string) =>
    followupApi.get(`/api/followup/meetups/room/${roomId}`),

  scheduleMeetup: (payload: {
    matchId: number;
    investorUserId: number;
    startupUserId: number;
    scheduledAt: string;
    adminNotes?: string;
  }) => followupApi.post("/api/followup/meetups", payload),

  updateMeetupStatus: (id: number, payload: { status: string; adminNotes?: string }) =>
    followupApi.patch(`/api/followup/meetups/${id}/status`, payload),

  // ── Contracts ──────────────────────────────────────────
  getAllContracts: () =>
    followupApi.get("/api/followup/contracts"),

  getMyContracts: () =>
    followupApi.get("/api/followup/contracts/my"),

  getContractById: (id: number) =>
    followupApi.get(`/api/followup/contracts/${id}`),

  createContract: (payload: { meetupId: number; contractDetails: string }) =>
    followupApi.post("/api/followup/contracts", payload),

  signContract: (id: number, signature: string) =>
    followupApi.post(`/api/followup/contracts/${id}/sign`, { signature }),

  validateContract: (id: number, adminValidationSignature: string) =>
    followupApi.patch(`/api/followup/contracts/${id}/validate`, {
      adminValidationSignature,
    }),

  // ── Accounts ───────────────────────────────────────────
  getMyAccount: () =>
    followupApi.get("/api/followup/accounts/me"),

  deposit: (payload: { amount: number; paymentMethod: string }) =>
    followupApi.post("/api/followup/accounts/deposit", payload),

  invest: (payload: { matchId: number; amount: number; description?: string }) =>
    followupApi.post("/api/followup/accounts/invest", payload),

  getMyTransactions: () =>
    followupApi.get("/api/followup/accounts/transactions"),
};
