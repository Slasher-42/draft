"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { startupService } from "@/services/startupService";
import { matchingService } from "@/services/matchingService";
import { useAuth } from "@/context/AuthContext";
import { StartupExecution } from "@/types/execution";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

const companySizeLabels: Record<string, string> = {
  PRE_SEED: "Pre-seed",
  SEED: "Seed",
  SERIES_A: "Series A",
  SERIES_B: "Series B",
  GROWTH: "Growth",
};

export default function ExecutionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations("startup.executionDetail");
  const [execution, setExecution] = useState<StartupExecution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  const statusConfig = {
    PENDING:  { label: t("statusPending"),  icon: Clock,        variant: "pending"     as const },
    MATCHED:  { label: t("statusMatched"),  icon: CheckCircle2, variant: "success"     as const },
    REJECTED: { label: t("statusRejected"), icon: XCircle,      variant: "destructive" as const },
  };

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      await startupService.withdrawExecution(id as string);
      toast.success(t("toastWithdrawn"));
      router.push("/startup/executions");
    } catch {
      toast.error(t("toastWithdrawFailed"));
    } finally {
      setIsWithdrawing(false);
      setShowConfirm(false);
    }
  };

  useEffect(() => {
    startupService
      .getExecutionById(id as string)
      .then((res) => {
        const raw = res.data;
        if (raw?.data && typeof raw.data === "object") {
          setExecution(raw.data);
        } else {
          setExecution(raw);
        }
      })
      .catch(() => setExecution(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (execution?.status === "MATCHED" && user?.id) {
      matchingService
        .getMatchesForStartup(user.id)
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
        <Button variant="outline" onClick={() => router.back()}>
          {t("goBack")}
        </Button>
      </div>
    );
  }

  const cfg = statusConfig[execution.status as keyof typeof statusConfig] ?? {
    label: execution.status ?? "Unknown",
    icon: Clock,
    variant: "pending" as const,
  };
  const StatusIcon = cfg.icon;

  const detailRows = [
    { labelKey: "companyStage",  value: companySizeLabels[execution.targetCompanySize] || execution.targetCompanySize },
    { labelKey: "problemStatement", value: execution.problemStatement },
    { labelKey: "businessModel",    value: execution.businessModel },
    { labelKey: "targetMarket",     value: execution.targetMarket },
    { labelKey: "teamDetails",      value: execution.teamDetails },
    { labelKey: "annualRevenue",    value: `$${execution.annualRevenue?.toLocaleString()}` },
    { labelKey: "monthlyBurnRate",  value: `$${execution.monthlyBurnRate?.toLocaleString()}` },
    { labelKey: "fundingNeeded",    value: `$${execution.fundingNeeded?.toLocaleString()}` },
    ...(execution.additionalConsiderations
      ? [{ labelKey: "additionalConsiderations", value: execution.additionalConsiderations }]
      : []),
  ] as { labelKey: keyof typeof t extends (key: string) => string ? string : string; value: string }[];

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[var(--color-neutral-500)] hover:text-[var(--color-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToExecutions")}
      </button>

      <Card className="border border-[var(--color-border)]">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--color-neutral-400)] mb-1">
              {t("submittedOn", { date: new Date(execution.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }) })}
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
          {execution.status === "MATCHED" && (
            <p className="text-xs text-green-600 flex items-center gap-1.5 max-w-xs text-right">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              {t("matchedMsg")}
            </p>
          )}
          {execution.status === "REJECTED" && execution.statusReason && (
            <p className="text-xs text-red-500 flex items-start gap-1.5 max-w-xs text-right">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {execution.statusReason}
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
            <div
              key={item.labelKey}
              className="border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0"
            >
              <p className="text-xs font-medium text-[var(--color-neutral-400)] uppercase tracking-wide mb-1">
                {t(item.labelKey as any)}
              </p>
              <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
                {item.value}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {execution.status === "MATCHED" && matches.length > 0 && (
        <Card className="border border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {t("investorMatchTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {matches
              .filter((m) => m.startupExecutionId === execution.id)
              .map((match) => (
                <div
                  key={match.id}
                  className="bg-white rounded-xl border border-green-100 p-4 space-y-3"
                >
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
                    <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
                      {match.matchReason}
                    </p>
                  </div>
                  <div className="border-t border-green-100 pt-3">
                    <p className="text-xs font-medium text-[var(--color-neutral-400)] uppercase tracking-wide mb-1">
                      {t("matchedOn")}
                    </p>
                    <p className="text-sm text-[var(--color-foreground)]">
                      {new Date(match.matchedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
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
            <p className="text-sm font-semibold text-red-700">
              {t("withdrawConfirm")}
            </p>
            <p className="text-xs text-red-500">
              {t("withdrawWarning")}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(false)}
                disabled={isWithdrawing}
              >
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
