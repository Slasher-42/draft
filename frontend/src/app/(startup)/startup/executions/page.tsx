"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { startupService } from "@/services/startupService";
import { matchingService } from "@/services/matchingService";
import { useAuth } from "@/context/AuthContext";
import { StartupExecution } from "@/types/execution";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  Building2,
  DollarSign,
  Sparkles,
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

export default function StartupExecutionsPage() {
  const { user } = useAuth();
  const [executions, setExecutions] = useState<StartupExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);
  const [uploadingImageId, setUploadingImageId] = useState<number | null>(null);
  const [matchCounts, setMatchCounts] = useState<Record<number, number>>({});

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
      setExecutions((prev) =>
        prev.map((e) => (e.id === id ? { ...e, imageUrl: url } : e))
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
      setExecutions((prev) => prev.filter((e) => e.id !== id));
      toast.success("Execution withdrawn successfully.");
    } catch {
      toast.error("Failed to withdraw. Please try again.");
    } finally {
      setWithdrawingId(null);
    }
  };

  useEffect(() => {
    startupService
      .getExecutions()
      .then((res) => {
        const data = res.data;
        let list: StartupExecution[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data?.content)) {
          list = data.content;
        } else if (Array.isArray(data?.data)) {
          list = data.data;
        }
        setExecutions(list);
      })
      .catch(() => setExecutions([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    matchingService
      .getMatchesForStartup(Number(user.id))
      .then((res) => {
        const matches = res.data?.data ?? [];
        const counts: Record<number, number> = {};
        matches.forEach((m: any) => {
          counts[m.startupExecutionId] = (counts[m.startupExecutionId] ?? 0) + 1;
        });
        setMatchCounts(counts);
      })
      .catch(() => {});
  }, [user?.id]);

  return (
    <div className="space-y-6">
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
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : executions.length === 0 ? (
        <Card className="border-dashed border-2 border-[var(--color-border)]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-14 w-14 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-[var(--color-primary)]" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-[var(--color-primary-800)]">
                No executions yet
              </p>
              <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                Submit your first execution to get started
              </p>
            </div>
            <Link href="/startup/execute">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Start New Execution
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {executions.map((exec) => {
            const cfg = statusConfig[exec.status];
            const StatusIcon = cfg.icon;
            return (
              <Card
                key={exec.id}
                className="border border-[var(--color-border)] hover:shadow-md transition-shadow overflow-hidden rounded-2xl"
              >
                <div className={`h-[3px] w-full ${
                  exec.status === "MATCHED"
                    ? "bg-gradient-to-r from-emerald-400 to-green-500"
                    : exec.status === "REJECTED"
                    ? "bg-gradient-to-r from-red-400 to-rose-500"
                    : "bg-gradient-to-r from-blue-400 to-indigo-500"
                }`} />

                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">

                    <div className="relative sm:w-48 flex-shrink-0">
                      <div className="relative h-44 sm:h-full min-h-[11rem] bg-gradient-to-br from-slate-100 to-blue-50 overflow-hidden">
                        {exec.imageUrl ? (
                          <img
                            src={exec.imageUrl}
                            alt="Startup"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4">
                            <div className="h-12 w-12 rounded-2xl bg-white shadow-inner flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-xs text-slate-400 text-center leading-snug">
                              Add a startup image or logo
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          id={`img-upload-${exec.id}`}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleImageUpload(exec.id, f);
                            e.target.value = "";
                          }}
                        />
                        <button
                          onClick={() =>
                            document.getElementById(`img-upload-${exec.id}`)?.click()
                          }
                          disabled={uploadingImageId === exec.id}
                          title={exec.imageUrl ? "Change image" : "Add image"}
                          className="absolute bottom-2 right-2 h-8 w-8 flex items-center justify-center rounded-full bg-white/90 shadow-md border border-white/60 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-200 disabled:opacity-50"
                        >
                          {uploadingImageId === exec.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-neutral-400)]">
                            Execution #{exec.id}
                          </p>
                          <h3 className="mt-0.5 text-base font-bold text-[var(--color-primary-800)] truncate">
                            {companySizeLabels[exec.targetCompanySize] ?? exec.targetCompanySize} Stage
                          </h3>
                        </div>
                        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap flex-shrink-0 ${
                          exec.status === "MATCHED"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : exec.status === "REJECTED"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            exec.status === "MATCHED" ? "bg-emerald-500"
                            : exec.status === "REJECTED" ? "bg-red-500"
                            : "bg-blue-500 animate-pulse"
                          }`} />
                          <StatusIcon className="h-3.5 w-3.5" />
                          {cfg.label}
                        </span>
                      </div>

                      <p className="text-sm text-[var(--color-neutral-600)] line-clamp-2 leading-relaxed">
                        {exec.problemStatement}
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 rounded-xl bg-[var(--color-primary-50)] px-3 py-2">
                          <DollarSign className="h-3.5 w-3.5 text-[var(--color-primary-600)] flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wide text-[var(--color-neutral-400)]">Funding needed</p>
                            <p className="text-xs font-bold text-[var(--color-primary-800)] truncate">
                              {exec.fundingNeeded ? formatCurrency(exec.fundingNeeded) : "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                          <DollarSign className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wide text-[var(--color-neutral-400)]">Revenue / yr</p>
                            <p className="text-xs font-bold text-slate-700 truncate">
                              {exec.annualRevenue !== undefined ? formatCurrency(exec.annualRevenue) : "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {exec.status === "MATCHED" && (
                        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                          {matchCounts[exec.id]
                            ? `${matchCounts[exec.id]} investor${matchCounts[exec.id] > 1 ? "s have" : " has"} been matched to your startup!`
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

                      <div className="flex items-center gap-2 mt-auto pt-1">
                        <Link href={`/startup/executions/${exec.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                        </Link>
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