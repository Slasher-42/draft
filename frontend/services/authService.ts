import { api } from '@/lib/api';
import type { RegisterRequest, FullAuthResponse, LoginStepOneResponse } from '@/types/auth';
import type { UserResponse } from '@/types/user';
import type { ApiResponse } from '@/types/common';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants';

const TRUSTED_DEVICE_KEY = 'trusted_device_token';

export const authService = {
  async register(data: RegisterRequest): Promise<UserResponse> {
    const res = await api.post<ApiResponse<UserResponse>>('/api/auth/register', data);
    return res.data.data;
  },

  async login(email: string, password: string): Promise<LoginStepOneResponse> {
    const trustedToken = this.getTrustedDeviceToken();
    const headers: Record<string, string> = {};
    if (trustedToken) {
      headers['X-Trusted-Device'] = trustedToken;
    }
    const res = await api.post<LoginStepOneResponse>(
      '/api/auth/login',
      { email, password },
      { headers }
    );
    return res.data;
  },

  async sendTwoFactorCode(email: string): Promise<void> {
    await api.post(`/api/auth/2fa/send?email=${encodeURIComponent(email)}`);
  },

  async verifyTwoFactorCode(email: string, code: string): Promise<FullAuthResponse> {
    const res = await api.post<ApiResponse<FullAuthResponse>>('/api/auth/2fa/verify', { email, code });
    const auth = res.data.data;
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, auth.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
      if (auth.trustedDeviceToken) {
        localStorage.setItem(TRUSTED_DEVICE_KEY, auth.trustedDeviceToken);
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${auth.accessToken}`;
    }
    return auth;
  },

  storeTrustedLoginResult(response: LoginStepOneResponse): void {
    if (typeof window === 'undefined') return;
    if (response.accessToken) {
      localStorage.setItem(TOKEN_KEY, response.accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
    }
    if (response.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    }
    if (response.trustedDeviceToken) {
      localStorage.setItem(TRUSTED_DEVICE_KEY, response.trustedDeviceToken);
    }
  },

  async refreshToken(): Promise<string | null> {
    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem(REFRESH_TOKEN_KEY)
      : null;
    if (!refreshToken) return null;
    try {
      const res = await api.post<ApiResponse<FullAuthResponse>>('/api/auth/refresh', { refreshToken });
      const newToken = res.data.data.accessToken;
      localStorage.setItem(TOKEN_KEY, newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return newToken;
    } catch {
      return null;
    }
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      delete api.defaults.headers.common['Authorization'];
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getTrustedDeviceToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TRUSTED_DEVICE_KEY);
  },
};