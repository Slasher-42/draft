"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notificationService";

interface Notification {
  id: number;
  recipientUserId: number;
  type: string;
  message: string;
  relatedExecutionId: number | null;
  read: boolean;
  createdAt: string;
}
import { Bell, CheckCheck, Loader2, BellOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const typeColors: Record<string, string> = {
  STARTUP_APPROVED:  "bg-green-100 text-green-700 border-green-200",
  STARTUP_REJECTED:  "bg-red-100 text-red-700 border-red-200",
  STARTUP_ESCALATED: "bg-yellow-100 text-yellow-700 border-yellow-200",
  MATCH_FOUND:       "bg-blue-100 text-blue-700 border-blue-200",
  INTERVAL_UPDATE:   "bg-neutral-100 text-neutral-600 border-neutral-200",
  EXECUTION_WITHHELD: "bg-red-100 text-red-700 border-red-200",
};

function getTypeLabels(t: ReturnType<typeof useTranslations<"admin.notifications">>): Record<string, string> {
  return {
    STARTUP_APPROVED:  t("types.approved"),
    STARTUP_REJECTED:  t("types.rejected"),
    STARTUP_ESCALATED: t("types.escalated"),
    MATCH_FOUND:       t("types.matchFound"),
    INTERVAL_UPDATE:   t("types.update"),
    EXECUTION_WITHHELD: t("types.withheld"),
  };
}

const FILTERS = ["ALL", "UNREAD", "STARTUP_APPROVED", "STARTUP_REJECTED", "MATCH_FOUND", "INTERVAL_UPDATE"] as const;
type Filter = typeof FILTERS[number];

function timeAgo(dateStr: string, t: ReturnType<typeof useTranslations<"admin.notifications">>): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return t("justNow");
  if (mins < 60)  return t("minutesAgo", { count: mins });
  if (hours < 24) return t("hoursAgo", { count: hours });
  return t("daysAgo", { count: days });
}

export default function AdminNotificationsPage() {
  const t = useTranslations("admin.notifications");
  const typeLabels = getTypeLabels(t);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const res = await notificationService.getAllForAdmin();
      const data = res.data?.data ?? [];
      setNotifications(data);
      return data;
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };
  const [filter, setFilter] = useState<Filter>("ALL");

  const filtered = notifications.filter((n) => {
    if (filter === "ALL")    return true;
    if (filter === "UNREAD") return !n.read;
    return n.type === filter;
  });

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">{t("title")}</h2>
          <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
            {t("subtitle")}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" className="gap-2" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4" />
            {t("markAllAsRead", { count: unreadCount })}
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f === "ALL"
            ? notifications.length
            : f === "UNREAD"
            ? unreadCount
            : notifications.filter((n) => n.type === f).length;

          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                filter === f
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-200)]"
              }`}
            >
              {typeLabels[f] ?? f}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                filter === f
                  ? "bg-white/20 text-white"
                  : "bg-[var(--color-neutral-200)] text-[var(--color-neutral-500)]"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <BellOff className="h-10 w-10 text-[var(--color-neutral-300)]" />
          <p className="text-sm text-[var(--color-neutral-400)]">{t("noNotifications")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n: Notification) => (
            <Card
              key={n.id}
              onClick={() => { if (!n.read) markAsRead(n.id); }}
              className={`border cursor-pointer transition-all hover:shadow-sm ${
                !n.read
                  ? "border-[var(--color-primary-200)] bg-blue-50/30"
                  : "border-[var(--color-border)]"
              }`}
            >
              <CardContent className="p-4 flex items-start gap-4">

                {/* Unread dot */}
                <div className="flex-shrink-0 mt-1">
                  {!n.read ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-secondary)] block" />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-transparent block" />
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      typeColors[n.type] ?? "bg-neutral-100 text-neutral-600 border-neutral-200"
                    }`}>
                      {typeLabels[n.type] ?? n.type}
                    </span>
                    <span className="text-xs text-[var(--color-neutral-400)]">
                      {t("userLabel", { id: n.recipientUserId })}
                    </span>
                    {n.relatedExecutionId && (
                      <span className="text-xs text-[var(--color-neutral-400)]">
                        {t("executionLabel", { id: n.relatedExecutionId })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-neutral-700)] leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {/* Time */}
                <span className="text-xs text-[var(--color-neutral-400)] flex-shrink-0 mt-0.5">
                  {timeAgo(n.createdAt, t)}
                </span>

              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}