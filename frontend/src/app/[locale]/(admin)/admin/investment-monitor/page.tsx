"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { adminService } from "@/services/adminService";
import { userService } from "@/services/userService";
import { investmentMonitorService } from "@/services/messageService";
import {
  Loader2, CheckCircle2, Clock, DollarSign, Briefcase,
  Mail, Send, TrendingUp, AlertCircle, Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type FilterType = "ALL" | "FUNDED" | "NOT_FUNDED";

export default function AdminInvestmentMonitorPage() {
  return <InvestmentMonitorView role="ADMIN" />;
}

export function InvestmentMonitorView({ role }: { role: "ADMIN" | "EVALUATOR" }) {
  const t = useTranslations("admin.investmentMonitor");
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [askingId, setAskingId] = useState<number | null>(null);

  const { data: executions = [], isLoading } = useQuery({
    queryKey: ["investment-monitor-executions"],
    queryFn: async () => {
      // Fetch investor executions directly — avoids the ADMIN-only startup/all endpoint
      // so both ADMIN and EVALUATOR can use this view.
      const res = await adminService.getAllInvestorExecutions();
      const investorExecs: any[] = res.data?.data ?? [];
      // Enrich with investor user info
      const uniqueUserIds = [...new Set(investorExecs.map((e: any) => e.userId))];
      const userMap: Record<number, any> = {};
      await Promise.allSettled(
        uniqueUserIds.map(async (uid) => {
          try {
            const u = await userService.getById(uid as number);
            let ip = null;
            try { ip = await userService.getInvestorProfile(uid as number); } catch {}
            userMap[uid as number] = { ...u, investorProfile: ip };
          } catch {}
        })
      );
      return investorExecs.map((e: any) => ({
        ...e,
        investorInfo: userMap[e.userId] ?? null,
      }));
    },
    staleTime: 1000 * 60 * 2,
  });

  const handleAskForFund = async (exec: any) => {
    const inv = exec.investorInfo;
    if (!inv?.email) {
      toast.error(t("toastNoEmail"));
      return;
    }
    setAskingId(exec.id);
    try {
      await investmentMonitorService.askForFund({
        investorUserId: exec.userId,
        executionId: exec.id,
        investorName: inv.fullName ?? `Investor #${exec.userId}`,
        investorEmail: inv.email,
        fundingAmount: exec.investmentBudget,
        executionTitle: exec.preferredIndustry,
      });
      toast.success(t("toastFundRequestSent", { name: inv.fullName ?? inv.email }));
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 503) {
        toast.error(t("toastServiceWakingUp"));
      } else if (status === 401) {
        toast.error(t("toastSessionExpired"));
      } else if (status === 403) {
        toast.error(t("toastNoPermission"));
      } else {
        toast.error(t("toastFundRequestFailed"));
      }
    } finally {
      setAskingId(null);
    }
  };

  const filtered = executions.filter((e: any) => {
    if (filter === "FUNDED") return e.funded === true;
    if (filter === "NOT_FUNDED") return !e.funded;
    return true;
  });

  const fundedCount = executions.filter((e: any) => e.funded).length;
  const notFundedCount = executions.filter((e: any) => !e.funded).length;

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
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">{t("title")}</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          {t("subtitle")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-bg-blue rounded-2xl border p-5 flex items-center gap-4"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#1D4ED8,#3B82F6)" }}>
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-extrabold stat-text-blue">{executions.length}</p>
            <p className="text-xs font-medium stat-text-blue opacity-75">{t("totalExecutions")}</p>
          </div>
        </div>
        <div className="stat-bg-green rounded-2xl border p-5 flex items-center gap-4"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#059669,#10B981)" }}>
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-extrabold stat-text-green">{fundedCount}</p>
            <p className="text-xs font-medium stat-text-green opacity-75">{t("funded")}</p>
          </div>
        </div>
        <div className="stat-bg-amber rounded-2xl border p-5 flex items-center gap-4"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#B45309,#D97706)" }}>
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-extrabold stat-text-amber">{notFundedCount}</p>
            <p className="text-xs font-medium stat-text-amber opacity-75">{t("notFunded")}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-[var(--color-neutral-400)]" />
        {(["ALL", "FUNDED", "NOT_FUNDED"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === f
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-200)]"
            }`}
          >
            {f === "NOT_FUNDED" ? t("notFunded") : f === "ALL" ? t("filterAll") : t("funded")}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-[var(--color-neutral-400)]">
              <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>{t("noExecutionsFilter")}</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {filtered.map((exec: any) => {
                const inv = exec.investorInfo;
                const isFunded = exec.funded === true;
                return (
                  <div key={exec.id} className="flex items-center gap-4 p-4 hover:bg-[var(--color-neutral-50)] transition-colors">
                    {/* Status indicator */}
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isFunded ? "bg-green-100" : "bg-amber-100"
                    }`}>
                      {isFunded
                        ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                        : <Clock className="h-5 w-5 text-amber-600" />}
                    </div>

                    {/* Investor info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[var(--color-foreground)] text-sm">
                          {inv?.fullName ?? `Investor #${exec.userId}`}
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFunded
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {isFunded ? t("fundedBadge") : t("notFundedBadge")}
                        </span>
                        {exec.status && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]">
                            {exec.status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 flex-wrap">
                        {inv?.email && (
                          <span className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                            <Mail className="h-3 w-3" />{inv.email}
                          </span>
                        )}
                        {exec.preferredIndustry && (
                          <span className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                            <Briefcase className="h-3 w-3" />{exec.preferredIndustry}
                          </span>
                        )}
                        {exec.investmentBudget && (
                          <span className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                            <DollarSign className="h-3 w-3" />${Number(exec.investmentBudget).toLocaleString()}
                          </span>
                        )}
                        {isFunded && exec.fundedAt && (
                          <span className="text-xs text-green-600 font-medium">
                            {t("fundedOn", { date: new Date(exec.fundedAt).toLocaleDateString() })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ask for Fund button — only for unfunded */}
                    {!isFunded && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAskForFund(exec)}
                        disabled={askingId === exec.id}
                        className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 flex-shrink-0"
                      >
                        {askingId === exec.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Send className="h-3.5 w-3.5" />}
                        {t("askForFund")}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
