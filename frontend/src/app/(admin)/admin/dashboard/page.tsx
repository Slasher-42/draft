"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { adminService } from "@/services/adminService";
import { AnalyticsData } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  XCircle,
  Clock,
  BarChart2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboardPage() {
  const { data: analytics, isLoading, isError: error } = useQuery<AnalyticsData>({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await adminService.getDashboardStats();
      return res.data?.data ?? res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-red-500 font-medium">Failed to load dashboard data.</p>
        <p className="text-xs text-[var(--color-neutral-400)]">
          The analytics endpoint <code>/api/admin/analytics</code> is not available yet.
          Please implement it in your backend.
        </p>
      </div>
    );
  }

  const pieData = analytics
    ? [
        {
          name: "Highly Ready",
          value: analytics.classificationDistribution.highlyReady,
          color: "#2F72A5",
        },
        {
          name: "Moderately Ready",
          value: analytics.classificationDistribution.moderatelyReady,
          color: "#F59E0B",
        },
        {
          name: "Not Ready",
          value: analytics.classificationDistribution.notReady,
          color: "#EF4444",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
            Admin Dashboard
          </h2>
          <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
            System overview and analytics
          </p>
        </div>
        <Link href="/admin/settings">
          <Button variant="outline" className="gap-2">
            <BarChart2 className="h-4 w-4" />
            System Settings
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Executions",
            value: analytics?.totalExecutions ?? 0,
            icon: ClipboardList,
            gradient: "linear-gradient(135deg,#EFF6FF,#DBEAFE)",
            border: "#BFDBFE",
            iconBg: "linear-gradient(135deg,#2563EB,#3B82F6)",
            valueColor: "#1D4ED8",
          },
          {
            label: "Approved",
            value: analytics?.totalApproved ?? 0,
            icon: CheckCircle2,
            gradient: "linear-gradient(135deg,#F0FDF4,#DCFCE7)",
            border: "#BBF7D0",
            iconBg: "linear-gradient(135deg,#059669,#10B981)",
            valueColor: "#059669",
          },
          {
            label: "Matched",
            value: analytics?.totalMatched ?? 0,
            icon: TrendingUp,
            gradient: "linear-gradient(135deg,#F0FDFA,#CCFBF1)",
            border: "#99F6E4",
            iconBg: "linear-gradient(135deg,#0D9488,#14B8A6)",
            valueColor: "#0D9488",
          },
          {
            label: "Pending",
            value: analytics?.totalPending ?? 0,
            icon: Clock,
            gradient: "linear-gradient(135deg,#FFFBEB,#FEF3C7)",
            border: "#FDE68A",
            iconBg: "linear-gradient(135deg,#D97706,#F59E0B)",
            valueColor: "#D97706",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: stat.gradient,
              borderColor: stat.border,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
            }}
          >
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: stat.iconBg, boxShadow: `0 4px 12px ${stat.border}` }}
            >
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-extrabold" style={{ color: stat.valueColor }}>
                {stat.value}
              </p>
              <p className="text-xs font-medium mt-0.5" style={{ color: stat.valueColor, opacity: 0.7 }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution trend */}
        <Card className="border border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="text-base">Execution Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.executionTrend &&
            analytics.executionTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.executionTrend}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid var(--color-border)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-[var(--color-neutral-400)]">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Classification distribution */}
        <Card className="border border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="text-base">
              Readiness Classification
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.some((d) => d.value > 0) ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {pieData.map((entry) => (
                    <div
                      key={entry.name}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs text-[var(--color-neutral-600)]">
                        {entry.name}
                      </span>
                      <span className="text-xs font-bold text-[var(--color-foreground)] ml-auto">
                        {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[160px] flex items-center justify-center text-sm text-[var(--color-neutral-400)]">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Manage Users",
            desc: "View, activate or deactivate user accounts",
            href: "/admin/users",
            icon: Users,
            accent: "#2563EB",
            bg: "linear-gradient(135deg,#EFF6FF,#DBEAFE)",
            border: "#BFDBFE",
          },
          {
            label: "Audit Logs",
            desc: "Full system activity trail",
            href: "/admin/audit-logs",
            icon: ClipboardList,
            accent: "#7C3AED",
            bg: "linear-gradient(135deg,#F5F3FF,#EDE9FE)",
            border: "#DDD6FE",
          },
          {
            label: "All Executions",
            desc: "View all startup and investor executions",
            href: "/admin/executions",
            icon: BarChart2,
            accent: "#0D9488",
            bg: "linear-gradient(135deg,#F0FDFA,#CCFBF1)",
            border: "#99F6E4",
          },
        ].map((link) => (
          <Link key={link.label} href={link.href}>
            <div
              className="rounded-2xl border p-5 flex items-start gap-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group"
              style={{
                background: link.bg,
                borderColor: link.border,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${link.border}, 0 8px 24px rgba(0,0,0,0.06)`}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"}
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: link.accent, boxShadow: `0 4px 12px ${link.border}` }}
              >
                <link.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: link.accent }}>
                  {link.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {link.desc}
                </p>
              </div>
              <ArrowRight
                className="h-4 w-4 flex-shrink-0 mt-0.5 transition-transform group-hover:translate-x-1"
                style={{ color: link.accent, opacity: 0.5 }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}