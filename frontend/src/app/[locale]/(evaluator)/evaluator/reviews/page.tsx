"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { evaluatorService } from "@/services/evaluatorService";
import { EvaluatorReview } from "@/types/review";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Eye, Clock, CheckCircle2, XCircle, AlertTriangle, Loader2, ClipboardList,
} from "lucide-react";

export default function EvaluatorReviewsPage() {
  const t = useTranslations("evaluator.reviews");
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "DECIDED">("ALL");

  const decisionConfig = {
    APPROVED:  { label: t("decisionApproved"),  icon: CheckCircle2,  variant: "success"     as const },
    REJECTED:  { label: t("decisionRejected"),  icon: XCircle,       variant: "destructive" as const },
    ESCALATED: { label: t("decisionEscalated"), icon: AlertTriangle, variant: "warning"     as const },
  };

  const { data: reviews = [], isLoading } = useQuery<EvaluatorReview[]>({
    queryKey: ["evaluator-reviews"],
    queryFn: async () => {
      const res = await evaluatorService.getReviews();
      return res.data.data ?? [];
    },
  });

  const filtered = reviews.filter((r) => {
    if (filter === "PENDING") return !r.decision;
    if (filter === "DECIDED") return !!r.decision;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">{t("title")}</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">{t("subtitle")}</p>
      </div>

      <div className="flex gap-2">
        {(["ALL", "PENDING", "DECIDED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-200)]"
            }`}
          >
            {f === "ALL"
              ? t("filterAll", { count: reviews.length })
              : f === "PENDING"
              ? t("filterPending", { count: reviews.filter((r) => !r.decision).length })
              : t("filterDecided", { count: reviews.filter((r) => !!r.decision).length })}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-2 border-[var(--color-border)]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-14 w-14 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center">
              <ClipboardList className="h-7 w-7 text-[var(--color-primary)]" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-[var(--color-primary-800)]">{t("noReviews")}</p>
              <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                {filter === "PENDING" ? t("noPendingReviews") : t("noMatchingFilter")}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <Card key={review.id} className="border border-[var(--color-border)] hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {review.decision ? (
                        <Badge variant={decisionConfig[review.decision]?.variant ?? "default"} className="gap-1">
                          {(() => {
                            const Icon = decisionConfig[review.decision]?.icon;
                            return Icon ? <Icon className="h-3 w-3" /> : null;
                          })()}
                          {decisionConfig[review.decision]?.label}
                        </Badge>
                      ) : (
                        <Badge variant="pending" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {t("pendingDecision")}
                        </Badge>
                      )}
                      <span className="text-xs text-[var(--color-neutral-400)]">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[var(--color-neutral-500)]">{t("overallScore")}</span>
                        <span className={`text-sm font-bold ${
                          review.overallScore >= 70 ? "text-green-600" : review.overallScore >= 50 ? "text-yellow-600" : "text-red-500"
                        }`}>
                          {review.overallScore}/100
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[var(--color-neutral-500)]">{t("classification")}</span>
                        <span className="text-xs font-medium text-[var(--color-foreground)]">
                          {review.classification.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                      {[
                        { labelKey: "dimFinancial", value: review.financialHealth },
                        { labelKey: "dimTeam",      value: review.teamStrength },
                        { labelKey: "dimMarket",    value: review.marketPotential },
                        { labelKey: "dimViability", value: review.businessViability },
                      ].map((dim) => (
                        <div key={dim.labelKey} className="bg-[var(--color-neutral-50)] rounded-lg p-2 text-center">
                          <p className="text-xs text-[var(--color-neutral-400)]">{t(dim.labelKey as any)}</p>
                          <p className={`text-sm font-bold mt-0.5 ${
                            dim.value >= 70 ? "text-green-600" : dim.value >= 50 ? "text-yellow-600" : "text-red-500"
                          }`}>
                            {dim.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link href={`/evaluator/reviews/${review.id}`}>
                    <Button variant={review.decision ? "outline" : "default"} size="sm" className="gap-1.5 flex-shrink-0">
                      <Eye className="h-3.5 w-3.5" />
                      {review.decision ? t("viewBtn") : t("reviewBtn")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
