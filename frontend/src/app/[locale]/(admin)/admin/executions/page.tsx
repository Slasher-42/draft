"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2, ClipboardList, Clock, CheckCircle2, XCircle,
  TrendingUp, AlertCircle, Zap,
} from "lucide-react";

const execApi = axios.create({ baseURL: "https://startup-application-service.onrender.com", timeout: 30000 });
execApi.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const evalApi = axios.create({ baseURL: "https://evaluation-decision-service.onrender.com", timeout: 30000 });
evalApi.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const aiApi = axios.create({ baseURL: "https://ai-assessment-service.onrender.com", timeout: 120000 });
aiApi.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const STATUS_FILTERS = ["ALL", "PENDING", "MATCHED", "REJECTED", "APPROVED"] as const;

const statusConfig: Record<string, { label: string; icon: any; classes: string }> = {
  PENDING:  { label: "Pending",  icon: Clock,        classes: "bg-blue-50 text-blue-700 border-blue-200" },
  MATCHED:  { label: "Matched",  icon: TrendingUp,   classes: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { label: "Rejected", icon: XCircle,      classes: "bg-red-50 text-red-700 border-red-200" },
  APPROVED: { label: "Approved", icon: CheckCircle2, classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function AdminExecutionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [triggeringId, setTriggeringId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-executions"],
    queryFn: async () => {
      const [startupRes, investorRes, reviewsRes] = await Promise.allSettled([
        execApi.get("/api/executions/startup/all"),
        execApi.get("/api/executions/investor/all"),
        evalApi.get("/api/evaluator/reviews/all"),
      ]);

      const reviews: any[] = reviewsRes.status === "fulfilled"
        ? (reviewsRes.value.data?.data ?? []) : [];
      const reviewStatusMap: Record<number, string> = {};
      reviews.forEach((r: any) => { if (r.decision) reviewStatusMap[r.executionId] = r.decision; });

      const startups = startupRes.status === "fulfilled"
        ? (startupRes.value.data?.data ?? []).map((e: any) => ({
            ...e, type: "STARTUP",
            status: reviewStatusMap[e.id] ?? e.status,
          }))
        : [];
      const investors = investorRes.status === "fulfilled"
        ? (investorRes.value.data?.data ?? []).map((e: any) => ({ ...e, type: "INVESTOR" }))
        : [];

      const combined = [...startups, ...investors].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return {
        allExecutions: combined,
        fetchError: combined.length === 0 && startupRes.status === "rejected" && investorRes.status === "rejected"
          ? "Could not load executions. Check that the StartupApplicationService is running."
          : null,
      };
    },
  });

  // Force-trigger AI scoring for a stuck PENDING startup execution
  const handleTriggerScoring = async (executionId: number) => {
    setTriggeringId(executionId);
    try {
      await aiApi.post("/api/assessment/score", {
        execution_id: executionId,
        weight_financial_health: 0.25,
        weight_team_strength: 0.25,
        weight_market_potential: 0.25,
        weight_business_viability: 0.25,
        minimum_passing_score: 50,
      });
      toast.success(`Scoring triggered for execution #${executionId}. The evaluator review will appear shortly.`);
      // Invalidate so the list refreshes and shows updated status
      queryClient.invalidateQueries({ queryKey: ["admin-executions"] });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Scoring failed";
      toast.error(`Failed to trigger scoring: ${msg}`);
    } finally {
      setTriggeringId(null);
    }
  };

  const allExecutions = data?.allExecutions ?? [];
  const fetchError = data?.fetchError ?? null;

  const executions = statusFilter === "ALL"
    ? allExecutions
    : allExecutions.filter((e) => e.status === statusFilter);

  const counts = STATUS_FILTERS.reduce((acc, s) => {
    acc[s] = s === "ALL" ? allExecutions.length : allExecutions.filter(e => e.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">All Executions</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          All startup and investor executions across the platform
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              statusFilter === s
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-200)]"
            }`}
          >
            {s}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              statusFilter === s
                ? "bg-white/20 text-white"
                : "bg-[var(--color-neutral-200)] text-[var(--color-neutral-500)]"
            }`}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : fetchError ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-5">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Failed to load executions</p>
              <p className="text-xs text-red-600 mt-1">{fetchError}</p>
            </div>
          </CardContent>
        </Card>
      ) : executions.length === 0 ? (
        <Card className="border-dashed border-2 border-[var(--color-border)]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <ClipboardList className="h-10 w-10 text-[var(--color-neutral-300)]" />
            <p className="text-[var(--color-neutral-500)] text-sm">
              {statusFilter === "ALL" ? "No executions found." : `No ${statusFilter.toLowerCase()} executions.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {executions.map((exec) => {
            const cfg = statusConfig[exec.status] ?? statusConfig.PENDING;
            const Icon = cfg.icon;
            const isStartup = exec.type === "STARTUP";
            const isPending = exec.status === "PENDING";

            return (
              <Card key={`${exec.type}-${exec.id}`} className="border border-[var(--color-border)] hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={`mt-0.5 px-2 py-0.5 rounded-md text-xs font-bold flex-shrink-0 ${
                        isStartup ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      }`}>
                        {isStartup ? "STARTUP" : "INVESTOR"}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--color-primary-800)] truncate">
                          {isStartup
                            ? (exec.problemStatement ?? `Startup Execution #${exec.id}`)
                            : (exec.industry ?? exec.preferredIndustry ?? `Investor Execution #${exec.id}`)}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          <span className="text-xs text-[var(--color-neutral-400)]">ID: {exec.id}</span>
                          {exec.createdAt && (
                            <span className="text-xs text-[var(--color-neutral-400)]">
                              {new Date(exec.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </span>
                          )}
                          {isStartup && exec.fundingNeeded && (
                            <span className="text-xs text-[var(--color-neutral-400)]">
                              Funding: ${Number(exec.fundingNeeded).toLocaleString()}
                            </span>
                          )}
                          {!isStartup && exec.investmentBudget && (
                            <span className="text-xs text-[var(--color-neutral-400)]">
                              Budget: ${Number(exec.investmentBudget).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {exec.statusReason && (
                          <p className="text-xs text-[var(--color-neutral-500)] mt-1 italic truncate">
                            Reason: {exec.statusReason}
                          </p>
                        )}

                        {/* Trigger scoring button — only for PENDING startup executions */}
                        {isStartup && isPending && (
                          <button
                            onClick={() => handleTriggerScoring(exec.id)}
                            disabled={triggeringId === exec.id}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-60"
                          >
                            {triggeringId === exec.id ? (
                              <><Loader2 className="h-3 w-3 animate-spin" />Triggering…</>
                            ) : (
                              <><Zap className="h-3 w-3" />Trigger AI Scoring</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <span className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.classes}`}>
                      <Icon className="h-3 w-3" />
                      {cfg.label}
                    </span>
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
