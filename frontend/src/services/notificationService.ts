import axios from "axios";

const notificationApi = axios.create({
  baseURL: "http://localhost:8086",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

notificationApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const notificationService = {
  getAll: () =>
    notificationApi.get("/api/notifications/my"),

  getUnreadCount: () =>
    notificationApi.get("/api/notifications/my/unread/count"),

  markAsRead: (id: number) =>
    notificationApi.patch(`/api/notifications/${id}/read`),

  markAllAsRead: () =>
    notificationApi.patch("/api/notifications/read-all"),
};