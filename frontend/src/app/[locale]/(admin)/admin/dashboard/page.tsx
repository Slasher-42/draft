"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
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
  const t = useTranslations("admin.dashboard");
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
        <p className="text-sm text-red-500 font-medium">{t("errorTitle")}</p>
        <p className="text-xs text-[var(--color-neutral-400)]">
          {t("errorEndpointPrefix")} <code>/api/admin/analytics</code> {t("errorEndpointSuffix")}
        </p>
      </div>
    );
  }

  const pieData = analytics
    ? [
        {
          name: t("classification.highlyReady"),
          value: analytics.classificationDistribution.highlyReady,
          color: "#2F72A5",
        },
        {
          name: t("classification.moderatelyReady"),
          value: analytics.classificationDistribution.moderatelyReady,
          color: "#F59E0B",
        },
        {
          name: t("classification.notReady"),
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
            {t("title")}
          </h2>
          <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
            {t("subtitle")}
          </p>
        </div>
        <Link href="/admin/settings">
          <Button variant="outline" className="gap-2">
            <BarChart2 className="h-4 w-4" />
            {t("systemSettings")}
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("totalExecutions"), value: analytics?.totalExecutions ?? 0, icon: ClipboardList, bg: "bg-blue-50",  color: "text-blue-600" },
          { label: t("approved"),        value: analytics?.totalApproved ?? 0,   icon: CheckCircle2,  bg: "bg-green-50", color: "text-green-600" },
          { label: t("matched"),         value: analytics?.totalMatched ?? 0,    icon: TrendingUp,     bg: "bg-teal-50",  color: "text-teal-600" },
          { label: t("pending"),         value: analytics?.totalPending ?? 0,    icon: Clock,          bg: "bg-amber-50", color: "text-amber-600" },
        ].map((stat) => (
          <Card key={stat.label} className="border border-[var(--color-border)]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-[var(--color-neutral-500)]">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution trend */}
        <Card className="border border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="text-base">{t("executionTrend")}</CardTitle>
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
                {t("noData")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Classification distribution */}
        <Card className="border border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="text-base">
              {t("readinessClassification")}
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
                {t("noData")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: t("manageUsers"),    desc: t("manageUsersDesc"),    href: "/admin/users",        icon: Users,         bg: "bg-blue-50",   color: "text-blue-600" },
          { label: t("auditLogs"),      desc: t("auditLogsDesc"),      href: "/admin/audit-logs",   icon: ClipboardList, bg: "bg-violet-50", color: "text-violet-600" },
          { label: t("allExecutions"),  desc: t("allExecutionsDesc"),  href: "/admin/executions",   icon: BarChart2,     bg: "bg-teal-50",   color: "text-teal-600" },
        ].map((link) => (
          <Link key={link.label} href={link.href}>
            <Card className="border border-[var(--color-border)] hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${link.bg}`}>
                  <link.icon className={`h-5 w-5 ${link.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${link.color}`}>{link.label}</p>
                  <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">{link.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-[var(--color-neutral-400)] transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}