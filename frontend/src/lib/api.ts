import axios from "axios";

export const api = axios.create({
  baseURL: "",
  timeout: 60000,
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
  async (error) => {
    const status = error?.response?.status;
    const requestUrl: string = error?.config?.url ?? "";

    if (status === 401 && typeof window !== "undefined" && !requestUrl.includes("/api/auth/me")) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await api.get("/api/auth/me");
          return Promise.reject(error);
        } catch (confirmError: any) {
          if (confirmError?.response?.status !== 401) {
            return Promise.reject(error);
          }
        }
      }
      const hadToken = !!token;
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      window.location.href = hadToken ? "/login?reason=session_expired" : "/login";
    }
    return Promise.reject(error);
  }
);