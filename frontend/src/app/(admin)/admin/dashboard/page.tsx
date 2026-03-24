"use client";

import { useState, useEffect } from "react";
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
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboardStats()
      .then((res) => setAnalytics(res.data))
      .catch(() => setAnalytics(null))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const pieData = analytics
    ? [
        {
          name: "Highly Ready",
          value: analytics.classificationDistribution.highlyReady,
          color: "#2FA572",
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
            bg: "bg-[var(--color-primary-50)]",
            color: "text-[var(--color-primary)]",
          },
          {
            label: "Approved",
            value: analytics?.totalApproved ?? 0,
            icon: CheckCircle2,
            bg: "bg-green-50",
            color: "text-green-600",
          },
          {
            label: "Matched",
            value: analytics?.totalMatched ?? 0,
            icon: TrendingUp,
            bg: "bg-[var(--color-secondary-50)]",
            color: "text-[var(--color-secondary)]",
          },
          {
            label: "Pending",
            value: analytics?.totalPending ?? 0,
            icon: Clock,
            bg: "bg-blue-50",
            color: "text-blue-600",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="border border-[var(--color-border)]"
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div
                className={`h-11 w-11 rounded-xl flex items-center justify-center ${stat.bg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-primary-800)]">
                  {stat.value}
                </p>
                <p className="text-xs text-[var(--color-neutral-500)]">
                  {stat.label}
                </p>
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
          },
          {
            label: "Audit Logs",
            desc: "Full system activity trail",
            href: "/admin/audit-logs",
            icon: ClipboardList,
          },
          {
            label: "All Executions",
            desc: "View all startup and investor executions",
            href: "/admin/executions",
            icon: BarChart2,
          },
        ].map((link) => (
          <Link key={link.label} href={link.href}>
            <Card className="border border-[var(--color-border)] hover:shadow-md hover:border-[var(--color-primary-200)] transition-all cursor-pointer h-full">
              <CardContent className="p-5 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <link.icon className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-primary-800)]">
                    {link.label}
                  </p>
                  <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                    {link.desc}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--color-neutral-400)] flex-shrink-0 mt-0.5" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}