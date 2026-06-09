"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { User } from "@/types/user";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, Mail } from "lucide-react";

export default function AdminEvaluatorsPage() {
  const t = useTranslations("admin.evaluators");
  const tCommon = useTranslations("common");
  const { data: evaluators = [], isLoading } = useQuery<User[]>({
    queryKey: ["admin-evaluators"],
    queryFn: async () => {
      const data = await userService.getAllUsers({ role: "EVALUATOR" });
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
          {t("title")}
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          {t("subtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : evaluators.length === 0 ? (
        <Card className="border-dashed border-2 border-[var(--color-border)]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <ShieldCheck className="h-10 w-10 text-[var(--color-neutral-400)]" />
            <p className="text-[var(--color-neutral-500)]">
              {t("noEvaluators")}
            </p>
            <p className="text-xs text-[var(--color-neutral-400)]">
              {t("noEvaluatorsHint")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {evaluators.map((ev) => (
            <Card
              key={ev.id}
              className="border border-[var(--color-border)] hover:shadow-sm transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {ev.fullName?.charAt(0)?.toUpperCase() ?? "E"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        {ev.fullName}
                      </p>
                      <Badge
                        variant={(ev.enabled ?? ev.isActive) ? "success" : "destructive"}
                        className="text-xs"
                      >
                        {(ev.enabled ?? ev.isActive) ? tCommon("status.active") : tCommon("status.inactive")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Mail className="h-3.5 w-3.5 text-[var(--color-neutral-400)]" />
                      <p className="text-xs text-[var(--color-neutral-400)]">
                        {ev.email}
                      </p>
                    </div>
                    {ev.evaluatorProfile && (
                      <div className="flex gap-3 mt-1">
                        {ev.evaluatorProfile.department && (
                          <span className="text-xs text-[var(--color-neutral-500)]">
                            {t("dept")}: {ev.evaluatorProfile.department}
                          </span>
                        )}
                        {ev.evaluatorProfile.specialization && (
                          <span className="text-xs text-[var(--color-neutral-500)]">
                            {t("spec")}: {ev.evaluatorProfile.specialization}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}