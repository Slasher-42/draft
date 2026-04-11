"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { followupService } from "@/services/followupService";
import { matchingService } from "@/services/matchingService";
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

const meetupStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  SCHEDULED: { label: "Scheduled", color: "text-blue-600 bg-blue-50", icon: Calendar },
  IN_PROGRESS: { label: "In Progress", color: "text-amber-600 bg-amber-50", icon: Play },
  COMPLETED: { label: "Completed", color: "text-green-600 bg-green-50", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "text-red-600 bg-red-50", icon: XCircle },
};

const contractStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING_SIGNATURES: { label: "Pending Signatures", color: "text-amber-600 bg-amber-50" },
  INVESTOR_SIGNED: { label: "Investor Signed", color: "text-blue-600 bg-blue-50" },
  STARTUP_SIGNED: { label: "Startup Signed", color: "text-indigo-600 bg-indigo-50" },
  BOTH_SIGNED: { label: "Both Signed", color: "text-purple-600 bg-purple-50" },
  VALIDATED: { label: "Validated", color: "text-green-600 bg-green-50" },
  REJECTED: { label: "Rejected", color: "text-red-600 bg-red-50" },
};

export default function AdminFollowUpPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Matches");
  const [matches, setMatches] = useState<any[]>([]);
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [schedulingMatchId, setSchedulingMatchId] = useState<number | null>(null);
  const [scheduleForm, setScheduleForm] = useState<{ investorUserId: number; startupUserId: number; scheduledAt: string; adminNotes: string } | null>(null);

  const [creatingForMeetupId, setCreatingForMeetupId] = useState<number | null>(null);
  const [contractDetails, setContractDetails] = useState("");

  const [validatingId, setValidatingId] = useState<number | null>(null);
  const [adminSig, setAdminSig] = useState("");

  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [matchRes, meetupRes, contractRes] = await Promise.all([
          matchingService.getAllMatches ? matchingService.getAllMatches() : Promise.resolve({ data: { data: [] } }),
          followupService.getAllMeetups(),
          followupService.getAllContracts(),
        ]);
        setMatches(matchRes.data?.data ?? []);
        setMeetups(meetupRes.data?.data ?? []);
        setContracts(contractRes.data?.data ?? []);
      } catch {
        toast.error("Failed to load follow-up data");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSchedule = async () => {
    if (!scheduleForm || !schedulingMatchId) return;
    try {
      const res = await followupService.scheduleMeetup({
        matchId: schedulingMatchId,
        ...scheduleForm,
      });
      setMeetups((prev) => [...prev, res.data.data]);
      toast.success("Meetup scheduled successfully");
      setSchedulingMatchId(null);
      setScheduleForm(null);
    } catch {
      toast.error("Failed to schedule meetup");
    }
  };

  const handleUpdateStatus = async (meetupId: number, status: string) => {
    setUpdatingStatusId(meetupId);
    try {
      const res = await followupService.updateMeetupStatus(meetupId, { status });
      setMeetups((prev) => prev.map((m) => (m.id === meetupId ? res.data.data : m)));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleCreateContract = async (meetupId: number) => {
    if (!contractDetails.trim()) { toast.error("Contract details are required"); return; }
    try {
      const res = await followupService.createContract({ meetupId, contractDetails });
      setContracts((prev) => [...prev, res.data.data]);
      toast.success("Contract created");
      setCreatingForMeetupId(null);
      setContractDetails("");
    } catch {
      toast.error("Failed to create contract");
    }
  };

  const handleValidate = async (contractId: number) => {
    if (!adminSig.trim()) { toast.error("Your signature is required"); return; }
    try {
      const res = await followupService.validateContract(contractId, adminSig);
      setContracts((prev) => prev.map((c) => (c.id === contractId ? res.data.data : c)));
      toast.success("Contract validated");
      setValidatingId(null);
      setAdminSig("");
    } catch {
      toast.error("Failed to validate contract");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">Follow Up</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          Manage meetups, contracts, and investment outcomes
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Matches", value: matches.length, icon: Users, bg: "bg-[var(--color-primary-50)]", color: "text-[var(--color-primary)]" },
          { label: "Meetups", value: meetups.length, icon: Video, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Contracts", value: contracts.length, icon: FileText, bg: "bg-purple-50", color: "text-purple-600" },
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
            {tab}
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
                <EmptyState icon={Handshake} title="No matches yet" desc="Matches will appear here once the algorithm runs" />
              ) : (
                matches.map((m) => (
                  <Card key={m.id} className="border border-[var(--color-border)]">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[var(--color-primary-800)]">Match #{m.id}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                              {Math.round((m.matchScore ?? 0) * 100)}% match
                            </span>
                          </div>
                          <p className="text-sm text-[var(--color-neutral-600)]">
                            Investor <span className="font-medium text-[var(--color-primary-700)]">#{m.investorUserId}</span>
                            {" "}→ Startup <span className="font-medium text-[var(--color-primary-700)]">#{m.startupUserId}</span>
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
                          Schedule Meetup
                        </Button>
                      </div>

                      {schedulingMatchId === m.id && scheduleForm && (
                        <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-3">
                          <p className="text-sm font-medium text-[var(--color-primary-800)]">Schedule Meetup</p>
                          <input
                            type="datetime-local"
                            value={scheduleForm.scheduledAt}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                            className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          />
                          <textarea
                            placeholder="Admin notes (optional)"
                            rows={2}
                            value={scheduleForm.adminNotes}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, adminNotes: e.target.value })}
                            className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSchedule} disabled={!scheduleForm.scheduledAt}>Confirm</Button>
                            <Button size="sm" variant="outline" onClick={() => { setSchedulingMatchId(null); setScheduleForm(null); }}>Cancel</Button>
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
                <EmptyState icon={Video} title="No meetups scheduled" desc="Schedule meetups from the Matches tab" />
              ) : (
                meetups.map((m) => {
                  const cfg = meetupStatusConfig[m.status] ?? meetupStatusConfig.SCHEDULED;
                  const StatusIcon = cfg.icon;
                  return (
                    <Card key={m.id} className="border border-[var(--color-border)]">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full ${cfg.color}`}>
                                <StatusIcon className="h-3 w-3" />{cfg.label}
                              </span>
                              <span className="text-xs text-[var(--color-neutral-400)]">Room: {m.roomId.slice(0, 8)}…</span>
                            </div>
                            <p className="text-sm text-[var(--color-neutral-600)]">
                              Investor <span className="font-medium">#{m.investorUserId}</span>
                              {" "}↔ Startup <span className="font-medium">#{m.startupUserId}</span>
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
                                Start
                              </Button>
                            )}
                            {m.status === "IN_PROGRESS" && (
                              <Button size="sm" variant="outline" className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleUpdateStatus(m.id, "COMPLETED")}
                                disabled={updatingStatusId === m.id}>
                                {updatingStatusId === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                Complete
                              </Button>
                            )}
                            {(m.status === "SCHEDULED" || m.status === "IN_PROGRESS") && (
                              <Button size="sm" variant="outline" className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50"
                                onClick={() => handleUpdateStatus(m.id, "CANCELLED")}
                                disabled={updatingStatusId === m.id}>
                                <XCircle className="h-3.5 w-3.5" />Cancel
                              </Button>
                            )}
                            {m.status === "COMPLETED" && (
                              <Button size="sm" className="gap-1.5"
                                onClick={() => setCreatingForMeetupId(m.id)}>
                                <FileText className="h-3.5 w-3.5" />Contract Follow-up
                              </Button>
                            )}
                          </div>
                        </div>

                        {creatingForMeetupId === m.id && (
                          <div className="pt-3 border-t border-[var(--color-border)] space-y-3">
                            <p className="text-sm font-medium text-[var(--color-primary-800)]">Create Contract</p>
                            <textarea
                              placeholder="Contract details and terms..."
                              rows={4}
                              value={contractDetails}
                              onChange={(e) => setContractDetails(e.target.value)}
                              className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleCreateContract(m.id)}>Create</Button>
                              <Button size="sm" variant="outline" onClick={() => { setCreatingForMeetupId(null); setContractDetails(""); }}>Cancel</Button>
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
                <EmptyState icon={FileText} title="No contracts yet" desc="Create contracts from the Meetups tab after a meetup completes" />
              ) : (
                contracts.map((c) => {
                  const cfg = contractStatusConfig[c.status] ?? contractStatusConfig.PENDING_SIGNATURES;
                  return (
                    <Card key={c.id} className="border border-[var(--color-border)]">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                              <span className="text-xs text-[var(--color-neutral-400)]">Contract #{c.id}</span>
                            </div>
                            <p className="text-sm text-[var(--color-neutral-600)]">
                              Investor <span className="font-medium">#{c.investorUserId}</span>
                              {" "}↔ Startup <span className="font-medium">#{c.startupUserId}</span>
                            </p>
                            <div className="flex gap-4 text-xs text-[var(--color-neutral-400)]">
                              <span>Investor sig: {c.investorSignature ?? "—"}</span>
                              <span>Startup sig: {c.startupSignature ?? "—"}</span>
                            </div>
                          </div>
                          {c.status === "BOTH_SIGNED" && (
                            <Button size="sm" className="gap-1.5 flex-shrink-0"
                              onClick={() => setValidatingId(c.id)}>
                              <ShieldCheck className="h-3.5 w-3.5" />Validate
                            </Button>
                          )}
                          {c.status === "VALIDATED" && (
                            <span className="text-xs text-green-600 flex items-center gap-1 font-medium flex-shrink-0">
                              <CheckCircle2 className="h-4 w-4" />Validated
                            </span>
                          )}
                        </div>

                        {validatingId === c.id && (
                          <div className="pt-3 border-t border-[var(--color-border)] space-y-3">
                            <p className="text-sm font-medium text-[var(--color-primary-800)]">Your Validation Signature</p>
                            <input
                              type="text"
                              placeholder="Enter your full name as signature"
                              value={adminSig}
                              onChange={(e) => setAdminSig(e.target.value)}
                              className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleValidate(c.id)}>Validate Contract</Button>
                              <Button size="sm" variant="outline" onClick={() => { setValidatingId(null); setAdminSig(""); }}>Cancel</Button>
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
