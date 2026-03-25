"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User, UserRole } from "@/types/user";
import { api } from "@/lib/api";
import { toast } from "react-toastify";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (accessToken: string, userId: string, email: string, role: UserRole, trustedDeviceToken?: string) => void;
  register: (
    fullName: string,
    email: string,
    password: string,
    phoneNumber: string,
    role: UserRole
  ) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleRedirectMap: Record<UserRole, string> = {
  STARTUP: "/startup/executions",
  INVESTOR: "/investor/executions",
  EVALUATOR: "/evaluator/dashboard",
  ADMIN: "/admin/dashboard",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/api/auth/me");
      const raw = res.data?.data ?? res.data;
      setUser({
        id: String(raw.id),
        fullName: raw.fullName ?? "",
        email: raw.email ?? "",
        phoneNumber: raw.phoneNumber ?? "",
        profilePictureUrl: raw.profilePictureUrl ?? "",
        role: (raw.role?.replace("ROLE_", "") ?? "") as UserRole,
        isActive: raw.enabled ?? true,
        createdAt: raw.createdAt,
        startupProfile: raw.startupProfile,
        investorProfile: raw.investorProfile,
        evaluatorProfile: raw.evaluatorProfile,
      });
    } catch {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const trustedToken = localStorage.getItem("trustedDeviceToken");
      const headers: Record<string, string> = {};
      if (trustedToken) {
        headers["X-Trusted-Device"] = trustedToken;
      }

      const res = await api.post("/api/auth/login", { email, password }, { headers });
      const data = res.data;

      if (data.requiresTwoFactor) {
        router.push(`/verify-2fa?email=${encodeURIComponent(email)}`);
        return;
      }

      if (data.trustedDeviceToken) {
        localStorage.setItem("trustedDeviceToken", data.trustedDeviceToken);
      }

      const token = data.accessToken;
      const role = data.role?.replace("ROLE_", "") as UserRole;

      if (!token) throw new Error("No token received");

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await fetchCurrentUser();

      toast.success("Welcome back!");
      router.push(roleRedirectMap[role] || "/");
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Invalid email or password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithToken = (accessToken: string, userId: string, email: string, role: UserRole, trustedDeviceToken?: string) => {
    localStorage.setItem("token", accessToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    if (trustedDeviceToken) {
      localStorage.setItem("trustedDeviceToken", trustedDeviceToken);
    }

    fetchCurrentUser();
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    phoneNumber: string,
    role: UserRole
  ) => {
    try {
      setIsLoading(true);
      await api.post("/api/auth/register", { fullName, email, password, phoneNumber, role });
      toast.success("Registration successful! Please log in.");
      router.push("/login");
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    toast.info("You have been logged out.");
    router.push("/login");
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithToken,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}