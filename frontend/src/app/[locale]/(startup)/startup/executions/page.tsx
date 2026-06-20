"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { startupService } from "@/services/startupService";
import { matchingService } from "@/services/matchingService";
import { userService } from "@/services/userService";
import { investorService } from "@/services/investorService";
import { useAuth } from "@/context/AuthContext";
import { StartupExecution } from "@/types/execution";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusCircle,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  Briefcase,
  AlertCircle,
  Upload,
  DollarSign,
  Sparkles,
  X,
  Phone,
  MapPin,
  Building2,
  Target,
  BarChart2,
  CalendarClock,
} from "lucide-react";

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

interface InvestorModalData {
  user: any;
  profile: any;
  execution: any;
  matchScore?: number;
  matchReason?: string;
  matchedAt?: string;
}

function InvestorDetailModal({
  data,
  onClose,
}: {
  data: InvestorModalData;
  onClose: () => void;
}) {
  const t = useTranslations("startup.executions");
  const { user, profile, execution, matchScore, matchReason, matchedAt } = data;

  const displayName =
    profile?.organizationName ?? user?.fullName ?? "Matched Investor";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-background)] rounded-2xl shadow-2xl border border-[var(--color-border)] w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--color-primary-50)] flex items-center justify-center">
              <Building2 className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-primary-800)]">
                {displayName}
              </h3>
              <p className="text-xs text-[var(--color-neutral-400)]">
                {t("matchedInvestorTitle")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-neutral-100)] transition-colors"
          >
            <X className="h-4 w-4 text-[var(--color-neutral-500)]" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {matchScore !== undefined && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  {t("matchScore", { score: matchScore.toFixed(1) })}
                </p>
                {matchReason && (
                  <p className="text-xs text-emerald-600 mt-0.5">{matchReason}</p>
                )}
              </div>
            </div>
          )}

          <Card className="border border-[var(--color-border)]">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-[var(--color-neutral-500)] uppercase tracking-wide">
                {t("contactInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-[var(--color-neutral-400)]" />
                <div>
                  <p className="text-xs text-[var(--color-neutral-400)]">{t("fullName")}</p>
                  <p className="text-sm font-medium text-[var(--color-foreground)]">
                    {user?.fullName ?? "—"}
                  </p>
                </div>
              </div>

              {user?.phoneNumber && (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-[var(--color-neutral-400)]" />
                  <div>
                    <p className="text-xs text-[var(--color-neutral-400)]">{t("phoneNumber")}</p>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">
                      {user.phoneNumber}
                    </p>
                  </div>
                </div>
              )}

              {(profile?.country || profile?.city) && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-[var(--color-neutral-400)]" />
                  <div>
                    <p className="text-xs text-[var(--color-neutral-400)]">{t("locationLabel")}</p>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">
                      {[profile.city, profile.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {profile && (
            <Card className="border border-[var(--color-border)]">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-[var(--color-neutral-500)] uppercase tracking-wide">
                  {t("investorProfile")}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 grid grid-cols-2 gap-3">
                {profile.organizationName && (
                  <div className="col-span-2">
                    <p className="text-xs text-[var(--color-neutral-400)]">{t("organization")}</p>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">
                      {profile.organizationName}
                    </p>
                  </div>
                )}
                {profile.preferredIndustry && (
                  <div className="flex items-start gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-[var(--color-neutral-400)] mt-0.5" />
                    <div>
                      <p className="text-xs text-[var(--color-neutral-400)]">{t("preferredIndustry")}</p>
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        {profile.preferredIndustry}
                      </p>
                    </div>
                  </div>
                )}
                {profile.investmentBudget && (
                  <div className="flex items-start gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-[var(--color-neutral-400)] mt-0.5" />
                    <div>
                      <p className="text-xs text-[var(--color-neutral-400)]">{t("investmentBudget")}</p>
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        ${Number(profile.investmentBudget).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {execution && (
            <Card className="border border-[var(--color-border)]">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-[var(--color-neutral-500)] uppercase tracking-wide">
                  {t("executionDetails")}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {execution.preferredIndustry && (
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-[var(--color-neutral-400)] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[var(--color-neutral-400)]">{t("industryInterest")}</p>
                      <p className="text-sm text-[var(--color-foreground)]">
                        {execution.preferredIndustry}
                      </p>
                    </div>
                  </div>
                )}
                {execution.investmentReason && (
                  <div className="flex items-start gap-2">
                    <Target className="h-3.5 w-3.5 text-[var(--color-neutral-400)] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[var(--color-neutral-400)]">{t("reasonForInvesting")}</p>
                      <p className="text-sm text-[var(--color-foreground)]">
                        {execution.investmentReason}
                      </p>
                    </div>
                  </div>
                )}
                {execution.investmentBudget && (
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-[var(--color-neutral-400)] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[var(--color-neutral-400)]">{t("investmentBudget")}</p>
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        ${Number(execution.investmentBudget).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {execution.expectedReturnTimeline && (
                  <div className="flex items-start gap-2">
                    <CalendarClock className="h-3.5 w-3.5 text-[var(--color-neutral-400)] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[var(--color-neutral-400)]">{t("expectedReturnTimeline")}</p>
                      <p className="text-sm text-[var(--color-foreground)]">
                        {execution.expectedReturnTimeline}
                      </p>
                    </div>
                  </div>
                )}
                {execution.successCriteria && (
                  <div className="flex items-start gap-2">
                    <BarChart2 className="h-3.5 w-3.5 text-[var(--color-neutral-400)] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[var(--color-neutral-400)]">{t("successCriteriaLabel")}</p>
                      <p className="text-sm text-[var(--color-foreground)]">
                        {execution.successCriteria}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {matchedAt && (
            <p className="text-xs text-center text-[var(--color-neutral-400)]">
              {t("matchedOnDate", { date: new Date(matchedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }) })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StartupExecutionsPage() {
  const { user } = useAuth();
  const t = useTranslations("startup.executions");
  const queryClient = useQueryClient();
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);
  const [uploadingImageId, setUploadingImageId] = useState<number | null>(null);
  const [loadingMatchId, setLoadingMatchId] = useState<number | null>(null);
  const [modalData, setModalData] = useState<InvestorModalData | null>(null);

  const statusConfig = {
    PENDING:  { label: t("statusPending"),  icon: Clock,         variant: "pending"     as const },
    MATCHED:  { label: t("statusMatched"),  icon: CheckCircle2,  variant: "success"     as const },
    REJECTED: { label: t("statusRejected"), icon: XCircle,       variant: "destructive" as const },
    APPROVED: { label: t("statusApproved"), icon: CheckCircle2,  variant: "success"     as const },
  };

  const { data: executions = [], isLoading } = useQuery<StartupExecution[]>({
    queryKey: ["startup-executions"],
    queryFn: async () => {
      const res = await startupService.getExecutions();
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.content)) return data.content;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });

  const { data: matchCounts = {} } = useQuery<Record<number, number>>({
    queryKey: ["startup-match-counts", user?.id],
    queryFn: async () => {
      const res = await matchingService.getMatchesForStartup(Number(user!.id));
      const matches = res.data?.data ?? [];
      const counts: Record<number, number> = {};
      matches.forEach((m: any) => {
        counts[m.startupExecutionId] = (counts[m.startupExecutionId] ?? 0) + 1;
      });
      return counts;
    },
    enabled: !!user?.id,
  });

  const handleImageUpload = async (id: number, file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error(t("toastInvalidImage"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("toastImageTooLarge"));
      return;
    }
    setUploadingImageId(id);
    try {
      const res = await startupService.uploadExecutionImage(String(id), file);
      const url = res.data?.data?.imageUrl ?? res.data?.imageUrl;
      queryClient.setQueryData<StartupExecution[]>(["startup-executions"], (prev) =>
        (prev ?? []).map((e) => (e.id === id ? { ...e, imageUrl: url } : e))
      );
      toast.success(t("toastImageUploaded"));
    } catch {
      toast.error(t("toastImageFailed"));
    } finally {
      setUploadingImageId(null);
    }
  };

  const handleWithdraw = async (id: number) => {
    setWithdrawingId(id);
    try {
      await startupService.withdrawExecution(String(id));
      queryClient.setQueryData<StartupExecution[]>(["startup-executions"], (prev) =>
        (prev ?? []).filter((e) => e.id !== id)
      );
      toast.success(t("toastWithdrawn"));
    } catch {
      toast.error(t("toastWithdrawFailed"));
    } finally {
      setWithdrawingId(null);
    }
  };

  const handleViewMatchedInvestor = async (execId: number) => {
    if (!user?.id) return;
    setLoadingMatchId(execId);
    try {
      const matchRes = await matchingService.getMatchesForStartup(Number(user.id));
      const matches: any[] = matchRes.data?.data ?? matchRes.data ?? [];

      const match = matches.find((m: any) => m.startupExecutionId === execId);
      if (!match) {
        toast.error(t("toastNoMatch"));
        return;
      }

      const investorUser = await userService.getById(match.investorUserId);

      let investorProfile = null;
      try {
        investorProfile = await userService.getInvestorProfile(match.investorUserId);
      } catch {
        // non-critical
      }

      let investorExecution = null;
      try {
        const execRes = await investorService.getExecutionByIdInternal(
          match.investorExecutionId
        );
        investorExecution = execRes?.data?.data ?? execRes?.data ?? null;
      } catch {
        // non-critical
      }

      setModalData({
        user: investorUser,
        profile: investorProfile,
        execution: investorExecution,
        matchScore: match.matchScore,
        matchReason: match.matchReason,
        matchedAt: match.matchedAt,
      });
    } catch {
      toast.error(t("toastMatchFailed"));
    } finally {
      setLoadingMatchId(null);
    }
  };

  return (
    <div className="space-y-6">
      {modalData && (
        <InvestorDetailModal data={modalData} onClose={() => setModalData(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
            {t("title")}
          </h2>
          <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
            {t("subtitle")}
          </p>
        </div>
        <Link href="/startup/execute">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            {t("newExecution")}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            labelKey: "statTotalSubmitted" as const,
            value: executions.length,
            icon: Briefcase,
            bg: "bg-[var(--color-primary-50)]",
            color: "text-[var(--color-primary)]",
          },
          {
            labelKey: "statMatched" as const,
            value: executions.filter((e) => e.status === "MATCHED").length,
            icon: CheckCircle2,
            bg: "bg-green-50",
            color: "text-green-600",
          },
          {
            labelKey: "statPendingReview" as const,
            value: executions.filter((e) => e.status === "PENDING").length,
            icon: Clock,
            bg: "bg-blue-50",
            color: "text-blue-600",
          },
        ].map((stat) => (
          <Card key={stat.labelKey} className="border border-[var(--color-border)]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-primary-800)]">
                  {stat.value}
                </p>
                <p className="text-xs text-[var(--color-neutral-500)]">
                  {t(stat.labelKey)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <PageSkeleton stats={3} rows={3} />
      ) : executions.length === 0 ? (
        <Card className="border border-dashed border-[var(--color-border)]">
          <CardContent className="p-12 flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-[var(--color-primary-50)] flex items-center justify-center">
              <Briefcase className="h-7 w-7 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-primary-800)]">
                {t("noExecutions")}
              </p>
              <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                {t("noExecutionsDesc")}
              </p>
            </div>
            <Link href="/startup/execute">
              <Button className="gap-2 mt-2">
                <PlusCircle className="h-4 w-4" />
                {t("newExecution")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {executions.map((exec) => {
            const cfg =
              statusConfig[exec.status as keyof typeof statusConfig] ??
              statusConfig.PENDING;
            const StatusIcon = cfg.icon;

            return (
              <Card
                key={exec.id}
                className="border border-[var(--color-border)] hover:shadow-md transition-shadow flex flex-col"
              >
                {exec.imageUrl && (
                  <div className="relative h-36 w-full overflow-hidden rounded-t-xl">
                    <img
                      src={exec.imageUrl}
                      alt="Execution"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <CardContent className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                        exec.status === "MATCHED"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : exec.status === "REJECTED"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          exec.status === "MATCHED"
                            ? "bg-emerald-500"
                            : exec.status === "REJECTED"
                            ? "bg-red-500"
                            : "bg-blue-500 animate-pulse"
                        }`}
                      />
                      <StatusIcon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </span>
                    <span className="text-xs text-[var(--color-neutral-400)]">
                      #{exec.id}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--color-neutral-600)] line-clamp-2 leading-relaxed">
                    {exec.problemStatement}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 rounded-xl bg-[var(--color-primary-50)] px-3 py-2">
                      <DollarSign className="h-3.5 w-3.5 text-[var(--color-primary-600)] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wide text-[var(--color-neutral-400)]">
                          {t("fundingNeeded")}
                        </p>
                        <p className="text-xs font-bold text-[var(--color-primary-800)] truncate">
                          {exec.fundingNeeded ? formatCurrency(exec.fundingNeeded) : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                      <DollarSign className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wide text-[var(--color-neutral-400)]">
                          {t("revenueYr")}
                        </p>
                        <p className="text-xs font-bold text-slate-700 truncate">
                          {exec.annualRevenue !== undefined
                            ? formatCurrency(exec.annualRevenue)
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {exec.status === "MATCHED" && (
                    <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                      {matchCounts[exec.id]
                        ? t("matchNotice", { count: matchCounts[exec.id] })
                        : t("matchNoticeSingle")}
                    </p>
                  )}

                  {exec.status === "PENDING" && !exec.aiSessionId && (
                    <div className="space-y-2">
                      <p className="text-xs text-blue-600 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {t("aiPending")}
                      </p>
                      <Link href={`/startup/ai?executionId=${exec.id}`}>
                        <Button size="sm" className="gap-1.5 w-full bg-violet-600 hover:bg-violet-700 text-white border-0">
                          <Sparkles className="h-3.5 w-3.5" />
                          {t("completeAI")}
                        </Button>
                      </Link>
                    </div>
                  )}

                  {exec.status === "PENDING" && exec.aiSessionId && (
                    <p className="text-xs text-blue-600 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {t("awaitingReview")}
                    </p>
                  )}

                  {exec.status === "REJECTED" && exec.statusReason && (
                    <div className="flex items-start gap-1.5 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span>{exec.statusReason}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
                    <Link href={`/startup/executions/${exec.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        {t("viewBtn")}
                      </Button>
                    </Link>

                    {exec.status === "MATCHED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                        onClick={() => handleViewMatchedInvestor(exec.id)}
                        disabled={loadingMatchId === exec.id}
                      >
                        {loadingMatchId === exec.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Building2 className="h-3.5 w-3.5" />
                        )}
                        {t("matchedInvestorBtn")}
                      </Button>
                    )}

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(exec.id, file);
                          e.target.value = "";
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 pointer-events-none"
                        disabled={uploadingImageId === exec.id}
                      >
                        {uploadingImageId === exec.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        {exec.imageUrl ? t("replaceImage") : t("uploadImage")}
                      </Button>
                    </label>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      onClick={() => handleWithdraw(exec.id)}
                      disabled={withdrawingId === exec.id}
                    >
                      {withdrawingId === exec.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      {t("withdrawBtn")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
