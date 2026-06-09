"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { followupService } from "@/services/followupService";
import { matchingService } from "@/services/matchingService";
import { api } from "@/lib/api";
import { Meetup, Contract } from "@/types/followup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Handshake,
  Video,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
  PenLine,
  ShieldCheck,
  AlertCircle,
  Users,
} from "lucide-react";

const TABS = ["Matches", "Meetups", "Contracts"] as const;
type Tab = (typeof TABS)[number];

const meetupStatusColors: Record<string, { color: string; icon: React.ElementType }> = {
  SCHEDULED:   { color: "text-blue-600 bg-blue-50", icon: Calendar },
  IN_PROGRESS: { color: "text-amber-600 bg-amber-50", icon: Play },
  COMPLETED:   { color: "text-green-600 bg-green-50", icon: CheckCircle2 },
  CANCELLED:   { color: "text-red-600 bg-red-50", icon: XCircle },
};

const contractStatusColors: Record<string, string> = {
  PENDING_SIGNATURES: "text-amber-600 bg-amber-50",
  INVESTOR_SIGNED:    "text-blue-600 bg-blue-50",
  STARTUP_SIGNED:     "text-indigo-600 bg-indigo-50",
  BOTH_SIGNED:        "text-purple-600 bg-purple-50",
  VALIDATED:          "text-green-600 bg-green-50",
  REJECTED:           "text-red-600 bg-red-50",
};

export default function AdminFollowUpPage() {
  const t = useTranslations("admin.followup");
  const [activeTab, setActiveTab] = useState<Tab>("Matches");
  const [matches, setMatches] = useState<any[]>([]);
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [userNames, setUserNames] = useState<Record<number, string>>({});

  const [schedulingMatchId, setSchedulingMatchId] = useState<number | null>(null);
  const [scheduleForm, setScheduleForm] = useState<{ investorUserId: number; startupUserId: number; scheduledAt: string; adminNotes: string } | null>(null);

  const [creatingForMeetupId, setCreatingForMeetupId] = useState<number | null>(null);
  const [contractDetails, setContractDetails] = useState("");

  const [validatingId, setValidatingId] = useState<number | null>(null);
  const [adminSig, setAdminSig] = useState("");

  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  const { isLoading } = useQuery({
    queryKey: ["admin-followup"],
    queryFn: async () => {
      try {
        const [matchRes, meetupRes, contractRes] = await Promise.all([
          matchingService.getAllMatches ? matchingService.getAllMatches() : Promise.resolve({ data: { data: [] } }),
          followupService.getAllMeetups(),
          followupService.getAllContracts(),
        ]);
        const matchData = matchRes.data?.data ?? [];
        const meetupData = meetupRes.data?.data ?? [];
        const contractData = contractRes.data?.data ?? [];

        const ids = new Set<number>();
        matchData.forEach((m: any) => { if (m.investorUserId) ids.add(m.investorUserId); if (m.startupUserId) ids.add(m.startupUserId); });
        meetupData.forEach((m: any) => { if (m.investorUserId) ids.add(m.investorUserId); if (m.startupUserId) ids.add(m.startupUserId); });
        contractData.forEach((c: any) => { if (c.investorUserId) ids.add(c.investorUserId); if (c.startupUserId) ids.add(c.startupUserId); });

        const names: Record<number, string> = {};
        await Promise.all([...ids].map(async (id) => {
          try {
            const res = await api.get(`/api/users/${id}`);
            names[id] = res.data?.data?.fullName || `#${id}`;
          } catch {
            names[id] = `#${id}`;
          }
        }));

        setMatches(matchData);
        setMeetups(meetupData);
        setContracts(contractData);
        setUserNames(names);
        return { matchData, meetupData, contractData, names };
      } catch {
        toast.error(t("toastLoadFailed"));
        throw new Error("Failed to load follow-up data");
      }
    },
    retry: false,
  });

  const handleSchedule = async () => {
    if (!scheduleForm || !schedulingMatchId) return;
    try {
      const res = await followupService.scheduleMeetup({
        matchId: schedulingMatchId,
        ...scheduleForm,
      });
      setMeetups((prev) => [...prev, res.data.data]);
      toast.success(t("toastMeetupScheduled"));
      setSchedulingMatchId(null);
      setScheduleForm(null);
    } catch {
      toast.error(t("toastMeetupScheduleFailed"));
    }
  };

  const handleUpdateStatus = async (meetupId: number, status: string) => {
    setUpdatingStatusId(meetupId);
    try {
      const res = await followupService.updateMeetupStatus(meetupId, { status });
      setMeetups((prev) => prev.map((m) => (m.id === meetupId ? res.data.data : m)));
      toast.success(t("toastStatusUpdated"));
    } catch {
      toast.error(t("toastStatusUpdateFailed"));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleCreateContract = async (meetupId: number) => {
    if (!contractDetails.trim()) { toast.error(t("toastContractDetailsRequired")); return; }
    try {
      const res = await followupService.createContract({ meetupId, contractDetails });
      setContracts((prev) => [...prev, res.data.data]);
      toast.success(t("toastContractCreated"));
      setCreatingForMeetupId(null);
      setContractDetails("");
    } catch {
      toast.error(t("toastContractCreateFailed"));
    }
  };

  const handleValidate = async (contractId: number) => {
    if (!adminSig.trim()) { toast.error(t("toastSignatureRequired")); return; }
    try {
      const res = await followupService.validateContract(contractId, adminSig);
      setContracts((prev) => prev.map((c) => (c.id === contractId ? res.data.data : c)));
      toast.success(t("toastContractValidated"));
      setValidatingId(null);
      setAdminSig("");
    } catch {
      toast.error(t("toastContractValidateFailed"));
    }
  };

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
          { label: t("statTotalMatches"), value: matches.length, icon: Users, bg: "bg-[var(--color-primary-50)]", color: "text-[var(--color-primary)]" },
          { label: t("statMeetups"), value: meetups.length, icon: Video, bg: "bg-blue-50", color: "text-blue-600" },
          { label: t("statContracts"), value: contracts.length, icon: FileText, bg: "bg-purple-50", color: "text-purple-600" },
        ].map((s) => (
          <Card key={s.label} className="border border-[var(--color-border)]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-primary-800)]">{s.value}</p>
                <p className="text-xs text-[var(--color-neutral-500)]">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-neutral-500)] hover:text-[var(--color-primary-800)]"
            }`}
          >
            {tab === "Matches" ? t("tabMatches") : tab === "Meetups" ? t("tabMeetups") : t("tabContracts")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : (
        <>
          {activeTab === "Matches" && (
            <div className="space-y-3">
              {matches.length === 0 ? (
                <EmptyState icon={Handshake} title={t("noMatches")} desc={t("noMatchesDesc")} />
              ) : (
                matches.map((m) => (
                  <Card key={m.id} className="border border-[var(--color-border)]">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[var(--color-primary-800)]">{t("matchId", { id: m.id })}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                              {t("matchScore", { score: Math.round((m.matchScore ?? 0) * 100) })}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--color-neutral-600)]">
                            <span className="font-medium text-[var(--color-primary-700)]">{userNames[m.investorUserId] ?? `#${m.investorUserId}`}</span>
                            <span className="text-[var(--color-neutral-400)] mx-1.5">→</span>
                            <span className="font-medium text-[var(--color-primary-700)]">{userNames[m.startupUserId] ?? `#${m.startupUserId}`}</span>
                          </p>
                          {m.matchReason && (
                            <p className="text-xs text-[var(--color-neutral-400)] line-clamp-2">{m.matchReason}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="gap-2 flex-shrink-0"
                          onClick={() => {
                            setSchedulingMatchId(m.id);
                            setScheduleForm({ investorUserId: m.investorUserId, startupUserId: m.startupUserId, scheduledAt: "", adminNotes: "" });
                          }}
                        >
                          <Video className="h-4 w-4" />
                          {t("scheduleMeetupBtn")}
                        </Button>
                      </div>

                      {schedulingMatchId === m.id && scheduleForm && (
                        <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-3">
                          <p className="text-sm font-medium text-[var(--color-primary-800)]">
                            {t("scheduleMeetupTitle")} — {userNames[m.investorUserId] ?? `Investor #${m.investorUserId}`} &amp; {userNames[m.startupUserId] ?? `Startup #${m.startupUserId}`}
                          </p>
                          <input
                            type="datetime-local"
                            value={scheduleForm.scheduledAt}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                            className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          />
                          <textarea
                            placeholder={t("adminNotesPlaceholder")}
                            rows={2}
                            value={scheduleForm.adminNotes}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, adminNotes: e.target.value })}
                            className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSchedule} disabled={!scheduleForm.scheduledAt}>{t("confirm")}</Button>
                            <Button size="sm" variant="outline" onClick={() => { setSchedulingMatchId(null); setScheduleForm(null); }}>{t("cancel")}</Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "Meetups" && (
            <div className="space-y-3">
              {meetups.length === 0 ? (
                <EmptyState icon={Video} title={t("noMeetups")} desc={t("noMeetupsDesc")} />
              ) : (
                meetups.map((m) => {
                  const cfg = meetupStatusColors[m.status] ?? meetupStatusColors.SCHEDULED;
                  const StatusIcon = cfg.icon;
                  const meetupStatusLabels: Record<string, string> = {
                    SCHEDULED: t("meetupStatus.scheduled"),
                    IN_PROGRESS: t("meetupStatus.inProgress"),
                    COMPLETED: t("meetupStatus.completed"),
                    CANCELLED: t("meetupStatus.cancelled"),
                  };
                  const cfgLabel = meetupStatusLabels[m.status] ?? m.status;
                  return (
                    <Card key={m.id} className="border border-[var(--color-border)]">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full ${cfg.color}`}>
                                <StatusIcon className="h-3 w-3" />{cfgLabel}
                              </span>
                              <span className="text-xs text-[var(--color-neutral-400)]">{t("roomLabel", { id: m.roomId.slice(0, 8) })}</span>
                            </div>
                            <p className="text-sm text-[var(--color-neutral-600)]">
                              <span className="font-medium">{userNames[m.investorUserId] ?? `#${m.investorUserId}`}</span>
                              <span className="text-[var(--color-neutral-400)] mx-1.5">↔</span>
                              <span className="font-medium">{userNames[m.startupUserId] ?? `#${m.startupUserId}`}</span>
                            </p>
                            <p className="text-xs text-[var(--color-neutral-400)]">
                              {new Date(m.scheduledAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            {m.status === "SCHEDULED" && (
                              <Button size="sm" variant="outline" className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
                                onClick={() => handleUpdateStatus(m.id, "IN_PROGRESS")}
                                disabled={updatingStatusId === m.id}>
                                {updatingStatusId === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                                {t("start")}
                              </Button>
                            )}
                            {m.status === "IN_PROGRESS" && (
                              <Button size="sm" variant="outline" className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleUpdateStatus(m.id, "COMPLETED")}
                                disabled={updatingStatusId === m.id}>
                                {updatingStatusId === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                {t("complete")}
                              </Button>
                            )}
                            {(m.status === "SCHEDULED" || m.status === "IN_PROGRESS") && (
                              <Button size="sm" variant="outline" className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50"
                                onClick={() => handleUpdateStatus(m.id, "CANCELLED")}
                                disabled={updatingStatusId === m.id}>
                                <XCircle className="h-3.5 w-3.5" />{t("cancel")}
                              </Button>
                            )}
                            {m.status === "COMPLETED" && (
                              <Button size="sm" className="gap-1.5"
                                onClick={() => setCreatingForMeetupId(m.id)}>
                                <FileText className="h-3.5 w-3.5" />{t("contractFollowup")}
                              </Button>
                            )}
                          </div>
                        </div>

                        {creatingForMeetupId === m.id && (
                          <div className="pt-3 border-t border-[var(--color-border)] space-y-3">
                            <p className="text-sm font-medium text-[var(--color-primary-800)]">{t("createContractTitle")}</p>
                            <textarea
                              placeholder={t("contractDetailsPlaceholder")}
                              rows={4}
                              value={contractDetails}
                              onChange={(e) => setContractDetails(e.target.value)}
                              className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleCreateContract(m.id)}>{t("create")}</Button>
                              <Button size="sm" variant="outline" onClick={() => { setCreatingForMeetupId(null); setContractDetails(""); }}>{t("cancel")}</Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "Contracts" && (
            <div className="space-y-3">
              {contracts.length === 0 ? (
                <EmptyState icon={FileText} title={t("noContracts")} desc={t("noContractsDesc")} />
              ) : (
                contracts.map((c) => {
                  const contractStatusLabels: Record<string, string> = {
                    PENDING_SIGNATURES: t("contractStatus.pendingSignatures"),
                    INVESTOR_SIGNED: t("contractStatus.investorSigned"),
                    STARTUP_SIGNED: t("contractStatus.startupSigned"),
                    BOTH_SIGNED: t("contractStatus.bothSigned"),
                    VALIDATED: t("contractStatus.validated"),
                    REJECTED: t("contractStatus.rejected"),
                  };
                  const cfgLabel = contractStatusLabels[c.status] ?? c.status;
                  const cfgColor = contractStatusColors[c.status] ?? contractStatusColors.PENDING_SIGNATURES;
                  return (
                    <Card key={c.id} className="border border-[var(--color-border)]">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfgColor}`}>{cfgLabel}</span>
                              <span className="text-xs text-[var(--color-neutral-400)]">{t("contractId", { id: c.id })}</span>
                            </div>
                            <p className="text-sm text-[var(--color-neutral-600)]">
                              <span className="font-medium">{userNames[c.investorUserId] ?? `#${c.investorUserId}`}</span>
                              <span className="text-[var(--color-neutral-400)] mx-1.5">↔</span>
                              <span className="font-medium">{userNames[c.startupUserId] ?? `#${c.startupUserId}`}</span>
                            </p>
                            <div className="flex gap-4 text-xs text-[var(--color-neutral-400)]">
                              <span>{t("investorSig", { val: c.investorSignature ?? "—" })}</span>
                              <span>{t("startupSig", { val: c.startupSignature ?? "—" })}</span>
                            </div>
                          </div>
                          {c.status === "BOTH_SIGNED" && (
                            <Button size="sm" className="gap-1.5 flex-shrink-0"
                              onClick={() => setValidatingId(c.id)}>
                              <ShieldCheck className="h-3.5 w-3.5" />{t("validateBtn")}
                            </Button>
                          )}
                          {c.status === "VALIDATED" && (
                            <span className="text-xs text-green-600 flex items-center gap-1 font-medium flex-shrink-0">
                              <CheckCircle2 className="h-4 w-4" />{t("validatedLabel")}
                            </span>
                          )}
                        </div>

                        {validatingId === c.id && (
                          <div className="pt-3 border-t border-[var(--color-border)] space-y-3">
                            <p className="text-sm font-medium text-[var(--color-primary-800)]">{t("validationSigTitle")}</p>
                            <input
                              type="text"
                              placeholder={t("sigPlaceholder")}
                              value={adminSig}
                              onChange={(e) => setAdminSig(e.target.value)}
                              className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleValidate(c.id)}>{t("validateContractBtn")}</Button>
                              <Button size="sm" variant="outline" onClick={() => { setValidatingId(null); setAdminSig(""); }}>{t("cancel")}</Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <Card className="border-dashed border-2 border-[var(--color-border)]">
      <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="h-14 w-14 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center">
          <Icon className="h-7 w-7 text-[var(--color-primary)]" />
        </div>
        <p className="font-semibold text-[var(--color-primary-800)]">{title}</p>
        <p className="text-sm text-[var(--color-neutral-500)] text-center max-w-xs">{desc}</p>
      </CardContent>
    </Card>
  );
}
