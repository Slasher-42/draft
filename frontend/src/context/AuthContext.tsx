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
      setUser(res.data);
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
      const res = await api.post("/api/auth/login", { email, password });
      const { token, user: userData, requires2FA } = res.data;

      if (userData?.isActive === false) {
        toast.error("Your account is disabled. Please contact support.");
        return;
      }

      if (requires2FA) {
        toast.success("Verification code sent to your email.");
        router.push(`/verify-2fa?email=${encodeURIComponent(email)}`);
        return;
      }

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);
      toast.success("Welcome back!");
      router.push(roleRedirectMap[userData.role as UserRole] || "/");
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Invalid email or password."
      );
    } finally {
      setIsLoading(false);
    }
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
      await api.post("/api/auth/register", {
        fullName,
        email,
        password,
        phoneNumber,
        role,
      });
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