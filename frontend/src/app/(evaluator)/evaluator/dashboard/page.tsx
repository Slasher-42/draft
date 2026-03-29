"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { evaluatorService } from "@/services/evaluatorService";
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    evaluatorService
      .getDashboardStats()
      .then((res) => setStats(res.data.data))
      .catch(() =>
        setStats({
          totalAssigned: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          escalated: 0,
        })
      )
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

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
            bg: "bg-[var(--color-primary-50)]",
            color: "text-[var(--color-primary)]",
          },
          {
            label: "Pending Review",
            value: stats?.pending ?? 0,
            icon: Clock,
            bg: "bg-blue-50",
            color: "text-blue-600",
          },
          {
            label: "Approved",
            value: stats?.approved ?? 0,
            icon: CheckCircle2,
            bg: "bg-green-50",
            color: "text-green-600",
          },
          {
            label: "Rejected",
            value: stats?.rejected ?? 0,
            icon: XCircle,
            bg: "bg-red-50",
            color: "text-red-500",
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

      {/* Quick action */}
      {(stats?.pending ?? 0) > 0 && (
        <Card className="border border-[var(--color-primary-200)] bg-[var(--color-primary-50)]">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[var(--color-primary-800)]">
                  {stats?.pending} execution
                  {(stats?.pending ?? 0) > 1 ? "s" : ""} waiting for your
                  review
                </p>
                <p className="text-xs text-[var(--color-primary-600)]">
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
          </CardContent>
        </Card>
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
            },
            {
              step: "2",
              title: "Your Review",
              desc: "You review the AI scores and apply your professional judgment about the startup's credibility and market context.",
            },
            {
              step: "3",
              title: "Final Decision",
              desc: "You Approve, Reject, or Escalate the startup. Every decision requires a written reason for full accountability.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="h-7 w-7 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.step}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-foreground)]">
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