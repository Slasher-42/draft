"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { investorService } from "@/services/investorService";
import { matchingService } from "@/services/matchingService";
import { userService } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import { InvestorExecution } from "@/types/execution";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusCircle, Eye, Clock, CheckCircle2, XCircle, Loader2,
  DollarSign, Briefcase, AlertCircle, Rocket, X,
  Phone, Globe, MapPin, Users, Calendar, TrendingUp, Building2,
} from "lucide-react";

interface StartupModalData {
  user: any;
  profile: any;
  execution: any;
  matchScore?: number;
  matchReason?: string;
  matchedAt?: string;
}

function StartupDetailModal({ data, onClose }: { data: StartupModalData; onClose: () => void }) {
  const t = useTranslations("investor.executions");
  const { user, profile, execution, matchScore, matchReason, matchedAt } = data;

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
            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Rocket className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-primary-800)]">
                {profile?.companyName ?? user?.fullName ?? "Matched Startup"}
              </h3>
              <p className="text-xs text-[var(--color-neutral-400)]">{t("modalSubtitle")}</p>
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
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700">
                  {t("matchScore", { score: matchScore.toFixed(1) })}
                </p>
                {matchReason && (
                  <p className="text-xs text-green-600 mt-0.5">{matchReason}</p>
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
                  <p className="text-sm font-medium text-[var(--color-foreground)]">{user?.fullName ?? "—"}</p>
                </div>
              </div>
              {user?.phoneNumber && (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-[var(--color-neutral-400)]" />
                  <div>
                    <p className="text-xs text-[var(--color-neutral-400)]">{t("phoneNumber")}</p>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">{user.phoneNumber}</p>
                  </div>
                </div>
              )}
              {profile?.website && (
                <div className="flex items-center gap-2.5">
                  <Globe className="h-4 w-4 text-[var(--color-neutral-400)]" />
                  <div>
                    <p className="text-xs text-[var(--color-neutral-400)]">{t("website")}</p>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-medium text-[var(--color-primary)] hover:underline">
                      {profile.website}
                    </a>
                  </div>
                </div>
              )}
              {(profile?.country || profile?.city) && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-[var(--color-neutral-400)]" />
                  <div>
                    <p className="text-xs text-[var(--color-neutral-400)]">{t("location")}</p>
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
                  {t("companyProfile")}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 grid grid-cols-2 gap-3">
                {profile.industry && (
                  <div>
                    <p className="text-xs text-[var(--color-neutral-400)]">{t("industry")}</p>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">{profile.industry}</p>
                  </div>
                )}
                {profile.foundedYear && (
                  <div className="flex items-start gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[var(--color-neutral-400)] mt-0.5" />
                    <div>
                      <p className="text-xs text-[var(--color-neutral-400)]">{t("founded")}</p>
                      <p className="text-sm font-medium text-[var(--color-foreground)]">{profile.foundedYear}</p>
                    </div>
                  </div>
                )}
                {profile.teamSize && (
                  <div className="flex items-start gap-1.5">
                    <Users className="h-3.5 w-3.5 text-[var(--color-neutral-400)] mt-0.5" />
                    <div>
                      <p className="text-xs text-[var(--color-neutral-400)]">{t("teamSize")}</p>
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        {t("teamSizePeople", { size: profile.teamSize })}
                      </p>
                    </div>
                  </div>
                )}
                {profile.fundingNeeded && (
                  <div className="flex items-start gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-[var(--color-neutral-400)] mt-0.5" />
                    <div>
                      <p className="text-xs text-[var(--color-neutral-400)]">{t("fundingNeeded")}</p>
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        ${Number(profile.fundingNeeded).toLocaleString()}
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
                {execution.problemStatement && (
                  <div>
                    <p className="text-xs text-[var(--color-neutral-400)]">{t("problemStatement")}</p>
                    <p className="text-sm text-[var(--color-foreground)]">{execution.problemStatement}</p>
                  </div>
                )}
                {execution.targetMarket && (
                  <div>
                    <p className="text-xs text-[var(--color-neutral-400)]">{t("targetMarket")}</p>
                    <p className="text-sm text-[var(--color-foreground)]">{execution.targetMarket}</p>
                  </div>
                )}
                {execution.businessModel && (
                  <div>
                    <p className="text-xs text-[var(--color-neutral-400)]">{t("businessModel")}</p>
                    <p className="text-sm text-[var(--color-foreground)]">{execution.businessModel}</p>
                  </div>
                )}
                {execution.fundingNeeded && (
                  <div>
                    <p className="text-xs text-[var(--color-neutral-400)]">{t("fundingNeeded")}</p>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">
                      ${Number(execution.fundingNeeded).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {matchedAt && (
            <p className="text-xs text-center text-[var(--color-neutral-400)]">
              {t("matchedOn", { date: new Date(matchedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InvestorExecutionsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const t = useTranslations("investor.executions");
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);
  const [loadingMatchId, setLoadingMatchId] = useState<number | null>(null);
  const [modalData, setModalData] = useState<StartupModalData | null>(null);

  const statusConfig = {
    PENDING:  { label: t("statusPending"),  icon: Clock,        variant: "pending"     as const },
    MATCHED:  { label: t("statusMatched"),  icon: CheckCircle2, variant: "success"     as const },
    REJECTED: { label: t("statusClosed"),   icon: XCircle,      variant: "destructive" as const },
  };

  const { data: executions = [], isLoading } = useQuery<InvestorExecution[]>({
    queryKey: ["investor-executions"],
    queryFn: async () => {
      const res = await investorService.getExecutions();
      return res.data.data ?? [];
    },
  });

  const handleWithdraw = async (id: number) => {
    setWithdrawingId(id);
    try {
      await investorService.withdrawExecution(String(id));
      queryClient.setQueryData<InvestorExecution[]>(["investor-executions"], (prev) =>
        (prev ?? []).filter((e) => e.id !== id)
      );
      toast.success(t("toastWithdrawSuccess"));
    } catch {
      toast.error(t("toastWithdrawFailed"));
    } finally {
      setWithdrawingId(null);
    }
  };

  const handleViewMatchedStartup = async (execId: number) => {
    if (!user?.id) return;
    setLoadingMatchId(execId);
    try {
      const matchRes = await matchingService.getMatchesForInvestor(Number(user.id));
      const matches: any[] = matchRes.data?.data ?? matchRes.data ?? [];

      const match = matches.find((m: any) => m.investorExecutionId === execId);
      if (!match) {
        toast.error(t("toastNoMatch"));
        return;
      }

      const startupUser = await userService.getById(match.startupUserId);

      let startupProfile = null;
      try {
        startupProfile = await userService.getStartupProfile(match.startupUserId);
      } catch {}

      let startupExecution = null;
      try {
        const execRes = await fetch(
          `https://startupapplicationservice.onrender.com/api/executions/startup/internal/${match.startupExecutionId}`,
          {
            headers: {
              Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`,
            },
          }
        );
        if (execRes.ok) {
          const execJson = await execRes.json();
          startupExecution = execJson?.data ?? null;
        }
      } catch {}

      setModalData({
        user: startupUser,
        profile: startupProfile,
        execution: startupExecution,
        matchScore: match.matchScore,
        matchReason: match.matchReason,
        matchedAt: match.matchedAt,
      });
    } catch {
      toast.error(t("toastLoadFailed"));
    } finally {
      setLoadingMatchId(null);
    }
  };

  return (
    <div className="space-y-6">
      {modalData && (
        <StartupDetailModal data={modalData} onClose={() => setModalData(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">{t("title")}</h2>
          <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">{t("subtitle")}</p>
        </div>
        <Link href="/investor/execute">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            {t("newExecution")}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { labelKey: "statTotal",   value: executions.length,                                        icon: Briefcase,   iconBg: "linear-gradient(135deg,#1D4ED8,#3B82F6)", iconShadow: "rgba(59,130,246,0.35)",  bgClass: "stat-bg-blue",  textClass: "stat-text-blue" },
          { labelKey: "statMatched", value: executions.filter((e) => e.status === "MATCHED").length,  icon: CheckCircle2,iconBg: "linear-gradient(135deg,#059669,#10B981)", iconShadow: "rgba(16,185,129,0.35)", bgClass: "stat-bg-green", textClass: "stat-text-green" },
          { labelKey: "statPending", value: executions.filter((e) => e.status === "PENDING").length,  icon: Clock,       iconBg: "linear-gradient(135deg,#B45309,#D97706)", iconShadow: "rgba(217,119,6,0.35)",  bgClass: "stat-bg-amber", textClass: "stat-text-amber" },
        ].map((stat) => (
          <div
            key={stat.labelKey}
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
              <p className={`text-xs font-medium mt-0.5 opacity-75 ${stat.textClass}`}>{t(stat.labelKey as any)}</p>
            </div>
          </div>
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
              <p className="font-semibold text-[var(--color-primary-800)]">{t("noInvestments")}</p>
              <p className="text-sm text-[var(--color-neutral-500)] mt-1">{t("noInvestmentsDesc")}</p>
            </div>
            <Link href="/investor/execute">
              <Button className="gap-2 mt-2">
                <PlusCircle className="h-4 w-4" />
                {t("newExecution")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {executions.map((exec) => {
            const cfg = statusConfig[exec.status as keyof typeof statusConfig] ?? statusConfig.PENDING;
            const StatusIcon = cfg.icon;

            return (
              <Card key={exec.id} className="border border-[var(--color-border)] hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={cfg.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                        <span className="text-xs text-[var(--color-neutral-400)]">#{exec.id}</span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-neutral-600)]">
                        {exec.preferredIndustry && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {exec.preferredIndustry}
                          </span>
                        )}
                        {exec.investmentBudget && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            ${exec.investmentBudget.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {exec.status === "MATCHED" && (
                        <p className="text-xs text-green-600 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t("matchedSuccessfully")}
                        </p>
                      )}

                      {exec.status === "REJECTED" && (exec as any).statusReason && (
                        <div className="flex items-start gap-1.5 text-xs text-red-500">
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                          <span>{(exec as any).statusReason}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <Link href={`/investor/executions/${exec.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          {t("viewBtn")}
                        </Button>
                      </Link>

                      {exec.status === "MATCHED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                          onClick={() => handleViewMatchedStartup(exec.id)}
                          disabled={loadingMatchId === exec.id}
                        >
                          {loadingMatchId === exec.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Rocket className="h-3.5 w-3.5" />
                          )}
                          {t("matchedStartupBtn")}
                        </Button>
                      )}

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
