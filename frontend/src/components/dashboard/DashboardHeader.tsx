"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Bell } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/startup/executions": "My Executions",
  "/startup/execute": "New Execution",
  "/startup/ai": "AI Assessment",
  "/investor/executions": "My Investments",
  "/investor/execute": "New Investment Execution",
  "/investor/ai": "AI Assessment",
  "/evaluator/dashboard": "Evaluator Dashboard",
  "/evaluator/reviews": "Reviews",
  "/admin/dashboard": "Admin Dashboard",
  "/admin/users": "User Management",
  "/admin/evaluators": "Evaluator Management",
  "/admin/executions": "All Executions",
  "/admin/analytics": "Analytics",
  "/admin/audit-logs": "Audit Logs",
  "/admin/notifications": "Notifications",
  "/admin/settings": "System Settings",
  "/profile": "My Profile",
  "/settings": "Settings",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getTitle = () => {
    if (pageTitles[pathname]) return pageTitles[pathname];
    const parts = pathname.split("/").filter(Boolean);
    if (!parts.length) return "Dashboard";
    const last = parts[parts.length - 1];
    return last
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <header className="border-b border-[var(--color-border)] bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-semibold text-[var(--color-primary-800)]">
          {getTitle()}
        </h1>
        <p className="text-xs text-[var(--color-neutral-400)]">
          RG Partners · Investment Readiness Assessment System
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[var(--color-neutral-100)] transition-colors">
          <Bell className="h-5 w-5 text-[var(--color-neutral-500)]" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--color-secondary)]" />
        </button>

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[var(--color-border)]">
          <div className="h-8 w-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold overflow-hidden">
            {user?.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={user.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              user?.fullName?.charAt(0)?.toUpperCase() ?? "U"
            )}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-[var(--color-neutral-800)]">
              {user?.fullName}
            </p>
            <p className="text-xs text-[var(--color-neutral-400)] capitalize">
              {user?.role?.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}