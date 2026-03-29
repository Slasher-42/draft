"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Bell, CheckCheck, X } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useNotifications } from "@/hooks/useNotifications";

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

const typeColors: Record<string, string> = {
  STARTUP_APPROVED: "bg-green-100 text-green-700",
  STARTUP_REJECTED: "bg-red-100 text-red-700",
  STARTUP_ESCALATED: "bg-yellow-100 text-yellow-700",
  MATCH_FOUND: "bg-blue-100 text-blue-700",
  INTERVAL_UPDATE: "bg-neutral-100 text-neutral-600",
};

const typeLabels: Record<string, string> = {
  STARTUP_APPROVED: "Approved",
  STARTUP_REJECTED: "Rejected",
  STARTUP_ESCALATED: "Escalated",
  MATCH_FOUND: "Match Found",
  INTERVAL_UPDATE: "Update",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function DashboardHeader() {
  const pathname  = usePathname();
  const { user }  = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef     = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTitle = () => {
    if (pageTitles[pathname]) return pageTitles[pathname];
    const parts = pathname.split("/").filter(Boolean);
    if (!parts.length) return "Dashboard";
    const last = parts[parts.length - 1];
    return last.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
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
        <ThemeToggle />

        {/* Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[var(--color-neutral-100)] transition-colors"
          >
            <Bell className="h-5 w-5 text-[var(--color-neutral-500)]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[var(--color-secondary)] text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden z-50">

              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--color-border)]">
                <span className="text-sm font-semibold text-[var(--color-primary-800)]">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[var(--color-secondary)] text-white text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="h-3 w-3" />
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)}>
                    <X className="h-4 w-4 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto divide-y divide-[var(--color-border)]">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="h-8 w-8 text-[var(--color-neutral-300)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--color-neutral-400)]">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => { if (!n.read) markAsRead(n.id); }}
                      className={`px-4 py-3 cursor-pointer hover:bg-[var(--color-neutral-50)] transition-colors ${
                        !n.read ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                          typeColors[n.type] ?? "bg-neutral-100 text-neutral-600"
                        }`}>
                          {typeLabels[n.type] ?? n.type}
                        </span>
                        <span className="text-[10px] text-[var(--color-neutral-400)] flex-shrink-0">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-neutral-700)] mt-1.5 leading-relaxed">
                        {n.message}
                      </p>
                      {!n.read && (
                        <span className="inline-block mt-1 h-1.5 w-1.5 rounded-full bg-[var(--color-secondary)]" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[var(--color-border)]">
          <div className="h-8 w-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold overflow-hidden">
            {user?.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt={user.fullName} className="h-full w-full object-cover" />
            ) : (
              user?.fullName?.charAt(0)?.toUpperCase() ?? "U"
            )}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-[var(--color-neutral-800)]">{user?.fullName}</p>
            <p className="text-xs text-[var(--color-neutral-400)] capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </header>
  );
}