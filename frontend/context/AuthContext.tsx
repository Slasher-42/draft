'use client';
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { api } from '@/lib/api';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { decodeJwtPayload } from '@/lib/utils';
import { TOKEN_KEY } from '@/lib/constants';
import type { UserResponse } from '@/types/user';
import type { LoginStepOneResponse } from '@/types/auth';

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginStepOneResponse>;
  completeTwoFactor: (email: string, code: string) => Promise<UserResponse>;
  setUserFromTrustedLogin: (stepOne: LoginStepOneResponse) => Promise<UserResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function setAxiosToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

function extractUserId(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const raw = payload['id'];
  if (raw === undefined || raw === null) return null;
  const id = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]         = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) { setIsLoading(false); return; }

      setAxiosToken(token);
      const userId = extractUserId(token);
      if (!userId) {
        localStorage.removeItem(TOKEN_KEY);
        setAxiosToken(null);
        setIsLoading(false);
        return;
      }

      try {
        const userData = await userService.getById(userId);
        setUser(userData);
      } catch {
        const newToken = await authService.refreshToken();
        if (newToken) {
          const newId = extractUserId(newToken);
          if (newId) {
            try {
              const userData = await userService.getById(newId);
              setUser(userData);
            } catch {
              authService.logout();
              setAxiosToken(null);
            }
          }
        } else {
          authService.logout();
          setAxiosToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string): Promise<LoginStepOneResponse> => {
    return await authService.login(email, password);
  };

  const completeTwoFactor = async (email: string, code: string): Promise<UserResponse> => {
    const auth = await authService.verifyTwoFactorCode(email, code);
    setAxiosToken(auth.accessToken);
    const userId = extractUserId(auth.accessToken);
    if (!userId) throw new Error('Invalid token received');
    const userData = await userService.getById(userId);
    setUser(userData);
    return userData;
  };

  const setUserFromTrustedLogin = async (stepOne: LoginStepOneResponse): Promise<UserResponse> => {
    const token = authService.getToken();
    if (!token) throw new Error('No token');
    setAxiosToken(token);
    const userId = extractUserId(token);
    if (!userId) throw new Error('Cannot extract user ID');
    const fetchedUser = await userService.getById(userId);
    setUser(fetchedUser);
    return fetchedUser;
  };

  const logout = () => {
    authService.logout();
    setAxiosToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    const userId = extractUserId(token);
    if (!userId) return;
    const userData = await userService.getById(userId);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, completeTwoFactor, setUserFromTrustedLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};