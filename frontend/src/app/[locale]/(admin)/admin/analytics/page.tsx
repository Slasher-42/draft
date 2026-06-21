"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ClipboardList, CheckCircle2, TrendingUp, Clock, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { notificationService } from "@/services/notificationService";

const execApi = axios.create({ baseURL: "https://startupapplicationservice.onrender.com", timeout: 30000 });
execApi.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const evalApi = axios.create({ baseURL: "https://evaluation-and-decision-service.onrender.com", timeout: 30000 });
evalApi.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface LiveStats {
  totalExecutions: number;
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalMatched: number;
  totalStartupExecs: number;
  totalInvestorExecs: number;
}

export default function AdminAnalyticsPage() {
  const t = useTranslations("admin.analytics");
  const tCommon = useTranslations("common");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [[startupRes, investorRes, reviewsRes], analyticsRes] = await Promise.all([
        Promise.allSettled([
          execApi.get("/api/executions/startup/all"),
          execApi.get("/api/executions/investor/all"),
          evalApi.get("/api/evaluator/reviews/all"),
        ]),
        notificationService.getAnalytics().catch(() => null),
      ]);

      const startups: any[] = startupRes.status === "fulfilled" ? (startupRes.value.data?.data ?? []) : [];
      const investors: any[] = investorRes.status === "fulfilled" ? (investorRes.value.data?.data ?? []) : [];
      const reviews: any[] = reviewsRes.status === "fulfilled" ? (reviewsRes.value.data?.data ?? []) : [];

      const reviewStatusMap: Record<number, string> = {};
      reviews.forEach((r: any) => { if (r.decision) reviewStatusMap[r.executionId] = r.decision; });

      const mergedStartups = startups.map((e: any) => ({ ...e, status: reviewStatusMap[e.id] ?? e.status }));
      const all = [...mergedStartups, ...investors];

      return {
        stats: {
          totalExecutions:    all.length,
          totalPending:       all.filter(e => e.status === "PENDING").length,
          totalApproved:      all.filter(e => e.status === "APPROVED").length,
          totalRejected:      all.filter(e => e.status === "REJECTED").length,
          totalMatched:       all.filter(e => e.status === "MATCHED").length,
          totalStartupExecs:  startups.length,
          totalInvestorExecs: investors.length,
        } as LiveStats,
        aiAnalytics: (analyticsRes as any)?.data?.data ?? null,
      };
    },
  });

  const stats = data?.stats ?? null;
  const aiAnalytics = data?.aiAnalytics ?? null;

  const statCards = [
    { label: t("totalExecutions"),       value: stats?.totalExecutions,    icon: ClipboardList,  bg: "bg-[var(--color-primary-50)]",  color: "text-[var(--color-primary)]"   },
    { label: tCommon("status.pending"),  value: stats?.totalPending,        icon: Clock,          bg: "bg-blue-50",                    color: "text-blue-600"                 },
    { label: tCommon("status.approved"), value: stats?.totalApproved,       icon: CheckCircle2,   bg: "bg-green-50",                   color: "text-green-600"                },
    { label: tCommon("status.matched"),  value: stats?.totalMatched,        icon: TrendingUp,     bg: "bg-emerald-50",                 color: "text-emerald-600"              },
    { label: tCommon("status.rejected"), value: stats?.totalRejected,       icon: XCircle,        bg: "bg-red-50",                     color: "text-red-500"                  },
    { label: t("startupExecs"),          value: stats?.totalStartupExecs,   icon: ClipboardList,  bg: "bg-blue-50",                    color: "text-blue-700"                 },
    { label: t("investorExecs"),         value: stats?.totalInvestorExecs,  icon: ClipboardList,  bg: "bg-purple-50",                  color: "text-purple-700"               },
  ];


  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">{t("title")}</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          {t("subtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : (
        <>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-400)] mb-3">
              {t("liveFromService")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {statCards.map((s) => (
                <Card key={s.label} className="border border-[var(--color-border)]">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                      <s.icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-[var(--color-primary-800)]">
                        {s.value ?? 0}
                      </p>
                      <p className="text-xs text-[var(--color-neutral-500)]">{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border border-[var(--color-border)]">
              <CardHeader>
                <CardTitle className="text-base">{t("scoreByIndustry")}</CardTitle>
              </CardHeader>
              <CardContent>
                {aiAnalytics?.scoreByIndustry?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={aiAnalytics.scoreByIndustry.map((s: any) => ({
                      industry: s.industry,
                      avgScore: s.count > 0 ? Math.round(s.totalScore / s.count) : 0,
                    }))}>
                      <XAxis dataKey="industry" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="avgScore" fill="#2F72A5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-[var(--color-neutral-400)] text-center py-10">{t("noScoreData")}</p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-[var(--color-border)]">
              <CardHeader>
                <CardTitle className="text-base">{t("executionTrend")}</CardTitle>
              </CardHeader>
              <CardContent>
                {aiAnalytics?.executionTrend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={aiAnalytics.executionTrend}>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-[var(--color-neutral-400)] text-center py-10">{t("noTrendData")}</p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-[var(--color-border)]">
              <CardHeader>
                <CardTitle className="text-base">{t("matchSuccessRate")}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
                <p className="text-5xl font-bold text-[var(--color-primary)]">
                  {stats && stats.totalApproved > 0
                    ? Math.round((stats.totalMatched / stats.totalApproved) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-[var(--color-neutral-500)]">{t("matchSuccessRateHint")}</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}