"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { evaluatorService } from "@/services/evaluatorService";
import { EvaluatorReview, ReviewDecision } from "@/types/review";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const REASONING_SECTIONS = [
  { key: "MARKET & COMPETITIVE LANDSCAPE", color: "text-blue-700" },
  { key: "FINANCIAL REALISM", color: "text-purple-700" },
  { key: "GROWTH TRAJECTORY", color: "text-emerald-700" },
  { key: "KEY STRENGTHS", color: "text-green-700" },
  { key: "CONCERNS & RED FLAGS", color: "text-red-700" },
  { key: "OVERALL VERDICT", color: "text-[var(--color-primary-700)]" },
];

function StructuredReasoning({ text }: { text: string }) {
  const parsed: { label: string; color: string; content: string }[] = [];

  for (let i = 0; i < REASONING_SECTIONS.length; i++) {
    const { key, color } = REASONING_SECTIONS[i];
    const nextKey = REASONING_SECTIONS[i + 1]?.key;
    const pattern = nextKey
      ? new RegExp(`${key}:\\s*([\\s\\S]*?)(?=${nextKey}:)`, "i")
      : new RegExp(`${key}:\\s*([\\s\\S]*)$`, "i");
    const match = text.match(pattern);
    if (match) parsed.push({ label: key, color, content: match[1].trim() });
  }

  if (parsed.length === 0) {
    return (
      <p className="text-sm text-[var(--color-primary-800)] leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {parsed.map(({ label, color, content }) => (
        <div key={label}>
          <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${color}`}>{label}</p>
          <p className="text-sm text-[var(--color-primary-800)] leading-relaxed">{content}</p>
        </div>
      ))}
    </div>
  );
}

export default function ReviewDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: review = null, isLoading } = useQuery<EvaluatorReview | null>({
    queryKey: ["evaluator-review", id],
    queryFn: async () => {
      const res = await evaluatorService.getReviewById(id as string);
      return res.data.data ?? null;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!review) return;
    if (review.decision) setDecision(review.decision);
    if (review.reason) setReason(review.reason);
  }, [review]);

  const handleSubmit = async () => {
    if (!decision) {
      toast.error("Please select a decision.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason for your decision.");
      return;
    }
    setIsSubmitting(true);
    try {
      await evaluatorService.submitDecision(id as string, { decision, reason });
      toast.success("Decision submitted successfully.");
      router.push("/evaluator/reviews");
    } catch {
      toast.error("Failed to submit decision. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-[var(--color-neutral-400)]" />
        <p className="text-[var(--color-neutral-500)]">Review not found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const alreadyDecided = !!review.decision;

  const classificationColors: Record<string, string> = {
    HIGHLY_READY: "text-green-600 bg-green-50 border-green-200",
    MODERATELY_READY: "text-yellow-600 bg-yellow-50 border-yellow-200",
    NOT_READY: "text-red-500 bg-red-50 border-red-200",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[var(--color-neutral-500)] hover:text-[var(--color-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to reviews
      </button>

      {/* Already decided banner */}
      {alreadyDecided && (
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-[var(--color-neutral-50)] border-[var(--color-border)]">
          <CheckCircle2 className="h-5 w-5 text-[var(--color-secondary)] flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-[var(--color-foreground)]">
              Decision already submitted
            </p>
            <p className="text-xs text-[var(--color-neutral-500)]">
              This review has been decided. You can view the details below.
            </p>
          </div>
        </div>
      )}

      {/* AI Score Card */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--color-secondary)]" />
                AI Assessment Score
              </CardTitle>
              <CardDescription>
                Generated by Aria — AI Investment Analyst
              </CardDescription>
            </div>
            <div
              className={`px-3 py-1.5 rounded-lg border text-sm font-semibold ${
                classificationColors[review.classification] ??
                "text-[var(--color-neutral-600)] bg-[var(--color-neutral-50)] border-[var(--color-border)]"
              }`}
            >
              {review.classification.replace(/_/g, " ")}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Overall */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-neutral-50)] border border-[var(--color-border)]">
            <span className="text-sm font-medium text-[var(--color-foreground)]">
              Overall Score
            </span>
            <span
              className={`text-3xl font-bold ${
                review.overallScore >= 70
                  ? "text-green-600"
                  : review.overallScore >= 50
                  ? "text-yellow-600"
                  : "text-red-500"
              }`}
            >
              {review.overallScore}
              <span className="text-base font-normal text-[var(--color-neutral-400)]">
                /100
              </span>
            </span>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Financial Health",
                value: review.financialHealth,
              },
              { label: "Team Strength", value: review.teamStrength },
              {
                label: "Market Potential",
                value: review.marketPotential,
              },
              {
                label: "Business Viability",
                value: review.businessViability,
              },
            ].map((dim) => (
              <div
                key={dim.label}
                className="p-3 rounded-xl border border-[var(--color-border)] bg-white"
              >
                <p className="text-xs text-[var(--color-neutral-400)] mb-2">
                  {dim.label}
                </p>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-lg font-bold ${
                      dim.value >= 70
                        ? "text-green-600"
                        : dim.value >= 50
                        ? "text-yellow-600"
                        : "text-red-500"
                    }`}
                  >
                    {dim.value}
                  </span>
                  <span className="text-xs text-[var(--color-neutral-400)]">
                    /100
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full bg-[var(--color-neutral-100)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      dim.value >= 70
                        ? "bg-green-500"
                        : dim.value >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${dim.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* AI Reasoning */}
          <div className="p-4 rounded-xl bg-[var(--color-primary-50)] border border-[var(--color-primary-100)]">
            <p className="text-xs font-medium text-[var(--color-primary-700)] uppercase tracking-wide mb-3">
              AI Reasoning
            </p>
            <StructuredReasoning text={review.aiReasoning} />
          </div>
        </CardContent>
      </Card>

      {/* Startup Info */}
      <Card className="border border-[var(--color-border)]">
          <CardHeader>
            <CardTitle>Startup Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Company Stage", value: review.companySize },
              {
                label: "Problem Statement",
                value: review.problemStatement,
              },
              {
                label: "Business Model",
                value: review.businessModel,
              },
              {
                label: "Target Market",
                value: review.targetMarket,
              },
              {
                label: "Funding Needed",
                value: `$${review.fundingNeeded?.toLocaleString()}`,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0"
              >
                <p className="text-xs font-medium text-[var(--color-neutral-400)] uppercase tracking-wide mb-1">
                  {item.label}
                </p>
                <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
                  {item.value}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

      {/* Decision Form */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle>
            {alreadyDecided ? "Decision Made" : "Make Your Decision"}
          </CardTitle>
          <CardDescription>
            {alreadyDecided
              ? "This review has already been decided."
              : "Select a decision and provide a written reason. All decisions are permanently recorded."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Decision buttons */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                value: "APPROVED" as ReviewDecision,
                label: "Approve",
                icon: CheckCircle2,
                active:
                  "bg-green-600 text-white border-green-600",
                inactive:
                  "bg-white text-[var(--color-neutral-600)] border-[var(--color-border)] hover:border-green-400",
              },
              {
                value: "REJECTED" as ReviewDecision,
                label: "Reject",
                icon: XCircle,
                active: "bg-red-500 text-white border-red-500",
                inactive:
                  "bg-white text-[var(--color-neutral-600)] border-[var(--color-border)] hover:border-red-400",
              },
              {
                value: "ESCALATED" as ReviewDecision,
                label: "Escalate",
                icon: AlertTriangle,
                active:
                  "bg-yellow-500 text-white border-yellow-500",
                inactive:
                  "bg-white text-[var(--color-neutral-600)] border-[var(--color-border)] hover:border-yellow-400",
              },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => !alreadyDecided && setDecision(opt.value)}
                disabled={alreadyDecided}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all disabled:cursor-default ${
                  decision === opt.value ? opt.active : opt.inactive
                }`}
              >
                <opt.icon className="h-5 w-5" />
                {opt.label}
              </button>
            ))}
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="reason">
              Reason{" "}
              {!alreadyDecided && (
                <span className="text-red-500">*</span>
              )}
            </Label>
            <Textarea
              id="reason"
              placeholder="Provide a detailed reason for your decision…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              disabled={alreadyDecided}
              className={alreadyDecided ? "opacity-70" : ""}
            />
          </div>

          {!alreadyDecided && (
            <Button
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting || !decision || !reason.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting Decision…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Decision
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}