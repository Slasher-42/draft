import axios from "axios";

export const api = axios.create({
  baseURL: "",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const hadToken = !!localStorage.getItem("token");
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      window.location.href = hadToken ? "/login?reason=session_expired" : "/login";
    }
    return Promise.reject(error);
  }
);