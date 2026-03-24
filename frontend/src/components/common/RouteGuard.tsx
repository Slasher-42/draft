"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const roleHomeMap: Record<string, string> = {
  STARTUP: "/startup/executions",
  INVESTOR: "/investor/executions",
  EVALUATOR: "/evaluator/dashboard",
  ADMIN: "/admin/dashboard",
};

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push(roleHomeMap[user.role] || "/login");
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-neutral-50)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
          <p className="text-sm text-[var(--color-neutral-500)] font-medium">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}