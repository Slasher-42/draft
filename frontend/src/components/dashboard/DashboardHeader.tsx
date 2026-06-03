"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { useAuth } from "@/context/AuthContext";
import { Bell, CheckCheck, X, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useNotifications } from "@/hooks/useNotifications";
import { useTranslations } from "next-intl";

const typeColors: Record<string, string> = {
  STARTUP_APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  STARTUP_REJECTED: "bg-red-50 text-red-700 border border-red-200",
  STARTUP_ESCALATED: "bg-amber-50 text-amber-700 border border-amber-200",
  MATCH_FOUND: "bg-blue-50 text-blue-700 border border-blue-200",
  INTERVAL_UPDATE: "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)] border border-[var(--color-border)]",
};

const typeDots: Record<string, string> = {
  STARTUP_APPROVED: "bg-emerald-400",
  STARTUP_REJECTED: "bg-red-400",
  STARTUP_ESCALATED: "bg-amber-400",
  MATCH_FOUND: "bg-blue-400",
  INTERVAL_UPDATE: "bg-[var(--color-neutral-400)]",
};

export function DashboardHeader() {
  const pathname        = usePathname();
  const { user }        = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef     = useRef<HTMLDivElement>(null);
  const t               = useTranslations("dashboard.pageTitles");
  const tn              = useTranslations("notifications");
  const th              = useTranslations("dashboard.header");

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const typeLabels: Record<string, string> = {
    STARTUP_APPROVED: tn("types.approved"),
    STARTUP_REJECTED: tn("types.rejected"),
    STARTUP_ESCALATED: tn("types.escalated"),
    MATCH_FOUND: tn("types.matchFound"),
    INTERVAL_UPDATE: tn("types.update"),
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function timeAgo(dateStr: string): string {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins < 1)   return tn("timeAgo.justNow");
    if (mins < 60)  return tn("timeAgo.minutesAgo", { minutes: mins });
    if (hours < 24) return tn("timeAgo.hoursAgo", { hours });
    return tn("timeAgo.daysAgo", { days });
  }

  const pageTitleMap: Record<string, string> = {
    "/startup/executions":          t("myExecutions"),
    "/startup/execute":             t("newExecution"),
    "/startup/ai":                  t("aiAssessment"),
    "/investor/executions":         t("myInvestments"),
    "/investor/execute":            t("newInvestmentExecution"),
    "/investor/ai":                 t("aiAssessment"),
    "/evaluator/dashboard":         t("evaluatorDashboard"),
    "/evaluator/reviews":           t("reviews"),
    "/admin/dashboard":             t("adminDashboard"),
    "/admin/users":                 t("userManagement"),
    "/admin/evaluators":            t("evaluatorManagement"),
    "/admin/executions":            t("allExecutions"),
    "/admin/analytics":             t("analytics"),
    "/admin/audit-logs":            t("auditLogs"),
    "/admin/notifications":         t("notifications"),
    "/admin/settings":              t("systemSettings"),
    "/investor/messages":           t("messages"),
    "/startup/messages":            t("messages"),
    "/admin/alumni":                t("alumniMonitor"),
    "/admin/investment-monitor":    t("investmentMonitor"),
    "/evaluator/investment-monitor":t("investmentMonitor"),
    "/profile":                     t("myProfile"),
    "/settings":                    t("settings"),
  };

  const getTitle = () => {
    if (pageTitleMap[pathname]) return pageTitleMap[pathname];
    const parts = pathname.split("/").filter(Boolean);
    if (!parts.length) return t("dashboard");
    const last = parts[parts.length - 1];
    return last.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <header className="glass-header sticky top-0 z-20 flex items-center justify-between px-6 py-3.5">
      {/* Left — page title */}
      <div className="flex items-center gap-3">
        <div
          className="w-1 h-8 rounded-full flex-shrink-0"
          style={{ background: "linear-gradient(180deg,#0B4A8B,#2F72A5)" }}
        />
        <div>
          <h1 className="text-base font-bold leading-tight text-[var(--color-primary-800)]">
            {getTitle()}
          </h1>
          <p className="text-[11px] flex items-center gap-1 text-[var(--color-neutral-400)]">
            <Sparkles className="w-3 h-3" />
            {th("subtitle")}
          </p>
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />

        {/* Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="relative h-9 w-9 flex items-center justify-center rounded-xl transition-all hover:bg-[var(--color-neutral-100)] border border-transparent hover:border-[var(--color-border)]"
          >
            <Bell className="h-4 w-4 text-[var(--color-neutral-500)]" />
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
            <div className="glass-dropdown absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50">
              {/* Header */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--color-foreground)]">{tn("title")}</span>
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
                      className="text-[11px] font-medium hover:underline flex items-center gap-1 text-[var(--color-primary)]"
                    >
                      <CheckCheck className="h-3 w-3" />
                      {tn("markAllRead")}
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-[var(--color-neutral-100)] transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-[var(--color-neutral-400)]" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "linear-gradient(135deg,var(--color-primary-50),var(--color-primary-100))" }}
                    >
                      <Bell className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">{tn("allCaughtUp")}</p>
                    <p className="text-xs text-[var(--color-neutral-400)] mt-0.5">{tn("noNotifications")}</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => { if (!n.read) markAsRead(n.id); }}
                      className={`notif-item px-4 py-3.5 cursor-pointer border-b border-[var(--color-border)] last:border-b-0 ${!n.read ? "notif-item-unread" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeColors[n.type] ?? "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]"}`}>
                          {typeLabels[n.type] ?? n.type}
                        </span>
                        <span className="text-[10px] text-[var(--color-neutral-400)] flex-shrink-0">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-neutral-600)] leading-relaxed">
                        {n.message}
                      </p>
                      {!n.read && (
                        <span className={`inline-block mt-1.5 h-1.5 w-1.5 rounded-full ${typeDots[n.type] ?? "bg-[var(--color-neutral-400)]"}`} />
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
          style={{ borderLeft: "1px solid var(--color-border)" }}
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
            <p className="text-sm font-semibold text-[var(--color-foreground)]">{user?.fullName}</p>
            <p className="text-[11px] text-[var(--color-neutral-400)] capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
