import axios from "axios";

const matchingServiceApi = axios.create({
  baseURL: "https://investor-matching-and-presentation.onrender.com",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

matchingServiceApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const matchingService = {
  getMatchesForInvestor: (investorUserId: number) =>
    matchingServiceApi.get(`/api/matching/investor/${investorUserId}`),

  getMatchesForStartup: (startupUserId: number) =>
    matchingServiceApi.get(`/api/matching/startup/${startupUserId}`),

  getAllMatches: () =>
    matchingServiceApi.get("/api/matching/admin/all"),
};