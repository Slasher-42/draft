import axios from 'axios';

const startupServiceApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STARTUP_SERVICE_URL || 'http://localhost:8082',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

startupServiceApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

startupServiceApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAuthRoute = window.location.pathname === '/login'
        || window.location.pathname === '/verify-2fa';
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login?reason=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export default startupServiceApi;
