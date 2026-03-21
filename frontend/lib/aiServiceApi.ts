import axios from 'axios';

const aiServiceApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8083',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

aiServiceApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

aiServiceApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login?reason=session_expired';
    }
    return Promise.reject(error);
  }
);

export default aiServiceApi;