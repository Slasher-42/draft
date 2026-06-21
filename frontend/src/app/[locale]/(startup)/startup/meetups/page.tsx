"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { followupService } from "@/services/followupService";
import { Meetup } from "@/types/followup";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Video,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  FileCheck2,
  Loader2,
} from "lucide-react";

export default function StartupMeetupsPage() {
  const t = useTranslations("startup.meetups");
  const queryClient = useQueryClient();

  const [adjourningId, setAdjourningId] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
    SCHEDULED:   { color: "text-blue-600 bg-blue-50",   icon: Calendar },
    IN_PROGRESS: { color: "text-amber-600 bg-amber-50", icon: Play },
    COMPLETED:   { color: "text-green-600 bg-green-50", icon: CheckCircle2 },
    CANCELLED:   { color: "text-red-600 bg-red-50",     icon: XCircle },
  };

  const statusLabel: Record<string, string> = {
    SCHEDULED:   t("statusScheduled"),
    IN_PROGRESS: t("statusInProgress"),
    COMPLETED:   t("statusCompleted"),
    CANCELLED:   t("statusCancelled"),
  };

  const { data: meetups = [], isLoading } = useQuery<Meetup[]>({
    queryKey: ["startup-meetups"],
    queryFn: async () => {
      const res = await followupService.getMyMeetups();
      return res.data?.data ?? [];
    },
  });

  const adjournMutation = useMutation({
    mutationFn: (payload: { id: number; feedback: string }) =>
      followupService.adjournMeetup(payload.id, { feedback: payload.feedback }),
    onSuccess: () => {
      toast.success(t("adjournSuccess"));
      queryClient.invalidateQueries({ queryKey: ["startup-meetups"] });
      setAdjourningId(null);
      setFeedbackText("");
    },
    onError: () => {
      toast.error(t("adjournFailed"));
    },
  });

  if (isLoading) return <PageSkeleton stats={3} rows={3} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">{t("title")}</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { labelKey: "statTotal",     value: meetups.length,                                             color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary-50)]", icon: Video },
          { labelKey: "statUpcoming",  value: meetups.filter((m) => m.status === "SCHEDULED").length,    color: "text-blue-600",               bg: "bg-blue-50",                   icon: Calendar },
          { labelKey: "statCompleted", value: meetups.filter((m) => m.status === "COMPLETED").length,    color: "text-green-600",              bg: "bg-green-50",                  icon: CheckCircle2 },
        ].map((s) => (
          <Card key={s.labelKey} className="border border-[var(--color-border)]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-[var(--color-neutral-500)]">{t(s.labelKey as any)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {meetups.length === 0 ? (
        <Card className="border-dashed border-2 border-[var(--color-border)]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-14 w-14 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center">
              <Video className="h-7 w-7 text-[var(--color-primary)]" />
            </div>
            <p className="font-semibold text-[var(--color-primary-800)]">{t("noMeetups")}</p>
            <p className="text-sm text-[var(--color-neutral-500)] text-center max-w-xs">
              {t("noMeetupsDesc")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {meetups.map((m) => {
            const cfg = statusConfig[m.status] ?? statusConfig.SCHEDULED;
            const StatusIcon = cfg.icon;
            const canJoin = m.status === "SCHEDULED" || m.status === "IN_PROGRESS";
            const canAdjourn = m.status === "SCHEDULED" || m.status === "IN_PROGRESS";
            return (
              <Card key={m.id} className="border border-[var(--color-border)] hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full ${cfg.color}`}>
                          <StatusIcon className="h-3 w-3" />{statusLabel[m.status] ?? m.status}
                        </span>
                        <span className="text-xs text-[var(--color-neutral-400)]">Meetup #{m.id}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-[var(--color-primary-800)]">
                        <Clock className="h-4 w-4 text-[var(--color-neutral-400)]" />
                        {new Date(m.scheduledAt).toLocaleString()}
                      </div>
                      {m.adminNotes && (
                        <p className="text-xs text-[var(--color-neutral-500)] italic">"{m.adminNotes}"</p>
                      )}
                    </div>
                    {(canJoin || canAdjourn) && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {canJoin && (
                          <Link href={`/meetup/${m.roomId}`}>
                            <Button size="sm" className="gap-2 w-full">
                              <Video className="h-4 w-4" />
                              {t("joinCall")}
                            </Button>
                          </Link>
                        )}
                        {canAdjourn && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => { setAdjourningId(m.id); setFeedbackText(""); }}
                          >
                            <FileCheck2 className="h-4 w-4" />
                            {t("adjourn")}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={adjourningId !== null} onOpenChange={(open) => { if (!open) setAdjourningId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adjournDialogTitle")}</DialogTitle>
          </DialogHeader>
          <textarea
            placeholder={t("feedbackPlaceholder")}
            rows={4}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setAdjourningId(null)}>
              {t("cancel")}
            </Button>
            <Button
              size="sm"
              disabled={!feedbackText.trim() || adjournMutation.isPending}
              onClick={() => adjourningId !== null && adjournMutation.mutate({ id: adjourningId, feedback: feedbackText })}
              className="gap-2"
            >
              {adjournMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileCheck2 className="h-3.5 w-3.5" />}
              {t("submitFeedback")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
