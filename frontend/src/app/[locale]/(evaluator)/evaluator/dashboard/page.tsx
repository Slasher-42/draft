"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { evaluatorService } from "@/services/evaluatorService";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface DashboardStats {
  totalAssigned: number;
  pending: number;
  approved: number;
  rejected: number;
  escalated: number;
}

export default function EvaluatorDashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["evaluator-dashboard"],
    queryFn: async () => {
      const res = await evaluatorService.getDashboardStats();
      return res.data.data ?? { totalAssigned: 0, pending: 0, approved: 0, rejected: 0, escalated: 0 };
    },
  });

  if (isLoading) return <PageSkeleton stats={4} rows={2} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
            Evaluator Dashboard
          </h2>
          <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
            Review AI-generated scores and make final investment decisions
          </p>
        </div>
        <Link href="/evaluator/reviews">
          <Button className="gap-2">
            <ClipboardList className="h-4 w-4" />
            View All Reviews
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Assigned",
            value: stats?.totalAssigned ?? 0,
            icon: ClipboardList,
            bgClass: "stat-bg-blue",
            textClass: "stat-text-blue",
            iconBg: "linear-gradient(135deg,#1D4ED8,#3B82F6)",
            iconShadow: "rgba(59,130,246,0.35)",
          },
          {
            label: "Pending Review",
            value: stats?.pending ?? 0,
            icon: Clock,
            bgClass: "stat-bg-amber",
            textClass: "stat-text-amber",
            iconBg: "linear-gradient(135deg,#B45309,#D97706)",
            iconShadow: "rgba(217,119,6,0.35)",
          },
          {
            label: "Approved",
            value: stats?.approved ?? 0,
            icon: CheckCircle2,
            bgClass: "stat-bg-green",
            textClass: "stat-text-green",
            iconBg: "linear-gradient(135deg,#059669,#10B981)",
            iconShadow: "rgba(16,185,129,0.35)",
          },
          {
            label: "Rejected",
            value: stats?.rejected ?? 0,
            icon: XCircle,
            bgClass: "stat-bg-red",
            textClass: "stat-text-red",
            iconBg: "linear-gradient(135deg,#DC2626,#EF4444)",
            iconShadow: "rgba(239,68,68,0.35)",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bgClass} rounded-2xl border p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5`}
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)" }}
          >
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: stat.iconBg, boxShadow: `0 4px 12px ${stat.iconShadow}` }}
            >
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className={`text-2xl font-extrabold ${stat.textClass}`}>{stat.value}</p>
              <p className={`text-xs font-medium mt-0.5 opacity-75 ${stat.textClass}`}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick action */}
      {(stats?.pending ?? 0) > 0 && (
        <div className="stat-bg-blue rounded-2xl border p-5 flex items-center justify-between" style={{ boxShadow: "0 4px 16px rgba(37,99,235,0.10)" }}>
          <div className="flex items-center gap-3">
            <div
              className="h-11 w-11 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#1D4ED8,#3B82F6)", boxShadow: "0 4px 12px rgba(59,130,246,0.3)" }}
            >
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold stat-text-blue">
                {stats?.pending} execution
                {(stats?.pending ?? 0) > 1 ? "s" : ""} waiting for your review
              </p>
              <p className="text-xs stat-text-blue opacity-75 mt-0.5">
                Click to open pending reviews
              </p>
            </div>
          </div>
          <Link href="/evaluator/reviews">
            <Button className="gap-2">
              Review Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Info card */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--color-secondary)]" />
            How the Review Process Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              step: "1",
              title: "AI Assessment",
              desc: "The AI engine scores each startup across four dimensions — Financial Health, Team Strength, Market Potential, and Business Viability.",
              color: "#2563EB",
              bg: "linear-gradient(135deg,#1D4ED8,#3B82F6)",
            },
            {
              step: "2",
              title: "Your Review",
              desc: "You review the AI scores and apply your professional judgment about the startup's credibility and market context.",
              color: "#7C3AED",
              bg: "linear-gradient(135deg,#6D28D9,#8B5CF6)",
            },
            {
              step: "3",
              title: "Final Decision",
              desc: "You Approve, Reject, or Escalate the startup. Every decision requires a written reason for full accountability.",
              color: "#059669",
              bg: "linear-gradient(135deg,#047857,#10B981)",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div
                className="h-8 w-8 rounded-xl text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: item.bg, boxShadow: `0 4px 10px ${item.color}40` }}
              >
                {item.step}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: item.color }}>
                  {item.title}
                </p>
                <p className="text-xs text-[var(--color-neutral-500)] mt-0.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}