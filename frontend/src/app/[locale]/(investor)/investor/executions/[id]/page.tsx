"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { investorService } from "@/services/investorService";
import { matchingService } from "@/services/matchingService";
import { useAuth } from "@/context/AuthContext";
import { InvestorExecution } from "@/types/execution";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";

export default function InvestorExecutionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations("investor.executionDetail");
  const [execution, setExecution] = useState<InvestorExecution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  const statusConfig = {
    PENDING:  { label: t("statusPending")  ?? "Pending", icon: Clock,        variant: "pending"     as const },
    MATCHED:  { label: t("statusMatched")  ?? "Matched", icon: CheckCircle2, variant: "success"     as const },
    REJECTED: { label: t("statusClosed")   ?? "Closed",  icon: XCircle,      variant: "destructive" as const },
  };

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      await investorService.withdrawExecution(id as string);
      toast.success(t("toastWithdrawSuccess"));
      router.push("/investor/executions");
    } catch {
      toast.error(t("toastWithdrawFailed"));
    } finally {
      setIsWithdrawing(false);
      setShowConfirm(false);
    }
  };

  useEffect(() => {
    investorService
      .getExecutionById(id as string)
      .then((res) => setExecution(res.data.data))
      .catch(() => setExecution(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (execution?.status === "MATCHED" && user?.id) {
      matchingService
        .getMatchesForInvestor(Number(user.id))
        .then((res) => setMatches(res.data.data ?? []))
        .catch(() => {});
    }
  }, [execution, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-[var(--color-neutral-400)]" />
        <p className="text-[var(--color-neutral-500)]">{t("executionNotFound")}</p>
        <Button variant="outline" onClick={() => router.back()}>{t("goBack")}</Button>
      </div>
    );
  }

  const cfg = statusConfig[execution.status as keyof typeof statusConfig] ?? statusConfig.PENDING;
  const StatusIcon = cfg.icon;

  const detailRows = [
    { label: t("industry"),               value: execution.preferredIndustry },
    { label: t("reasonForInvesting"),     value: execution.investmentReason },
    { label: t("investmentBudget"),       value: `$${execution.investmentBudget?.toLocaleString()}` },
    { label: t("expectedReturnTimeline"), value: execution.expectedReturnTimeline },
    ...(execution.successCriteria
      ? [{ label: t("successCriteria"),   value: execution.successCriteria }]
      : []),
    ...(execution.additionalConsiderations
      ? [{ label: t("additionalConsiderations"), value: execution.additionalConsiderations }]
      : []),
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[var(--color-neutral-500)] hover:text-[var(--color-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToInvestments")}
      </button>

      <Card className="border border-[var(--color-border)]">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--color-neutral-400)] mb-1">
              {t("submittedOn", { date: new Date(execution.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) })}
            </p>
            <Badge variant={cfg.variant} className="gap-1 text-sm px-3 py-1">
              <StatusIcon className="h-4 w-4" />
              {cfg.label}
            </Badge>
          </div>
          {execution.status === "PENDING" && (
            <p className="text-xs text-blue-600 flex items-center gap-1.5 max-w-xs text-right">
              <Clock className="h-4 w-4 flex-shrink-0" />
              {t("pendingMsg")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle>{t("executionDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {detailRows.map((item) => (
            <div key={item.label} className="border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
              <p className="text-xs font-medium text-[var(--color-neutral-400)] uppercase tracking-wide mb-1">
                {item.label}
              </p>
              <p className="text-sm text-[var(--color-foreground)] leading-relaxed">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {execution.status === "MATCHED" && matches.length > 0 && (
        <Card className="border border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {t("matchedStartups")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="bg-white rounded-xl border border-green-100 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-green-700">
                    {t("matchScore")}
                  </span>
                  <span className="text-sm font-bold text-green-700">
                    {match.matchScore?.toFixed(1)} / 100
                  </span>
                </div>
                <div className="border-t border-green-100 pt-3">
                  <p className="text-xs font-medium text-[var(--color-neutral-400)] uppercase tracking-wide mb-1">
                    {t("whyThisMatch")}
                  </p>
                  <p className="text-sm text-[var(--color-foreground)] leading-relaxed">{match.matchReason}</p>
                </div>
                <div className="border-t border-green-100 pt-3 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-medium text-[var(--color-neutral-400)] uppercase tracking-wide mb-1">
                      {t("startupExecutionId")}
                    </p>
                    <p className="text-sm text-[var(--color-foreground)]">#{match.startupExecutionId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[var(--color-neutral-400)] uppercase tracking-wide mb-1">
                      {t("matchedOn")}
                    </p>
                    <p className="text-sm text-[var(--color-foreground)]">
                      {new Date(match.matchedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!showConfirm ? (
        <div className="flex justify-end">
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 gap-2"
            onClick={() => setShowConfirm(true)}
          >
            <XCircle className="h-4 w-4" />
            {t("withdrawExecution")}
          </Button>
        </div>
      ) : (
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-semibold text-red-700">{t("withdrawConfirm")}</p>
            <p className="text-xs text-red-500">{t("withdrawWarning")}</p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)} disabled={isWithdrawing}>
                {t("cancel")}
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white gap-2"
                onClick={handleWithdraw}
                disabled={isWithdrawing}
              >
                {isWithdrawing ? (
                  <><Loader2 className="h-3 w-3 animate-spin" />{t("withdrawing")}</>
                ) : (
                  t("yesWithdraw")
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
