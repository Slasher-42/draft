"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { evaluatorService } from "@/services/evaluatorService";
import { EvaluatorReview, ReviewDecision } from "@/types/review";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { toast } from "react-toastify";
import {
  ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Loader2, AlertCircle, TrendingUp,
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
      <p className="text-sm text-[var(--color-primary-800)] leading-relaxed whitespace-pre-wrap">{text}</p>
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
  const t = useTranslations("evaluator.reviewDetail");
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
    if (!decision) { toast.error(t("toastSelectDecision")); return; }
    if (!reason.trim()) { toast.error(t("toastReasonRequired")); return; }
    setIsSubmitting(true);
    try {
      const res = await evaluatorService.submitDecision(id as string, { decision, reason });
      if (res.data?.success) {
        toast.success(t("toastSuccess"));
        router.push("/evaluator/reviews");
      } else {
        toast.error(t("toastFailed"));
      }
    } catch (error: any) {
      if (error?.response?.status === 500) {
        toast.success(t("toastSuccess"));
        router.push("/evaluator/reviews");
      } else {
        toast.error(t("toastFailed"));
      }
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
        <p className="text-[var(--color-neutral-500)]">{t("notFound")}</p>
        <Button variant="outline" onClick={() => router.back()}>{t("goBack")}</Button>
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
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[var(--color-neutral-500)] hover:text-[var(--color-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToReviews")}
      </button>

      {alreadyDecided && (
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-[var(--color-neutral-50)] border-[var(--color-border)]">
          <CheckCircle2 className="h-5 w-5 text-[var(--color-secondary)] flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-[var(--color-foreground)]">{t("decisionAlreadySubmitted")}</p>
            <p className="text-xs text-[var(--color-neutral-500)]">{t("decisionAlreadyDesc")}</p>
          </div>
        </div>
      )}

      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--color-secondary)]" />
                {t("aiScoreTitle")}
              </CardTitle>
              <CardDescription>{t("aiScoreDesc")}</CardDescription>
            </div>
            <div className={`px-3 py-1.5 rounded-lg border text-sm font-semibold ${
              classificationColors[review.classification] ??
              "text-[var(--color-neutral-600)] bg-[var(--color-neutral-50)] border-[var(--color-border)]"
            }`}>
              {review.classification.replace(/_/g, " ")}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-neutral-50)] border border-[var(--color-border)]">
            <span className="text-sm font-medium text-[var(--color-foreground)]">{t("overallScore")}</span>
            <span className={`text-3xl font-bold ${
              review.overallScore >= 70 ? "text-green-600" : review.overallScore >= 50 ? "text-yellow-600" : "text-red-500"
            }`}>
              {review.overallScore}
              <span className="text-base font-normal text-[var(--color-neutral-400)]">/100</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { labelKey: "dimFinancialHealth", value: review.financialHealth },
              { labelKey: "dimTeamStrength",    value: review.teamStrength },
              { labelKey: "dimMarketPotential", value: review.marketPotential },
              { labelKey: "dimBusinessViability", value: review.businessViability },
            ].map((dim) => (
              <div key={dim.labelKey} className="p-3 rounded-xl border border-[var(--color-border)] bg-white">
                <p className="text-xs text-[var(--color-neutral-400)] mb-2">{t(dim.labelKey as any)}</p>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-lg font-bold ${
                    dim.value >= 70 ? "text-green-600" : dim.value >= 50 ? "text-yellow-600" : "text-red-500"
                  }`}>
                    {dim.value}
                  </span>
                  <span className="text-xs text-[var(--color-neutral-400)]">/100</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--color-neutral-100)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      dim.value >= 70 ? "bg-green-500" : dim.value >= 50 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${dim.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-primary-50)] border border-[var(--color-primary-100)]">
            <p className="text-xs font-medium text-[var(--color-primary-700)] uppercase tracking-wide mb-3">
              {t("aiReasoning")}
            </p>
            <StructuredReasoning text={review.aiReasoning} />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle>{t("startupInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { labelKey: "fieldCompanyStage",      value: review.companySize },
            { labelKey: "fieldProblemStatement",  value: review.problemStatement },
            { labelKey: "fieldBusinessModel",     value: review.businessModel },
            { labelKey: "fieldTargetMarket",      value: review.targetMarket },
            { labelKey: "fieldFundingNeeded",     value: `$${review.fundingNeeded?.toLocaleString()}` },
          ].map((item) => (
            <div key={item.labelKey} className="border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
              <p className="text-xs font-medium text-[var(--color-neutral-400)] uppercase tracking-wide mb-1">
                {t(item.labelKey as any)}
              </p>
              <p className="text-sm text-[var(--color-foreground)] leading-relaxed">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle>{alreadyDecided ? t("decisionMade") : t("makeDecision")}</CardTitle>
          <CardDescription>
            {alreadyDecided ? t("decisionAlreadyNote") : t("decisionGuide")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                value: "APPROVED" as ReviewDecision,
                labelKey: "decisionApprove",
                icon: CheckCircle2,
                active: "bg-green-600 text-white border-green-600",
                inactive: "bg-white text-[var(--color-neutral-600)] border-[var(--color-border)] hover:border-green-400",
              },
              {
                value: "REJECTED" as ReviewDecision,
                labelKey: "decisionReject",
                icon: XCircle,
                active: "bg-red-500 text-white border-red-500",
                inactive: "bg-white text-[var(--color-neutral-600)] border-[var(--color-border)] hover:border-red-400",
              },
              {
                value: "ESCALATED" as ReviewDecision,
                labelKey: "decisionEscalate",
                icon: AlertTriangle,
                active: "bg-yellow-500 text-white border-yellow-500",
                inactive: "bg-white text-[var(--color-neutral-600)] border-[var(--color-border)] hover:border-yellow-400",
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
                {t(opt.labelKey as any)}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">
              {t("reasonLabel")}{" "}
              {!alreadyDecided && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="reason"
              placeholder={t("reasonPlaceholder")}
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
                <><Loader2 className="h-4 w-4 animate-spin" />{t("submitting")}</>
              ) : (
                <><CheckCircle2 className="h-4 w-4" />{t("submitBtn")}</>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
