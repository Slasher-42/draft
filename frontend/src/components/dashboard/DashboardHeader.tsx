"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Bell, CheckCheck, X, Sparkles } from "lucide-react";
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
  STARTUP_APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  STARTUP_REJECTED: "bg-red-50 text-red-700 border-red-200",
  STARTUP_ESCALATED: "bg-amber-50 text-amber-700 border-amber-200",
  MATCH_FOUND: "bg-blue-50 text-blue-700 border-blue-200",
  INTERVAL_UPDATE: "bg-slate-50 text-slate-600 border-slate-200",
};

const typeDots: Record<string, string> = {
  STARTUP_APPROVED: "bg-emerald-400",
  STARTUP_REJECTED: "bg-red-400",
  STARTUP_ESCALATED: "bg-amber-400",
  MATCH_FOUND: "bg-blue-400",
  INTERVAL_UPDATE: "bg-slate-400",
};

const typeLabels: Record<string, string> = {
  STARTUP_APPROVED: "Approved",
  STARTUP_REJECTED: "Rejected",
  STARTUP_ESCALATED: "Escalated",
  MATCH_FOUND: "Match Found",
  INTERVAL_UPDATE: "Update",
};

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function DashboardHeader() {
  const pathname       = usePathname();
  const { user }       = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef    = useRef<HTMLDivElement>(null);

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
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(226,232,240,0.8)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
      }}
    >
      {/* Left — page title */}
      <div className="flex items-center gap-3">
        {/* Gradient accent bar */}
        <div
          className="w-1 h-8 rounded-full flex-shrink-0"
          style={{ background: "linear-gradient(180deg,#0B4A8B,#2F72A5)" }}
        />
        <div>
          <h1 className="text-base font-bold leading-tight" style={{ color: "#052654" }}>
            {getTitle()}
          </h1>
          <p className="text-[11px] flex items-center gap-1" style={{ color: "#94A3B8" }}>
            <Sparkles className="w-3 h-3" />
            RG Partners · Investment Readiness Assessment System
          </p>
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="relative h-9 w-9 flex items-center justify-center rounded-xl transition-all hover:bg-slate-50 border border-transparent hover:border-slate-200"
          >
            <Bell className="h-4.5 w-4.5 text-slate-500" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 h-4 w-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#0B4A8B,#2F72A5)" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50"
              style={{
                background: "rgba(255,255,255,0.97)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(226,232,240,0.9)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 12px 40px rgba(0,0,0,0.06)",
              }}
            >
              {/* Header */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid rgba(226,232,240,0.8)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <span
                      className="px-1.5 py-0.5 rounded-full text-white text-[9px] font-bold"
                      style={{ background: "linear-gradient(135deg,#0B4A8B,#2F72A5)" }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-medium hover:underline flex items-center gap-1"
                      style={{ color: "#0B4A8B" }}
                    >
                      <CheckCheck className="h-3 w-3" />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)" }}
                    >
                      <Bell className="h-5 w-5 text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">All caught up</p>
                    <p className="text-xs text-slate-400 mt-0.5">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => { if (!n.read) markAsRead(n.id); }}
                      className={`px-4 py-3.5 cursor-pointer hover:bg-slate-50/80 transition-colors ${
                        !n.read ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                            typeColors[n.type] ?? "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {typeLabels[n.type] ?? n.type}
                        </span>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {n.message}
                      </p>
                      {!n.read && (
                        <span
                          className={`inline-block mt-1.5 h-1.5 w-1.5 rounded-full ${
                            typeDots[n.type] ?? "bg-slate-400"
                          }`}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div
          className="hidden sm:flex items-center gap-2.5 pl-3 ml-1"
          style={{ borderLeft: "1px solid rgba(226,232,240,0.8)" }}
        >
          <div
            className="h-8 w-8 rounded-xl flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#0B4A8B,#2F72A5)",
              boxShadow: "0 2px 8px rgba(11,74,139,0.25)",
            }}
          >
            {user?.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt={user.fullName} className="h-full w-full object-cover" />
            ) : (
              user?.fullName?.charAt(0)?.toUpperCase() ?? "U"
            )}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-800">{user?.fullName}</p>
            <p className="text-[11px] text-slate-400 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
