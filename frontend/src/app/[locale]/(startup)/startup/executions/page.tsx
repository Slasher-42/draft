"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Link } from "@/i18n/navigation";
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

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    variant: "pending" as const,
  },
  MATCHED: {
    label: "Matched",
    icon: CheckCircle2,
    variant: "success" as const,
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    variant: "destructive" as const,
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    variant: "success" as const,
  },
};

const companySizeLabels: Record<string, string> = {
  PRE_SEED: "Pre-seed",
  SEED: "Seed",
  SERIES_A: "Series A",
  SERIES_B: "Series B",
  GROWTH: "Growth",
  MICRO: "Micro",
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
  ENTERPRISE: "Enterprise",
};

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// ─── Investor Detail Modal ───────────────────────────────────────────────────

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
        {/* Header */}
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
                Matched Investor Details
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
          {/* Match Score Banner */}
          {matchScore !== undefined && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  Match Score: {matchScore.toFixed(1)} / 100
                </p>
                {matchReason && (
                  <p className="text-xs text-emerald-600 mt-0.5">{matchReason}</p>
                )}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <Card className="border border-[var(--color-border)]">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-[var(--color-neutral-500)] uppercase tracking-wide">
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-[var(--color-neutral-400)]" />
                <div>
                  <p className="text-xs text-[var(--color-neutral-400)]">Full Name</p>
                  <p className="text-sm font-medium text-[var(--color-foreground)]">
                    {user?.fullName ?? "—"}
                  </p>
                </div>
              </div>

              {user?.phoneNumber && (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-[var(--color-neutral-400)]" />
                  <div>
                    <p className="text-xs text-[var(--color-neutral-400)]">Phone Number</p>
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
                    <p className="text-xs text-[var(--color-neutral-400)]">Location</p>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">
                      {[profile.city, profile.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Investor Profile */}
          {profile && (
            <Card className="border border-[var(--color-border)]">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-[var(--color-neutral-500)] uppercase tracking-wide">
                  Investor Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 grid grid-cols-2 gap-3">
                {profile.organizationName && (
                  <div className="col-span-2">
                    <p className="text-xs text-[var(--color-neutral-400)]">Organization</p>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">
                      {profile.organizationName}
                    </p>
                  </div>
                )}
                {profile.preferredIndustry && (
                  <div className="flex items-start gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-[var(--color-neutral-400)] mt-0.5" />
                    <div>
                      <p className="text-xs text-[var(--color-neutral-400)]">Preferred Industry</p>
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
                      <p className="text-xs text-[var(--color-neutral-400)]">Investment Budget</p>
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        ${Number(profile.investmentBudget).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Execution Details */}
          {execution && (
            <Card className="border border-[var(--color-border)]">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-[var(--color-neutral-500)] uppercase tracking-wide">
                  Investment Execution Details
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {execution.preferredIndustry && (
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-[var(--color-neutral-400)] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[var(--color-neutral-400)]">Industry Interest</p>
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
                      <p className="text-xs text-[var(--color-neutral-400)]">Reason for Investing</p>
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
                      <p className="text-xs text-[var(--color-neutral-400)]">Investment Budget</p>
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
                      <p className="text-xs text-[var(--color-neutral-400)]">Expected Return Timeline</p>
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
                      <p className="text-xs text-[var(--color-neutral-400)]">Success Criteria</p>
                      <p className="text-sm text-[var(--color-foreground)]">
                        {execution.successCriteria}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Matched On */}
          {matchedAt && (
            <p className="text-xs text-center text-[var(--color-neutral-400)]">
              Matched on{" "}
              {new Date(matchedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function StartupExecutionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);
  const [uploadingImageId, setUploadingImageId] = useState<number | null>(null);
  const [loadingMatchId, setLoadingMatchId] = useState<number | null>(null);
  const [modalData, setModalData] = useState<InvestorModalData | null>(null);

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
      toast.error("Please upload a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB.");
      return;
    }
    setUploadingImageId(id);
    try {
      const res = await startupService.uploadExecutionImage(String(id), file);
      const url = res.data?.data?.imageUrl ?? res.data?.imageUrl;
      queryClient.setQueryData<StartupExecution[]>(["startup-executions"], (prev) =>
        (prev ?? []).map((e) => (e.id === id ? { ...e, imageUrl: url } : e))
      );
      toast.success("Image uploaded successfully.");
    } catch {
      toast.error("Failed to upload image. Please try again.");
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
      toast.success("Execution withdrawn successfully.");
    } catch {
      toast.error("Failed to withdraw. Please try again.");
    } finally {
      setWithdrawingId(null);
    }
  };

  const handleViewMatchedInvestor = async (execId: number) => {
    if (!user?.id) return;
    setLoadingMatchId(execId);
    try {
      // 1. Get all matches for this startup user
      const matchRes = await matchingService.getMatchesForStartup(Number(user.id));
      const matches: any[] = matchRes.data?.data ?? matchRes.data ?? [];

      // Find the match tied to this specific startup execution
      const match = matches.find((m: any) => m.startupExecutionId === execId);
      if (!match) {
        toast.error("No match details found yet.");
        return;
      }

      // 2. Fetch investor user info (full name, phone)
      const investorUser = await userService.getById(match.investorUserId);

      // 3. Fetch investor identity profile (org name, preferred industry, budget, location)
      let investorProfile = null;
      try {
        investorProfile = await userService.getInvestorProfile(match.investorUserId);
      } catch {
        // Profile may not exist yet — non-critical
      }

      // 4. Fetch investor execution details (reason, budget, timeline, success criteria)
      let investorExecution = null;
      try {
        const execRes = await investorService.getExecutionByIdInternal(
          match.investorExecutionId
        );
        investorExecution = execRes?.data?.data ?? execRes?.data ?? null;
      } catch {
        // Non-critical
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
      toast.error("Failed to load investor details.");
    } finally {
      setLoadingMatchId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Investor Detail Modal */}
      {modalData && (
        <InvestorDetailModal data={modalData} onClose={() => setModalData(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
            My Executions
          </h2>
          <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
            Track your startup investment readiness submissions
          </p>
        </div>
        <Link href="/startup/execute">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Execution
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Submitted",
            value: executions.length,
            icon: Briefcase,
            bg: "bg-[var(--color-primary-50)]",
            color: "text-[var(--color-primary)]",
          },
          {
            label: "Matched",
            value: executions.filter((e) => e.status === "MATCHED").length,
            icon: CheckCircle2,
            bg: "bg-green-50",
            color: "text-green-600",
          },
          {
            label: "Pending Review",
            value: executions.filter((e) => e.status === "PENDING").length,
            icon: Clock,
            bg: "bg-blue-50",
            color: "text-blue-600",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border border-[var(--color-border)]">
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.bg}`}
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

      {/* List */}
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
                No executions yet
              </p>
              <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                Start by clicking &quot;New Execution&quot; to submit your startup for
                assessment.
              </p>
            </div>
            <Link href="/startup/execute">
              <Button className="gap-2 mt-2">
                <PlusCircle className="h-4 w-4" />
                New Execution
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
                {/* Execution image */}
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
                  {/* Status badge + ID */}
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

                  {/* Problem statement */}
                  <p className="text-sm text-[var(--color-neutral-600)] line-clamp-2 leading-relaxed">
                    {exec.problemStatement}
                  </p>

                  {/* Funding / Revenue pills */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 rounded-xl bg-[var(--color-primary-50)] px-3 py-2">
                      <DollarSign className="h-3.5 w-3.5 text-[var(--color-primary-600)] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wide text-[var(--color-neutral-400)]">
                          Funding needed
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
                          Revenue / yr
                        </p>
                        <p className="text-xs font-bold text-slate-700 truncate">
                          {exec.annualRevenue !== undefined
                            ? formatCurrency(exec.annualRevenue)
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Match notice */}
                  {exec.status === "MATCHED" && (
                    <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                      {matchCounts[exec.id]
                        ? `${matchCounts[exec.id]} investor${
                            matchCounts[exec.id] > 1 ? "s have" : " has"
                          } been matched to your startup!`
                        : "A potential investor has been found for your startup!"}
                    </p>
                  )}

                  {exec.status === "PENDING" && (
                    <p className="text-xs text-blue-600 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Under review — you will be notified when there is an update
                    </p>
                  )}

                  {exec.status === "REJECTED" && exec.statusReason && (
                    <div className="flex items-start gap-1.5 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span>{exec.statusReason}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
                    <Link href={`/startup/executions/${exec.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </Link>

                    {/* ── Matched Investor button — only when MATCHED ── */}
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
                        Matched Investor
                      </Button>
                    )}

                    {/* Upload image */}
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
                        asChild
                      >
                        <span>
                          {uploadingImageId === exec.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                          {exec.imageUrl ? "Replace" : "Image"}
                        </span>
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
                      Withdraw
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