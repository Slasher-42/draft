"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { followupService } from "@/services/followupService";
import { Meetup } from "@/types/followup";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Video,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Loader2,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  SCHEDULED: { label: "Scheduled", color: "text-blue-600 bg-blue-50", icon: Calendar },
  IN_PROGRESS: { label: "In Progress", color: "text-amber-600 bg-amber-50", icon: Play },
  COMPLETED: { label: "Completed", color: "text-green-600 bg-green-50", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "text-red-600 bg-red-50", icon: XCircle },
};

export default function StartupMeetupsPage() {
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    followupService.getMyMeetups()
      .then((res) => setMeetups(res.data?.data ?? []))
      .catch(() => toast.error("Failed to load meetups"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">My Meetups</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          Video meetings with matched investors, scheduled by the admin
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: meetups.length, color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary-50)]", icon: Video },
          { label: "Upcoming", value: meetups.filter((m) => m.status === "SCHEDULED").length, color: "text-blue-600", bg: "bg-blue-50", icon: Calendar },
          { label: "Completed", value: meetups.filter((m) => m.status === "COMPLETED").length, color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
        ].map((s) => (
          <Card key={s.label} className="border border-[var(--color-border)]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-[var(--color-neutral-500)]">{s.label}</p>
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
            <p className="font-semibold text-[var(--color-primary-800)]">No meetups yet</p>
            <p className="text-sm text-[var(--color-neutral-500)] text-center max-w-xs">
              The admin will schedule meetups with matched investors
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {meetups.map((m) => {
            const cfg = statusConfig[m.status] ?? statusConfig.SCHEDULED;
            const StatusIcon = cfg.icon;
            const canJoin = m.status === "SCHEDULED" || m.status === "IN_PROGRESS";
            return (
              <Card key={m.id} className="border border-[var(--color-border)] hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full ${cfg.color}`}>
                          <StatusIcon className="h-3 w-3" />{cfg.label}
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
                    {canJoin && (
                      <Link href={`/meetup/${m.roomId}`}>
                        <Button size="sm" className="gap-2 flex-shrink-0">
                          <Video className="h-4 w-4" />
                          Join Call
                        </Button>
                      </Link>
                    )}
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
