import axios from "axios";

const notificationApi = axios.create({
  baseURL: "https://reporting-notification-service.onrender.com",
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

  getAllForAdmin: () =>
    notificationApi.get("/api/notifications/all"),

  getAnalytics: () =>
    notificationApi.get("/api/analytics"),

  getUnreadCount: () =>
    notificationApi.get("/api/notifications/my/unread/count"),

  markAsRead: (id: number) =>
    notificationApi.patch(`/api/notifications/${id}/read`),

  markAllAsRead: () =>
    notificationApi.patch("/api/notifications/read-all"),
};