"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ClipboardList, CheckCircle2, TrendingUp, Clock, XCircle, BarChart2, Lock } from "lucide-react";

const execApi = axios.create({ baseURL: "http://localhost:8082", timeout: 30000 });
execApi.interceptors.request.use((config) => {
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
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      execApi.get("/api/executions/startup/all"),
      execApi.get("/api/executions/investor/all"),
    ]).then(([startupRes, investorRes]) => {
      const startups: any[] = startupRes.status === "fulfilled"
        ? (startupRes.value.data?.data ?? [])
        : [];
      const investors: any[] = investorRes.status === "fulfilled"
        ? (investorRes.value.data?.data ?? [])
        : [];

      const all = [...startups, ...investors];

      setStats({
        totalExecutions:    all.length,
        totalPending:       all.filter(e => e.status === "PENDING").length,
        totalApproved:      all.filter(e => e.status === "APPROVED").length,
        totalRejected:      all.filter(e => e.status === "REJECTED").length,
        totalMatched:       all.filter(e => e.status === "MATCHED").length,
        totalStartupExecs:  startups.length,
        totalInvestorExecs: investors.length,
      });
    }).finally(() => setIsLoading(false));
  }, []);

  const statCards = [
    { label: "Total Executions",  value: stats?.totalExecutions,    icon: ClipboardList,  bg: "bg-[var(--color-primary-50)]",  color: "text-[var(--color-primary)]"   },
    { label: "Pending",           value: stats?.totalPending,        icon: Clock,          bg: "bg-blue-50",                    color: "text-blue-600"                 },
    { label: "Approved",          value: stats?.totalApproved,       icon: CheckCircle2,   bg: "bg-green-50",                   color: "text-green-600"                },
    { label: "Matched",           value: stats?.totalMatched,        icon: TrendingUp,     bg: "bg-emerald-50",                 color: "text-emerald-600"              },
    { label: "Rejected",          value: stats?.totalRejected,       icon: XCircle,        bg: "bg-red-50",                     color: "text-red-500"                  },
    { label: "Startup Execs",     value: stats?.totalStartupExecs,   icon: ClipboardList,  bg: "bg-blue-50",                    color: "text-blue-700"                 },
    { label: "Investor Execs",    value: stats?.totalInvestorExecs,  icon: ClipboardList,  bg: "bg-purple-50",                  color: "text-purple-700"               },
  ];

  const futureCharts = [
    {
      title: "Average Readiness Score by Industry",
      description: "Available after Service 3 — AI Assessment Engine — is integrated. Will show average scores per industry across all evaluated startup executions.",
      service: "Service 3",
    },
    {
      title: "Readiness Classification Distribution",
      description: "Available after Service 3 — AI Assessment Engine — is integrated. Will show the split between Highly Ready, Moderately Ready, and Not Ready startups.",
      service: "Service 3",
    },
    {
      title: "Execution Trend Over Time",
      description: "Available after Service 6 — Reporting and Notification Service — is integrated. Will show how many executions are submitted per day or week.",
      service: "Service 6",
    },
    {
      title: "Match Success Rate",
      description: "Available after Service 5 — Investor Matching Service — is integrated. Will show the percentage of approved startups that successfully get matched to investors.",
      service: "Service 5",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">Analytics</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          Platform-wide performance metrics and trends
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
              Live — from Service 2
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

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-400)] mb-3">
              Coming Soon — Pending Service Integration
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {futureCharts.map((chart) => (
                <Card key={chart.title} className="border border-dashed border-[var(--color-border)] bg-[var(--color-neutral-50)]">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold text-[var(--color-neutral-600)]">
                        {chart.title}
                      </CardTitle>
                      <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-neutral-200)] text-[var(--color-neutral-500)] text-xs font-medium">
                        <Lock className="h-3 w-3" />
                        {chart.service}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-28 flex flex-col items-center justify-center gap-2">
                      <BarChart2 className="h-8 w-8 text-[var(--color-neutral-300)]" />
                      <p className="text-xs text-[var(--color-neutral-400)] text-center leading-relaxed max-w-xs">
                        {chart.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}