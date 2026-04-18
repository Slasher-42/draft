"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { followupService } from "@/services/followupService";
import { matchingService } from "@/services/matchingService";
import { startupService } from "@/services/startupService";
import { userService } from "@/services/userService";
import { Contract } from "@/types/followup";
import { StartupExecution } from "@/types/execution";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  PenLine,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
  Printer,
  X,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING_SIGNATURES: { label: "Pending Signatures", color: "text-amber-600 bg-amber-50" },
  INVESTOR_SIGNED: { label: "You Signed", color: "text-blue-600 bg-blue-50" },
  STARTUP_SIGNED: { label: "Startup Signed", color: "text-indigo-600 bg-indigo-50" },
  BOTH_SIGNED: { label: "Both Signed", color: "text-purple-600 bg-purple-50" },
  VALIDATED: { label: "Validated", color: "text-green-600 bg-green-50" },
  REJECTED: { label: "Rejected", color: "text-red-600 bg-red-50" },
};

interface PrintData {
  investorName: string;
  startupName: string;
  startupExecution: StartupExecution | null;
}

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function fmtUSD(val?: number) {
  if (val == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
}

function openPrintWindow(contract: Contract, data: PrintData) {
  const exec = data.startupExecution;
  const statusLabel = statusConfig[contract.status]?.label ?? contract.status;

  const execRows = exec ? [
    ["Industry", exec.industry ?? "—"],
    ["Company Size", exec.targetCompanySize ?? "—"],
    ["Funding Needed", fmtUSD(exec.fundingNeeded)],
    ["Suggested Funding Range", exec.suggestedFundingRange ?? "—"],
    ["Annual Revenue", fmtUSD(exec.annualRevenue)],
    ["Monthly Burn Rate", fmtUSD(exec.monthlyBurnRate)],
    ["Target Market", exec.targetMarket ?? "—"],
    ["Problem Statement", exec.problemStatement ?? "—"],
    ["Business Model", exec.businessModel ?? "—"],
    ["Team Details", exec.teamDetails ?? "—"],
    ...(exec.additionalConsiderations ? [["Additional Notes", exec.additionalConsiderations]] : []),
  ].map(([k, v], i) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#f9fafb"}">
      <td style="padding:9px 14px;font-weight:600;color:#555;width:200px;border-bottom:1px solid #e5e7eb;vertical-align:top">${k}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #e5e7eb;vertical-align:top;white-space:pre-wrap">${v}</td>
    </tr>`).join("") : "";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Contract #${contract.id} — Investment Agreement</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12pt;color:#111;padding:18mm 22mm;line-height:1.6}
    h1{font-size:22pt;font-weight:900;letter-spacing:-0.5px}
    .section{margin-bottom:22px}
    .section-title{font-size:8pt;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#6b7280;margin-bottom:10px;padding-bottom:4px;border-bottom:1px solid #e5e7eb}
    table{width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden}
    @media print{body{padding:12mm 15mm}}
  </style>
</head>
<body>
  <!-- HEADER -->
  <div style="text-align:center;border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:24px">
    <p style="font-size:8pt;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#9ca3af;margin-bottom:6px">Investment Readiness Assessment Platform</p>
    <h1>INVESTMENT AGREEMENT CONTRACT</h1>
    <p style="font-size:9pt;color:#6b7280;margin-top:8px">
      Contract #${contract.id} &nbsp;•&nbsp; Issued: ${fmt(contract.createdAt)} &nbsp;•&nbsp; <strong>${statusLabel}</strong>
    </p>
  </div>

  <!-- PARTIES -->
  <div class="section">
    <div class="section-title">Parties Involved</div>
    <div style="display:flex;gap:16px">
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:14px;background:#eff6ff">
        <p style="font-size:8pt;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#2563eb;margin-bottom:4px">Investor</p>
        <p style="font-size:14pt;font-weight:700">${data.investorName}</p>
        <p style="font-size:8pt;color:#9ca3af;margin-top:2px">User ID: ${contract.investorUserId}</p>
      </div>
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:14px;background:#eef2ff">
        <p style="font-size:8pt;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#4f46e5;margin-bottom:4px">Startup</p>
        <p style="font-size:14pt;font-weight:700">${data.startupName}</p>
        <p style="font-size:8pt;color:#9ca3af;margin-top:2px">User ID: ${contract.startupUserId}</p>
      </div>
    </div>
  </div>

  <!-- CONTRACT TERMS -->
  <div class="section">
    <div class="section-title">Contract Terms</div>
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:14px;background:#f9fafb;white-space:pre-wrap;line-height:1.7">
      ${contract.contractDetails ?? "No contract details provided."}
    </div>
  </div>

  <!-- STARTUP EXECUTION PROFILE -->
  ${exec ? `
  <div class="section">
    <div class="section-title">Startup Execution Profile</div>
    <table><tbody>${execRows}</tbody></table>
  </div>` : ""}

  <!-- SIGNATURES -->
  <div class="section">
    <div class="section-title">Signatures</div>
    <div style="display:flex;gap:16px">
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:14px">
        <p style="font-size:8pt;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin-bottom:8px">Investor Signature</p>
        <p style="font-size:13pt;font-weight:700;border-bottom:1px solid #d1d5db;padding-bottom:6px;margin-bottom:6px">${contract.investorSignature ?? "Not yet signed"}</p>
        <p style="font-size:8pt;color:#9ca3af">Date: ${fmt(contract.investorSignedAt)}</p>
      </div>
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:14px">
        <p style="font-size:8pt;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin-bottom:8px">Startup Signature</p>
        <p style="font-size:13pt;font-weight:700;border-bottom:1px solid #d1d5db;padding-bottom:6px;margin-bottom:6px">${contract.startupSignature ?? "Not yet signed"}</p>
        <p style="font-size:8pt;color:#9ca3af">Date: ${fmt(contract.startupSignedAt)}</p>
      </div>
    </div>
  </div>

  <!-- ADMIN VALIDATION -->
  ${contract.adminValidationSignature ? `
  <div class="section">
    <div class="section-title">Admin Validation</div>
    <div style="border:1px solid #86efac;border-radius:8px;padding:14px;background:#f0fdf4">
      <p style="font-size:8pt;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#16a34a;margin-bottom:4px">Validated By</p>
      <p style="font-size:13pt;font-weight:700">${contract.adminValidationSignature}</p>
      <p style="font-size:8pt;color:#9ca3af;margin-top:4px">Date: ${fmt(contract.validatedAt)}</p>
    </div>
  </div>` : ""}

  <!-- FOOTER -->
  <div style="border-top:1px solid #e5e7eb;padding-top:12px;text-align:center;font-size:8pt;color:#d1d5db;margin-top:8px">
    <p>Investment Readiness Assessment Platform — Contract #${contract.id} — Match #${contract.matchId}</p>
    <p style="margin-top:2px">Printed on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
  </div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) { toast.error("Popup blocked — allow popups for this site"); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

function PrintModal({ contract, data, onClose }: { contract: Contract; data: PrintData; onClose: () => void }) {
  const exec = data.startupExecution;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto py-8">
      <div className="relative w-full max-w-3xl mx-4">
        <div className="flex justify-between items-center mb-3">
          <Button size="sm" onClick={() => openPrintWindow(contract, data)} className="gap-2 bg-[var(--color-primary)] text-white hover:opacity-90">
            <Printer className="h-4 w-4" /> Print Contract
          </Button>
          <Button size="sm" variant="outline" onClick={onClose} className="gap-1.5">
            <X className="h-4 w-4" /> Close
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-10 space-y-6 text-sm text-gray-800">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-800 pb-5">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Investment Readiness Assessment Platform</p>
            <h1 className="text-2xl font-black text-gray-900">INVESTMENT AGREEMENT CONTRACT</h1>
            <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
              <span>Contract #{contract.id}</span><span>•</span>
              <span>Issued: {fmt(contract.createdAt)}</span><span>•</span>
              <span className="font-semibold">{statusConfig[contract.status]?.label ?? contract.status}</span>
            </div>
          </div>

          {/* Parties */}
          <section>
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Parties Involved</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                <p className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-1">Investor</p>
                <p className="font-bold text-gray-900 text-base">{data.investorName}</p>
                <p className="text-xs text-gray-400 mt-0.5">User ID: {contract.investorUserId}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-indigo-50">
                <p className="text-xs font-bold tracking-widest text-indigo-600 uppercase mb-1">Startup</p>
                <p className="font-bold text-gray-900 text-base">{data.startupName}</p>
                <p className="text-xs text-gray-400 mt-0.5">User ID: {contract.startupUserId}</p>
              </div>
            </div>
          </section>

          {/* Contract Terms */}
          <section>
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Contract Terms</h2>
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 leading-relaxed whitespace-pre-wrap">
              {contract.contractDetails ?? "No contract details provided."}
            </div>
          </section>

          {/* Startup Execution Profile */}
          {exec && (
            <section>
              <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Startup Execution Profile</h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ["Industry", exec.industry],
                      ["Company Size", exec.targetCompanySize],
                      ["Funding Needed", fmtUSD(exec.fundingNeeded)],
                      ["Suggested Funding Range", exec.suggestedFundingRange],
                      ["Annual Revenue", fmtUSD(exec.annualRevenue)],
                      ["Monthly Burn Rate", fmtUSD(exec.monthlyBurnRate)],
                      ["Target Market", exec.targetMarket],
                      ["Problem Statement", exec.problemStatement],
                      ["Business Model", exec.businessModel],
                      ["Team Details", exec.teamDetails],
                      ...(exec.additionalConsiderations ? [["Additional Notes", exec.additionalConsiderations]] : []),
                    ].map(([label, value], i) => (
                      <tr key={label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-2.5 font-semibold text-gray-500 w-48 border-b border-gray-100 align-top">{label}</td>
                        <td className="px-4 py-2.5 text-gray-800 border-b border-gray-100 whitespace-pre-wrap align-top">{value ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Signatures */}
          <section>
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Signatures</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Investor Signature</p>
                <p className="font-bold text-gray-900 border-b border-gray-300 pb-2 mb-2">{contract.investorSignature ?? "Not yet signed"}</p>
                <p className="text-xs text-gray-400">Date: {fmt(contract.investorSignedAt)}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Startup Signature</p>
                <p className="font-bold text-gray-900 border-b border-gray-300 pb-2 mb-2">{contract.startupSignature ?? "Not yet signed"}</p>
                <p className="text-xs text-gray-400">Date: {fmt(contract.startupSignedAt)}</p>
              </div>
            </div>
          </section>

          {/* Admin Validation */}
          {contract.adminValidationSignature && (
            <section>
              <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Admin Validation</h2>
              <div className="border border-green-200 rounded-lg p-4 bg-green-50 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold tracking-widest text-green-700 uppercase mb-0.5">Validated by</p>
                  <p className="font-bold text-gray-900">{contract.adminValidationSignature}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Date: {fmt(contract.validatedAt)}</p>
                </div>
              </div>
            </section>
          )}

          <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-300">
            Contract #{contract.id} — Match #{contract.matchId} — {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvestorContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [signingId, setSigningId] = useState<number | null>(null);
  const [sigValue, setSigValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [printContract, setPrintContract] = useState<Contract | null>(null);
  const [printLoading, setPrintLoading] = useState(false);
  const [printData, setPrintData] = useState<PrintData | null>(null);

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

  const handleOpenPrint = async (contract: Contract) => {
    setPrintContract(contract);
    setPrintLoading(true);
    setPrintData(null);
    try {
      const [investorRes, startupRes, matchesRes] = await Promise.all([
        userService.getById(contract.investorUserId),
        userService.getById(contract.startupUserId),
        matchingService.getMatchesForInvestor(contract.investorUserId),
      ]);

      const investorName = investorRes?.fullName ?? contract.investorSignature ?? `Investor #${contract.investorUserId}`;
      const startupName = startupRes?.fullName ?? contract.startupSignature ?? `Startup #${contract.startupUserId}`;

      const matches: any[] = matchesRes.data?.data ?? matchesRes.data ?? [];
      const match = matches.find((m: any) => m.id === contract.matchId);

      let startupExecution: StartupExecution | null = null;
      if (match?.startupExecutionId) {
        try {
          const execRes = await startupService.getExecutionByIdInternal(match.startupExecutionId);
          startupExecution = execRes.data?.data ?? execRes.data ?? null;
        } catch { /* best-effort */ }
      }

      setPrintData({ investorName, startupName, startupExecution });
    } catch {
      toast.error("Failed to load contract details for print");
      setPrintContract(null);
    } finally {
      setPrintLoading(false);
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
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => handleOpenPrint(c)}
                        disabled={printLoading && printContract?.id === c.id}
                      >
                        {printLoading && printContract?.id === c.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Printer className="h-3.5 w-3.5" />}
                        Print
                      </Button>
                      {canSign && (
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setSigningId(c.id)}>
                          <PenLine className="h-3.5 w-3.5" />Sign
                        </Button>
                      )}
                      {c.status === "VALIDATED" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </div>
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

      {printContract && !printLoading && printData && (
        <PrintModal
          contract={printContract}
          data={printData}
          onClose={() => { setPrintContract(null); setPrintData(null); }}
        />
      )}
    </div>
  );
}
