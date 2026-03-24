"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { AnalyticsData } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function AdminAnalyticsPage() {
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
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
          Analytics
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          Platform-wide performance metrics and trends
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Executions", value: analytics?.totalExecutions ?? 0 },
          { label: "Total Approved", value: analytics?.totalApproved ?? 0 },
          { label: "Total Matched", value: analytics?.totalMatched ?? 0 },
          {
            label: "Avg Score",
            value: analytics?.averageScore
              ? `${analytics.averageScore.toFixed(1)}/100`
              : "N/A",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="border border-[var(--color-border)]"
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-[var(--color-primary-800)]">
                {stat.value}
              </p>
              <p className="text-xs text-[var(--color-neutral-500)] mt-1">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Execution trend */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="text-base">Execution Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.executionTrend &&
          analytics.executionTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.executionTrend}>
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
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-primary)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-[var(--color-neutral-400)]">
              No trend data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score by industry */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="text-base">
            Average Score by Industry
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.scoreByIndustry &&
          analytics.scoreByIndustry.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.scoreByIndustry}>
                <XAxis
                  dataKey="industry"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
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
                  dataKey="avgScore"
                  fill="var(--color-secondary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-[var(--color-neutral-400)]">
              No industry data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Classification distribution */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="text-base">
            Readiness Classification Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: 12 }}>{value}</span>
                  )}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-[var(--color-neutral-400)]">
              No classification data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}