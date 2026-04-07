"use client";

import { useState, useEffect, useMemo } from "react";
import { adminService } from "@/services/adminService";
import { AuditLog, InvestorMatch } from "@/types/admin";
import { StartupExecution, InvestorExecution } from "@/types/execution";
import { User } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Search,
  BookOpen,
  Shield,
  TrendingUp,
  Building2,
  DollarSign,
  Calendar,
  Target,
  Briefcase,
  ChevronRight,
  BarChart3,
  FileSpreadsheet,
  FileText,
} from "lucide-react";



function fmt(n: number | undefined | null, prefix = "$") {
  if (n == null) return "—";
  return `${prefix}${n.toLocaleString()}`;
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-rose-500";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-emerald-50 border-emerald-200";
  if (score >= 60) return "bg-amber-50 border-amber-200";
  return "bg-rose-50 border-rose-200";
}

function nowLabel() {
  return new Date().toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");
}



function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const escape = (v: string) =>
    `"${v.replace(/"/g, '""').replace(/\n/g, " ")}"`;
  const lines = [
    headers.map(escape).join(","),
    ...rows.map((r) => r.map(escape).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportMatchesCSV(matches: EnrichedMatch[]) {
  const headers = [
    "Match ID",
    "Startup Name",
    "Startup Email",
    "Company Name",
    "Investor Name",
    "Investor Email",
    "Industry / Field",
    "Funding Needed",
    "Investor Budget",
    "Match Score",
    "Status",
    "Match Reason",
    "Matched On",
  ];
  const rows = matches.map((m) => [
    String(m.id),
    m.startupUser?.fullName ?? `User #${m.startupUserId}`,
    m.startupUser?.email ?? "—",
    m.startupUser?.startupProfile?.companyName ?? "—",
    m.investorUser?.fullName ?? `User #${m.investorUserId}`,
    m.investorUser?.email ?? "—",
    m.startup?.industry ?? m.investor?.preferredIndustry ?? "—",
    fmt(m.startup?.fundingNeeded),
    fmt(m.investor?.investmentBudget),
    `${m.matchScore.toFixed(1)}/100`,
    m.status,
    m.matchReason ?? "—",
    fmtDate(m.matchedAt),
  ]);
  downloadCSV(`investment-matches_${nowLabel()}.csv`, headers, rows);
}

function exportAuditCSV(logs: AuditLog[]) {
  const headers = [
    "Log ID",
    "Action Type",
    "Outcome",
    "User Email",
    "User Role",
    "Service",
    "Affected Resource",
    "Details",
    "Timestamp",
  ];
  const rows = logs.map((l) => [
    String(l.id),
    l.actionType,
    l.outcome,
    l.userEmail ?? "—",
    l.userRole ?? "—",
    l.serviceName,
    l.affectedResource,
    l.details ?? "—",
    new Date(l.createdAt).toLocaleString(),
  ]);
  downloadCSV(`audit-logs_${nowLabel()}.csv`, headers, rows);
}



async function exportMatchesPDF(matches: EnrichedMatch[]) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const generatedOn = new Date().toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

 
  doc.setFillColor(30, 58, 138); 
  doc.rect(0, 0, W, 22, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Investment Readiness Assessment", 14, 9);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Investment Matches Report", 14, 16);

  doc.setFontSize(8);
  doc.text(`Generated: ${generatedOn}`, W - 14, 16, { align: "right" });

  /* Summary row */
  const avgScore =
    matches.length
      ? matches.reduce((s, m) => s + m.matchScore, 0) / matches.length
      : 0;

  doc.setFillColor(240, 245, 255);
  doc.rect(0, 22, W, 14, "F");

  doc.setTextColor(30, 58, 138);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const stats = [
    `Total Matches: ${matches.length}`,
    `Average Score: ${avgScore.toFixed(1)}/100`,
    `High (≥80): ${matches.filter((m) => m.matchScore >= 80).length}`,
    `Medium (60–79): ${matches.filter((m) => m.matchScore >= 60 && m.matchScore < 80).length}`,
    `Low (<60): ${matches.filter((m) => m.matchScore < 60).length}`,
  ];
  const colW = W / stats.length;
  stats.forEach((s, i) => {
    doc.text(s, 14 + i * colW, 31);
  });

 
  autoTable(doc, {
    startY: 38,
    head: [[
      "#", "Startup", "Company", "Investor", "Industry / Field",
      "Funding Needed", "Investor Budget", "Score", "Status", "Matched On",
    ]],
    body: matches.map((m, i) => [
      i + 1,
      m.startupUser?.fullName ?? `User #${m.startupUserId}`,
      m.startupUser?.startupProfile?.companyName ?? "—",
      m.investorUser?.fullName ?? `User #${m.investorUserId}`,
      m.startup?.industry ?? m.investor?.preferredIndustry ?? "—",
      fmt(m.startup?.fundingNeeded),
      fmt(m.investor?.investmentBudget),
      `${m.matchScore.toFixed(1)}`,
      m.status,
      fmtDate(m.matchedAt),
    ]),
    styles: { fontSize: 8, cellPadding: 3, lineColor: [220, 228, 242], lineWidth: 0.2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 255] },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      7: { halign: "center" },
      8: { halign: "center" },
    },
    didDrawCell: (data: any) => {
  
      if (data.section === "body" && data.column.index === 7) {
        const score = parseFloat(data.cell.text[0]);
        if (score >= 80) doc.setTextColor(5, 150, 105);
        else if (score >= 60) doc.setTextColor(217, 119, 6);
        else doc.setTextColor(220, 38, 38);
      } else {
        doc.setTextColor(30, 30, 30);
      }
    },
    didDrawPage: (data: any) => {
     
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}  ·  Investment Readiness Assessment  ·  Confidential`,
        W / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: "center" }
      );
    },
  });

  doc.save(`investment-matches_${nowLabel()}.pdf`);
}

async function exportAuditPDF(logs: AuditLog[]) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const generatedOn = new Date().toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const success = logs.filter((l) => l.outcome === "SUCCESS").length;
  const failure = logs.filter((l) => l.outcome === "FAILURE").length;

  
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, W, 22, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Investment Readiness Assessment", 14, 9);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("System Audit Log Report", 14, 16);

  doc.setFontSize(8);
  doc.text(`Generated: ${generatedOn}`, W - 14, 16, { align: "right" });

 
  doc.setFillColor(240, 245, 255);
  doc.rect(0, 22, W, 14, "F");

  doc.setTextColor(30, 58, 138);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const stats = [
    `Total Entries: ${logs.length}`,
    `Successful: ${success}`,
    `Failed: ${failure}`,
    `Services: ${new Set(logs.map((l) => l.serviceName)).size}`,
    `Action Types: ${new Set(logs.map((l) => l.actionType)).size}`,
  ];
  const colW = W / stats.length;
  stats.forEach((s, i) => doc.text(s, 14 + i * colW, 31));

 
  autoTable(doc, {
    startY: 38,
    head: [["#", "Action Type", "Outcome", "User Email", "Role", "Service", "Affected Resource", "Details", "Timestamp"]],
    body: logs.map((l, i) => [
      i + 1,
      l.actionType,
      l.outcome,
      l.userEmail ?? "—",
      l.userRole ?? "—",
      l.serviceName,
      l.affectedResource,
      l.details ? l.details.slice(0, 60) + (l.details.length > 60 ? "…" : "") : "—",
      new Date(l.createdAt).toLocaleString(),
    ]),
    styles: { fontSize: 7.5, cellPadding: 3, lineColor: [220, 228, 242], lineWidth: 0.2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 255] },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      2: { halign: "center" },
    },
    didDrawCell: (data: any) => {
      if (data.section === "body" && data.column.index === 2) {
        const outcome = data.cell.text[0];
        if (outcome === "SUCCESS") doc.setTextColor(5, 150, 105);
        else if (outcome === "FAILURE") doc.setTextColor(220, 38, 38);
        else doc.setTextColor(30, 30, 30);
      } else {
        doc.setTextColor(30, 30, 30);
      }
    },
    didDrawPage: (data: any) => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}  ·  Investment Readiness Assessment  ·  Confidential`,
        W / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: "center" }
      );
    },
  });

  doc.save(`audit-logs_${nowLabel()}.pdf`);
}



function ExportMenu({
  onCSV,
  onPDF,
  disabled,
}: {
  onCSV: () => void;
  onPDF: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={onCSV}
        className="flex items-center gap-1.5"
      >
        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
        CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={onPDF}
        className="flex items-center gap-1.5"
      >
        <FileText className="h-3.5 w-3.5 text-blue-600" />
        PDF
      </Button>
    </div>
  );
}



interface EnrichedMatch extends InvestorMatch {
  startup?: StartupExecution;
  investor?: InvestorExecution;
  startupUser?: User;
  investorUser?: User;
}

function MatchDetailModal({
  match,
  onClose,
}: {
  match: EnrichedMatch | null;
  onClose: () => void;
}) {
  if (!match) return null;

  const s = match.startup;
  const inv = match.investor;
  const su = match.startupUser;
  const iu = match.investorUser;

  return (
    <Dialog open={!!match} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[var(--color-primary-800)]">
            <TrendingUp className="h-5 w-5" />
            Match Details — #{match.id}
          </DialogTitle>
        </DialogHeader>

        {/* Score banner */}
        <div className={`rounded-xl border-2 p-4 flex items-center justify-between ${scoreBg(match.matchScore)}`}>
          <div>
            <p className="text-xs font-medium text-[var(--color-neutral-500)] uppercase tracking-wide">
              Match Score
            </p>
            <p className={`text-3xl font-bold ${scoreColor(match.matchScore)}`}>
              {match.matchScore.toFixed(1)}
              <span className="text-base font-normal text-[var(--color-neutral-400)]">/100</span>
            </p>
          </div>
          <div className="text-right">
            <Badge variant={match.status === "MATCHED" ? "success" : "secondary"} className="mb-1">
              {match.status}
            </Badge>
            <p className="text-xs text-[var(--color-neutral-400)]">{fmtDate(match.matchedAt)}</p>
          </div>
        </div>

        {/* Match reason */}
        {match.matchReason && (
          <div className="bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] rounded-lg p-3">
            <p className="text-xs font-semibold text-[var(--color-primary-700)] mb-1 uppercase tracking-wide">
              Why they matched
            </p>
            <p className="text-sm text-[var(--color-foreground)]">{match.matchReason}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Startup side */}
          <div className="border border-[var(--color-border)] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-sm text-[var(--color-foreground)]">Startup</h3>
            </div>
            {su && (
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-[var(--color-foreground)]">{su.fullName}</p>
                <p className="text-xs text-[var(--color-neutral-400)]">{su.email}</p>
                {su.startupProfile?.companyName && (
                  <p className="text-xs text-[var(--color-neutral-500)]">{su.startupProfile.companyName}</p>
                )}
              </div>
            )}
            {s ? (
              <div className="space-y-2 pt-1 border-t border-[var(--color-border)]">
                <Row icon={<Target className="h-3.5 w-3.5 text-blue-500" />} label="Industry" value={s.industry ?? "—"} />
                <Row icon={<Briefcase className="h-3.5 w-3.5 text-blue-500" />} label="Business Model" value={s.businessModel ?? "—"} />
                <Row icon={<TrendingUp className="h-3.5 w-3.5 text-blue-500" />} label="Target Market" value={s.targetMarket ?? "—"} />
                <Row icon={<DollarSign className="h-3.5 w-3.5 text-blue-500" />} label="Funding Needed" value={fmt(s.fundingNeeded)} />
                <Row icon={<BarChart3 className="h-3.5 w-3.5 text-blue-500" />} label="Annual Revenue" value={fmt(s.annualRevenue)} />
                {s.problemStatement && (
                  <div className="pt-1">
                    <p className="text-[10px] uppercase tracking-wide font-medium text-[var(--color-neutral-400)] mb-1">Problem Statement</p>
                    <p className="text-xs text-[var(--color-neutral-600)] leading-relaxed">{s.problemStatement}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-neutral-400)]">Execution #{match.startupExecutionId}</p>
            )}
          </div>

          {/* Investor side */}
          <div className="border border-[var(--color-border)] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-violet-600" />
              </div>
              <h3 className="font-semibold text-sm text-[var(--color-foreground)]">Investor</h3>
            </div>
            {iu && (
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-[var(--color-foreground)]">{iu.fullName}</p>
                <p className="text-xs text-[var(--color-neutral-400)]">{iu.email}</p>
              </div>
            )}
            {inv ? (
              <div className="space-y-2 pt-1 border-t border-[var(--color-border)]">
                <Row icon={<Target className="h-3.5 w-3.5 text-violet-500" />} label="Preferred Industry" value={inv.preferredIndustry ?? "—"} />
                <Row icon={<DollarSign className="h-3.5 w-3.5 text-violet-500" />} label="Investment Budget" value={fmt(inv.investmentBudget)} />
                <Row icon={<Calendar className="h-3.5 w-3.5 text-violet-500" />} label="Return Timeline" value={inv.expectedReturnTimeline ?? "—"} />
                {inv.investmentReason && (
                  <div className="pt-1">
                    <p className="text-[10px] uppercase tracking-wide font-medium text-[var(--color-neutral-400)] mb-1">Investment Reason</p>
                    <p className="text-xs text-[var(--color-neutral-600)] leading-relaxed">{inv.investmentReason}</p>
                  </div>
                )}
                {inv.successCriteria && (
                  <div className="pt-1">
                    <p className="text-[10px] uppercase tracking-wide font-medium text-[var(--color-neutral-400)] mb-1">Success Criteria</p>
                    <p className="text-xs text-[var(--color-neutral-600)] leading-relaxed">{inv.successCriteria}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-neutral-400)]">Execution #{match.investorExecutionId}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <span className="text-[10px] uppercase tracking-wide font-medium text-[var(--color-neutral-400)]">{label}: </span>
        <span className="text-xs text-[var(--color-foreground)]">{value}</span>
      </div>
    </div>
  );
}



function MatchCard({ match, onClick }: { match: EnrichedMatch; onClick: () => void }) {
  const s = match.startup;
  const inv = match.investor;
  const su = match.startupUser;
  const iu = match.investorUser;

  return (
    <Card
      onClick={onClick}
      className="border border-[var(--color-border)] hover:shadow-md hover:border-[var(--color-primary-300)] transition-all cursor-pointer group"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 min-w-0">
                <Building2 className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-semibold text-blue-400 tracking-wide leading-none mb-0.5">Startup</p>
                  <p className="text-xs font-medium text-blue-800 truncate">
                    {su?.fullName ?? `User #${match.startupUserId}`}
                  </p>
                  {su?.startupProfile?.companyName && (
                    <p className="text-[10px] text-blue-500 truncate">{su.startupProfile.companyName}</p>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--color-neutral-300)] flex-shrink-0" />
              <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-lg px-2.5 py-1.5 min-w-0">
                <TrendingUp className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-semibold text-violet-400 tracking-wide leading-none mb-0.5">Investor</p>
                  <p className="text-xs font-medium text-violet-800 truncate">
                    {iu?.fullName ?? `User #${match.investorUserId}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(s?.industry || inv?.preferredIndustry) && (
                <div className="flex items-center gap-1 text-xs text-[var(--color-neutral-600)]">
                  <Target className="h-3 w-3 text-[var(--color-neutral-400)]" />
                  <span className="font-medium">{s?.industry ?? inv?.preferredIndustry}</span>
                </div>
              )}
              {s?.fundingNeeded != null && (
                <div className="flex items-center gap-1 text-xs text-[var(--color-neutral-600)]">
                  <DollarSign className="h-3 w-3 text-[var(--color-neutral-400)]" />
                  <span>Needs {fmt(s.fundingNeeded)}</span>
                </div>
              )}
              {inv?.investmentBudget != null && (
                <div className="flex items-center gap-1 text-xs text-[var(--color-neutral-600)]">
                  <DollarSign className="h-3 w-3 text-[var(--color-neutral-400)]" />
                  <span>Budget {fmt(inv.investmentBudget)}</span>
                </div>
              )}
              {match.matchedAt && (
                <div className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                  <Calendar className="h-3 w-3" />
                  <span>{fmtDate(match.matchedAt)}</span>
                </div>
              )}
            </div>

            {match.matchReason && (
              <p className="text-xs text-[var(--color-neutral-500)] line-clamp-1">{match.matchReason}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className={`text-center rounded-xl border px-3 py-2 ${scoreBg(match.matchScore)}`}>
              <p className={`text-xl font-bold leading-none ${scoreColor(match.matchScore)}`}>
                {match.matchScore.toFixed(0)}
              </p>
              <p className="text-[10px] text-[var(--color-neutral-400)] leading-none mt-0.5">/100</p>
            </div>
            <Badge variant={match.status === "MATCHED" ? "success" : "secondary"} className="text-[10px]">
              {match.status}
            </Badge>
            <ChevronRight className="h-4 w-4 text-[var(--color-neutral-300)] group-hover:text-[var(--color-primary)] transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MatchesTab() {
  const [matches, setMatches] = useState<EnrichedMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<EnrichedMatch | null>(null);

  useEffect(() => {
    Promise.allSettled([
      adminService.getAllMatches(),
      adminService.getAllStartupExecutions(),
      adminService.getAllInvestorExecutions(),
      adminService.getAllUsers("STARTUP"),
      adminService.getAllUsers("INVESTOR"),
    ]).then(([matchRes, startupExecRes, investorExecRes, startupUserRes, investorUserRes]) => {
      const rawMatches: InvestorMatch[] =
        matchRes.status === "fulfilled" ? (matchRes.value.data?.data ?? []) : [];
      const startupExecs: StartupExecution[] =
        startupExecRes.status === "fulfilled" ? (startupExecRes.value.data?.data ?? []) : [];
      const investorExecs: InvestorExecution[] =
        investorExecRes.status === "fulfilled" ? (investorExecRes.value.data?.data ?? []) : [];
      const startupUsers: User[] =
        startupUserRes.status === "fulfilled" ? (startupUserRes.value.data?.data ?? []) : [];
      const investorUsers: User[] =
        investorUserRes.status === "fulfilled" ? (investorUserRes.value.data?.data ?? []) : [];

      const startupExecById = new Map(startupExecs.map((e) => [e.id, e]));
      const investorExecById = new Map(investorExecs.map((e) => [e.id, e]));
      const startupUserById = new Map(startupUsers.map((u) => [Number(u.id), u]));
      const investorUserById = new Map(investorUsers.map((u) => [Number(u.id), u]));

      setMatches(
        rawMatches.map((m) => ({
          ...m,
          startup: startupExecById.get(m.startupExecutionId),
          investor: investorExecById.get(m.investorExecutionId),
          startupUser: startupUserById.get(m.startupUserId),
          investorUser: investorUserById.get(m.investorUserId),
        }))
      );
      setIsLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return matches;
    const q = search.toLowerCase();
    return matches.filter(
      (m) =>
        m.startupUser?.fullName?.toLowerCase().includes(q) ||
        m.investorUser?.fullName?.toLowerCase().includes(q) ||
        m.startup?.industry?.toLowerCase().includes(q) ||
        m.investor?.preferredIndustry?.toLowerCase().includes(q) ||
        m.matchReason?.toLowerCase().includes(q) ||
        m.startupUser?.email?.toLowerCase().includes(q) ||
        m.investorUser?.email?.toLowerCase().includes(q)
    );
  }, [matches, search]);

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-400)]" />
          <Input
            placeholder="Search by name, industry, or match reason…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <ExportMenu
          disabled={isLoading || filtered.length === 0}
          onCSV={() => exportMatchesCSV(filtered)}
          onPDF={() => exportMatchesPDF(filtered)}
        />
      </div>

      {!isLoading && matches.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-[var(--color-neutral-500)]">
          <span>
            <strong className="text-[var(--color-foreground)]">{filtered.length}</strong>{" "}
            match{filtered.length !== 1 ? "es" : ""}
            {search && ` for "${search}"`}
          </span>
          <span>·</span>
          <span>
            Avg score:{" "}
            <strong className="text-[var(--color-foreground)]">
              {(matches.reduce((s, m) => s + m.matchScore, 0) / matches.length).toFixed(1)}
            </strong>
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-2 border-[var(--color-border)]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <TrendingUp className="h-10 w-10 text-[var(--color-neutral-400)]" />
            <p className="text-[var(--color-neutral-500)]">
              {search ? "No matches found for your search" : "No matches yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <MatchCard key={m.id} match={m} onClick={() => setSelected(m)} />
          ))}
        </div>
      )}

      <MatchDetailModal match={selected} onClose={() => setSelected(null)} />
    </>
  );
}



function AuditLogsTab() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadLogs = (filters?: Record<string, string>) => {
    setIsLoading(true);
    adminService
      .getAuditLogs(filters)
      .then((res) => setLogs(res.data.data ?? []))
      .catch(() => setLogs([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadLogs(); }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loadLogs({ search });
  };

  const outcomeVariant = (outcome: string) => {
    if (outcome === "SUCCESS") return "success";
    if (outcome === "FAILURE") return "destructive";
    return "muted";
  };

  return (
    <>
      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-400)]" />
            <Input
              placeholder="Search by user, action, or resource…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline">Search</Button>
        </form>
        <ExportMenu
          disabled={isLoading || logs.length === 0}
          onCSV={() => exportAuditCSV(logs)}
          onPDF={() => exportAuditPDF(logs)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : logs.length === 0 ? (
        <Card className="border-dashed border-2 border-[var(--color-border)]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <BookOpen className="h-10 w-10 text-[var(--color-neutral-400)]" />
            <p className="text-[var(--color-neutral-500)]">No audit logs found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id} className="border border-[var(--color-border)] hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="h-4 w-4 text-[var(--color-primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-[var(--color-foreground)]">{log.actionType}</span>
                        <Badge variant={outcomeVariant(log.outcome) as any}>{log.outcome}</Badge>
                        <span className="text-xs text-[var(--color-neutral-400)]">{log.serviceName}</span>
                      </div>
                      <p className="text-xs text-[var(--color-neutral-500)]">
                        <span className="font-medium">{log.userEmail ?? "Unknown"}</span>{" "}
                        ({log.userRole}) · {log.affectedResource}
                      </p>
                      {log.details && (
                        <p className="text-xs text-[var(--color-neutral-400)] mt-0.5 truncate">{log.details}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-[var(--color-neutral-400)] flex-shrink-0 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}



type Tab = "matches" | "audit";

export default function AuditLogsPage() {
  const [tab, setTab] = useState<Tab>("matches");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">Audit & Matches</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          View all investor-startup matches and the full system activity trail — exportable as CSV or PDF
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-[var(--color-neutral-100)] rounded-xl w-fit">
        <button
          onClick={() => setTab("matches")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "matches"
              ? "bg-white shadow text-[var(--color-primary)] border border-[var(--color-border)]"
              : "text-[var(--color-neutral-500)] hover:text-[var(--color-foreground)]"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Investment Matches
        </button>
        <button
          onClick={() => setTab("audit")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "audit"
              ? "bg-white shadow text-[var(--color-primary)] border border-[var(--color-border)]"
              : "text-[var(--color-neutral-500)] hover:text-[var(--color-foreground)]"
          }`}
        >
          <Shield className="h-4 w-4" />
          Audit Logs
        </button>
      </div>

      {tab === "matches" ? <MatchesTab /> : <AuditLogsTab />}
    </div>
  );
}
