"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { followupService } from "@/services/followupService";
import { Contract } from "@/types/followup";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  PenLine,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING_SIGNATURES: { label: "Pending Signatures", color: "text-amber-600 bg-amber-50" },
  INVESTOR_SIGNED: { label: "You Signed", color: "text-blue-600 bg-blue-50" },
  STARTUP_SIGNED: { label: "Startup Signed", color: "text-indigo-600 bg-indigo-50" },
  BOTH_SIGNED: { label: "Both Signed", color: "text-purple-600 bg-purple-50" },
  VALIDATED: { label: "Validated", color: "text-green-600 bg-green-50" },
  REJECTED: { label: "Rejected", color: "text-red-600 bg-red-50" },
};

export default function InvestorContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [signingId, setSigningId] = useState<number | null>(null);
  const [sigValue, setSigValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    followupService.getMyContracts()
      .then((res) => setContracts(res.data?.data ?? []))
      .catch(() => toast.error("Failed to load contracts"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSign = async (contractId: number) => {
    if (!sigValue.trim()) { toast.error("Enter your full name as signature"); return; }
    setSubmitting(true);
    try {
      const res = await followupService.signContract(contractId, sigValue);
      setContracts((prev) => prev.map((c) => (c.id === contractId ? res.data.data : c)));
      toast.success("Contract signed successfully");
      setSigningId(null);
      setSigValue("");
    } catch {
      toast.error("Failed to sign contract");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const validated = contracts.filter((c) => c.status === "VALIDATED").length;
  const pending = contracts.filter((c) => c.status !== "VALIDATED" && c.status !== "REJECTED").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">My Contracts</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          Investment agreements — sign and track validation status
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: contracts.length, color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary-50)]", icon: FileText },
          { label: "Pending", value: pending, color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
          { label: "Validated", value: validated, color: "text-green-600", bg: "bg-green-50", icon: ShieldCheck },
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

      {contracts.length === 0 ? (
        <Card className="border-dashed border-2 border-[var(--color-border)]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-14 w-14 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center">
              <FileText className="h-7 w-7 text-[var(--color-primary)]" />
            </div>
            <p className="font-semibold text-[var(--color-primary-800)]">No contracts yet</p>
            <p className="text-sm text-[var(--color-neutral-500)] text-center max-w-xs">
              Contracts are created by the admin after a completed meetup
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => {
            const cfg = statusConfig[c.status] ?? statusConfig.PENDING_SIGNATURES;
            const canSign = c.status === "PENDING_SIGNATURES" || c.status === "STARTUP_SIGNED";
            return (
              <Card key={c.id} className="border border-[var(--color-border)] hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs text-[var(--color-neutral-400)]">Contract #{c.id}</span>
                      </div>
                      <p className="text-sm text-[var(--color-neutral-600)] line-clamp-2">{c.contractDetails}</p>
                      <div className="flex gap-4 text-xs text-[var(--color-neutral-400)]">
                        <span>Your sig: <span className="font-medium text-[var(--color-neutral-600)]">{c.investorSignature ?? "Not signed"}</span></span>
                        <span>Startup sig: <span className="font-medium text-[var(--color-neutral-600)]">{c.startupSignature ?? "Not signed"}</span></span>
                      </div>
                      {c.status === "VALIDATED" && c.adminValidationSignature && (
                        <div className="flex items-center gap-1.5 text-xs text-green-600">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Admin validated by: {c.adminValidationSignature}
                        </div>
                      )}
                    </div>
                    {canSign && (
                      <Button size="sm" variant="outline" className="gap-1.5 flex-shrink-0"
                        onClick={() => setSigningId(c.id)}>
                        <PenLine className="h-3.5 w-3.5" />Sign
                      </Button>
                    )}
                    {c.status === "VALIDATED" && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>

                  {signingId === c.id && (
                    <div className="pt-3 border-t border-[var(--color-border)] space-y-3">
                      <p className="text-sm font-medium text-[var(--color-primary-800)]">Sign with your full name</p>
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={sigValue}
                        onChange={(e) => setSigValue(e.target.value)}
                        className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSign(c.id)} disabled={submitting}>
                          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PenLine className="h-3.5 w-3.5" />}
                          Confirm Signature
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setSigningId(null); setSigValue(""); }}>Cancel</Button>
                      </div>
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
