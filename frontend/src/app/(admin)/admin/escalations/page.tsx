"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { evaluatorService } from "@/services/evaluatorService";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface EscalatedReview {
  id: number;
  executionId: number;
  startupUserId: number;
  evaluatorId: number;
  financialHealth: number;
  teamStrength: number;
  marketPotential: number;
  businessViability: number;
  overallScore: number;
  classification: string;
  aiReasoning: string;
  companySize: string;
  problemStatement: string;
  businessModel: string;
  targetMarket: string;
  fundingNeeded: number;
  decision: string;
  reason: string;
  status: string;
  createdAt: string;
}

const classificationColors: Record<string, string> = {
  HIGHLY_READY: "text-green-600 bg-green-50 border-green-200",
  MODERATELY_READY: "text-yellow-600 bg-yellow-50 border-yellow-200",
  NOT_READY: "text-red-500 bg-red-50 border-red-200",
};

export default function AdminEscalationsPage() {
  const [reviews, setReviews] = useState<EscalatedReview[]>([]);
  const [decisions, setDecisions] = useState<Record<number, "APPROVED" | "REJECTED">>({});
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const { isLoading } = useQuery({
    queryKey: ["admin-escalations"],
    queryFn: async () => {
      const res = await evaluatorService.getEscalatedReviews();
      const data = res.data?.data ?? [];
      setReviews(data);
      return data;
    },
  });

  const handleDecision = async (review: EscalatedReview) => {
    const decision = decisions[review.id];
    const reason = reasons[review.id] ?? "";
    if (!decision) { toast.error("Select Approve or Reject."); return; }
    if (!reason.trim()) { toast.error("A reason is required."); return; }
    setSubmitting(review.id);
    try {
      await evaluatorService.submitAdminDecision(String(review.id), { decision, reason });
      toast.success(`Execution #${review.executionId} has been ${decision === "APPROVED" ? "approved" : "rejected"}.`);
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
    } catch {
      toast.error("Failed to submit decision. Please try again.");
    } finally {
      setSubmitting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">Escalated Reviews</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          Startups escalated by evaluators awaiting your final decision
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card className="border-dashed border-2 border-[var(--color-border)]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-14 w-14 rounded-full bg-yellow-50 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-yellow-500" />
            </div>
            <p className="font-semibold text-[var(--color-primary-800)]">No escalated reviews</p>
            <p className="text-sm text-[var(--color-neutral-500)] text-center max-w-xs">
              All escalated cases have been resolved.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isExpanded = expanded === review.id;
            const alreadyDecided = review.decision && review.decision !== "ESCALATED";
            return (
              <Card key={review.id} className="border border-[var(--color-border)]">
                {/* Summary header */}
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Escalated
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            classificationColors[review.classification] ??
                            "text-neutral-600 bg-neutral-50 border-neutral-200"
                          }`}
                        >
                          {review.classification?.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        Execution #{review.executionId} · Startup #{review.startupUserId}
                      </p>
                      <p className="text-xs text-[var(--color-neutral-500)]">
                        Stage: {review.companySize} · Funding: ${review.fundingNeeded?.toLocaleString()}
                      </p>
                      {review.reason && (
                        <p className="text-xs text-[var(--color-neutral-500)] italic">
                          Evaluator note: "{review.reason}"
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span
                        className={`text-2xl font-bold ${
                          review.overallScore >= 70
                            ? "text-green-600"
                            : review.overallScore >= 50
                            ? "text-yellow-600"
                            : "text-red-500"
                        }`}
                      >
                        {review.overallScore}
                        <span className="text-sm font-normal text-[var(--color-neutral-400)]">/100</span>
                      </span>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : review.id)}
                        className="text-xs text-[var(--color-primary)] hover:underline"
                      >
                        {isExpanded ? "Hide details" : "View full details"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded full review */}
                  {isExpanded && (
                    <div className="mt-5 space-y-4 border-t border-[var(--color-border)] pt-5">
                      {/* Score dimensions */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Financial Health", value: review.financialHealth },
                          { label: "Team Strength", value: review.teamStrength },
                          { label: "Market Potential", value: review.marketPotential },
                          { label: "Business Viability", value: review.businessViability },
                        ].map((dim) => (
                          <div key={dim.label} className="p-3 rounded-xl border border-[var(--color-border)] bg-white">
                            <p className="text-xs text-[var(--color-neutral-400)] mb-1">{dim.label}</p>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-lg font-bold ${dim.value >= 70 ? "text-green-600" : dim.value >= 50 ? "text-yellow-600" : "text-red-500"}`}>
                                {dim.value}
                              </span>
                              <span className="text-xs text-[var(--color-neutral-400)]">/100</span>
                            </div>
                            <div className="h-1.5 w-full bg-[var(--color-neutral-100)] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${dim.value >= 70 ? "bg-green-500" : dim.value >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                                style={{ width: `${dim.value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* AI Reasoning */}
                      <div className="p-4 rounded-xl bg-[var(--color-primary-50)] border border-[var(--color-primary-100)]">
                        <p className="text-xs font-medium text-[var(--color-primary-700)] uppercase tracking-wide mb-2">AI Reasoning</p>
                        <p className="text-sm text-[var(--color-primary-800)] leading-relaxed">{review.aiReasoning}</p>
                      </div>

                      {/* Startup info */}
                      <div className="space-y-3">
                        {[
                          { label: "Problem Statement", value: review.problemStatement },
                          { label: "Business Model", value: review.businessModel },
                          { label: "Target Market", value: review.targetMarket },
                        ].map((item) => (
                          <div key={item.label} className="border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
                            <p className="text-xs font-medium text-[var(--color-neutral-400)] uppercase tracking-wide mb-1">{item.label}</p>
                            <p className="text-sm text-[var(--color-foreground)] leading-relaxed">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin decision form */}
                  {!alreadyDecided && (
                    <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-3">
                      <p className="text-sm font-medium text-[var(--color-primary-800)]">Your Decision</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: "APPROVED" as const, label: "Approve", icon: CheckCircle2, active: "bg-green-600 text-white border-green-600", inactive: "bg-white text-[var(--color-neutral-600)] border-[var(--color-border)] hover:border-green-400" },
                          { value: "REJECTED" as const, label: "Reject", icon: XCircle, active: "bg-red-500 text-white border-red-500", inactive: "bg-white text-[var(--color-neutral-600)] border-[var(--color-border)] hover:border-red-400" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setDecisions((d) => ({ ...d, [review.id]: opt.value }))}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${decisions[review.id] === opt.value ? opt.active : opt.inactive}`}
                          >
                            <opt.icon className="h-4 w-4" />
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Reason <span className="text-red-500">*</span></Label>
                        <Textarea
                          placeholder="Provide your reason for this decision…"
                          rows={3}
                          value={reasons[review.id] ?? ""}
                          onChange={(e) => setReasons((r) => ({ ...r, [review.id]: e.target.value }))}
                        />
                      </div>
                      <Button
                        className="w-full gap-2"
                        onClick={() => handleDecision(review)}
                        disabled={submitting === review.id || !decisions[review.id] || !(reasons[review.id] ?? "").trim()}
                      >
                        {submitting === review.id ? (
                          <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</>
                        ) : (
                          <><AlertCircle className="h-4 w-4" />Submit Decision</>
                        )}
                      </Button>
                    </div>
                  )}

                  {alreadyDecided && (
                    <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center gap-2 text-sm text-[var(--color-neutral-500)]">
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-secondary)]" />
                      Admin decision already submitted: <strong>{review.decision}</strong>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
