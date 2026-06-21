"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { evaluatorService } from "@/services/evaluatorService";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ClipboardList, CheckCircle2, XCircle, Clock, ArrowRight, TrendingUp,
} from "lucide-react";

interface DashboardStats {
  totalAssigned: number;
  pending: number;
  approved: number;
  rejected: number;
  escalated: number;
}

export default function EvaluatorDashboardPage() {
  const t = useTranslations("evaluator.dashboard");

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">{t("title")}</h2>
          <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">{t("subtitle")}</p>
        </div>
        <Link href="/evaluator/reviews">
          <Button className="gap-2">
            <ClipboardList className="h-4 w-4" />
            {t("viewAllReviews")}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { labelKey: "statTotal",    value: stats?.totalAssigned ?? 0, icon: ClipboardList, bg: "bg-blue-50",  color: "text-blue-600" },
          { labelKey: "statPending",  value: stats?.pending ?? 0,       icon: Clock,          bg: "bg-amber-50", color: "text-amber-600" },
          { labelKey: "statApproved", value: stats?.approved ?? 0,      icon: CheckCircle2,    bg: "bg-green-50", color: "text-green-600" },
          { labelKey: "statRejected", value: stats?.rejected ?? 0,      icon: XCircle,         bg: "bg-red-50",   color: "text-red-600" },
        ].map((stat) => (
          <Card key={stat.labelKey} className="border border-[var(--color-border)]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-[var(--color-neutral-500)]">{t(stat.labelKey as any)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                {t("pendingAlert", { count: stats?.pending ?? 0, plural: (stats?.pending ?? 0) > 1 ? "s" : "" })}
              </p>
              <p className="text-xs stat-text-blue opacity-75 mt-0.5">{t("pendingAlertDesc")}</p>
            </div>
          </div>
          <Link href="/evaluator/reviews">
            <Button className="gap-2">
              {t("reviewNow")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--color-secondary)]" />
            {t("processTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              step: "1",
              titleKey: "step1Title",
              descKey: "step1Desc",
              color: "#2563EB",
              bg: "linear-gradient(135deg,#1D4ED8,#3B82F6)",
            },
            {
              step: "2",
              titleKey: "step2Title",
              descKey: "step2Desc",
              color: "#7C3AED",
              bg: "linear-gradient(135deg,#6D28D9,#8B5CF6)",
            },
            {
              step: "3",
              titleKey: "step3Title",
              descKey: "step3Desc",
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
                  {t(item.titleKey as any)}
                </p>
                <p className="text-xs text-[var(--color-neutral-500)] mt-0.5 leading-relaxed">
                  {t(item.descKey as any)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
