"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { followupService } from "@/services/followupService";
import { matchingService } from "@/services/matchingService";
import { userService } from "@/services/userService";
import { startupService } from "@/services/startupService";
import { useAuth } from "@/context/AuthContext";
import { Account, Transaction, PaymentMethod } from "@/types/followup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  Building2,
  Smartphone,
  Bitcoin,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  BadgePercent,
  Globe,
  Target,
  Users,
  DollarSign,
  Lightbulb,
} from "lucide-react";

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: Building2 },
  { value: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
  { value: "MOBILE_MONEY", label: "Mobile Money", icon: Smartphone },
  { value: "CRYPTO", label: "Crypto", icon: Bitcoin },
];

const txStatusIcon: Record<string, React.ElementType> = {
  COMPLETED: CheckCircle2,
  PENDING: Clock,
  FAILED: XCircle,
};
const txStatusColor: Record<string, string> = {
  COMPLETED: "text-green-600",
  PENDING: "text-amber-600",
  FAILED: "text-red-500",
};

interface StartupInfo {
  fullName: string;
  email: string;
  phoneNumber?: string;
  industry?: string;
  country?: string;
  city?: string;
  website?: string;
  problemStatement?: string;
  businessModel?: string;
  targetMarket?: string;
  fundingNeeded?: number;
  suggestedFundingRange?: string;
  teamDetails?: string;
}

export default function InvestorAccountPage() {
  const { user } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [startupInfoMap, setStartupInfoMap] = useState<Record<number, StartupInfo>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositAccountNumber, setDepositAccountNumber] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [depositing, setDepositing] = useState(false);

  const [showInvest, setShowInvest] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [investAmount, setInvestAmount] = useState("");
  const [investDesc, setInvestDesc] = useState("");
  const [investing, setInvesting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const [accRes, txRes, matchRes] = await Promise.all([
          followupService.getMyAccount(),
          followupService.getMyTransactions(),
          matchingService.getMatchesForInvestor(Number(user.id)),
        ]);
        const loadedMatches: any[] = matchRes.data?.data ?? [];
        setAccount(accRes.data?.data);
        setTransactions(txRes.data?.data ?? []);
        setMatches(loadedMatches);

        const uniqueMatches = loadedMatches.filter(
          (m, i, arr) => arr.findIndex((x) => x.startupUserId === m.startupUserId) === i
        );
        if (uniqueMatches.length > 0) {
          const infos = await Promise.allSettled(
            uniqueMatches.map(async (m) => {
              const [userResult, execResult] = await Promise.allSettled([
                userService.getUserById(m.startupUserId),
                m.startupExecutionId
                  ? startupService.getExecutionByIdInternal(m.startupExecutionId)
                  : Promise.resolve(null),
              ]);
              const u = userResult.status === "fulfilled" ? userResult.value : null;
              const exec = execResult.status === "fulfilled" ? execResult.value?.data?.data ?? execResult.value?.data : null;
              const profile = u?.startupProfile;
              return {
                id: m.startupUserId as number,
                info: {
                  fullName: profile?.companyName ?? u?.fullName ?? `Startup #${m.startupUserId}`,
                  email: u?.email ?? "",
                  phoneNumber: u?.phoneNumber,
                  industry: exec?.industry ?? profile?.industry,
                  country: profile?.country,
                  city: profile?.city,
                  website: profile?.website,
                  problemStatement: exec?.problemStatement,
                  businessModel: exec?.businessModel,
                  targetMarket: exec?.targetMarket,
                  fundingNeeded: exec?.fundingNeeded,
                  suggestedFundingRange: exec?.suggestedFundingRange,
                  teamDetails: exec?.teamDetails,
                } as StartupInfo,
              };
            })
          );
          const map: Record<number, StartupInfo> = {};
          infos.forEach((r) => {
            if (r.status === "fulfilled") map[r.value.id] = r.value.info;
          });
          setStartupInfoMap(map);
        }
      } catch {
        toast.error("Failed to load account data");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }
    if (!depositAccountNumber.trim()) { toast.error("Enter your account number"); return; }
    setDepositing(true);
    try {
      const res = await followupService.deposit({ amount, paymentMethod: selectedMethod, accountNumber: depositAccountNumber.trim() });
      setAccount(res.data.data);
      toast.success("Deposit successful");
      setShowDeposit(false);
      setDepositAmount("");
      setDepositAccountNumber("");
    } catch {
      toast.error("Deposit failed");
    } finally {
      setDepositing(false);
    }
  };

  const handleInvest = async () => {
    const amount = parseFloat(investAmount);
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }
    if (!selectedMatchId) { toast.error("Select a startup to invest in"); return; }
    setInvesting(true);
    try {
      const res = await followupService.invest({ matchId: selectedMatchId, amount, description: investDesc });
      setTransactions((prev) => [res.data.data, ...prev]);
      const accRes = await followupService.getMyAccount();
      setAccount(accRes.data.data);
      toast.success("Investment transferred successfully");
      setShowInvest(false);
      setInvestAmount("");
      setInvestDesc("");
      setSelectedMatchId(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Investment failed");
    } finally {
      setInvesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const myId = Number(user?.id);
  const totalSent = transactions
    .filter((t) => t.fromUserId === myId && t.status === "COMPLETED")
    .reduce((s, t) => s + t.amount, 0);

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);
  const selectedStartup = selectedMatch ? startupInfoMap[selectedMatch.startupUserId] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">Account</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">Manage your investment wallet</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-[var(--color-border)] sm:col-span-2" style={{ background: "linear-gradient(135deg, #052654 0%, #0B4A8B 100%)" }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-white/60 uppercase tracking-wider">Available Balance</p>
                <p className="text-4xl font-bold text-white mt-1">
                  ${(account?.balance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                {account?.paymentMethod && (
                  <p className="text-xs text-white/50 mt-2">
                    Payment method: {account.paymentMethod.replace("_", " ")}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button size="sm" variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => { setShowDeposit((v) => !v); setShowInvest(false); }}>
                <ArrowDownToLine className="h-4 w-4" />Deposit
              </Button>
              <Button size="sm" variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => { setShowInvest((v) => !v); setShowDeposit(false); }}>
                <ArrowUpFromLine className="h-4 w-4" />Invest
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[var(--color-border)]">
          <CardContent className="p-4 flex items-center gap-4 h-full">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-50">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-primary-800)]">
                ${totalSent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-[var(--color-neutral-500)]">Total Invested</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showDeposit && (
        <Card className="border border-[var(--color-primary-200)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[var(--color-primary-800)]">Add Funds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-neutral-700)] block mb-1">Account Number</label>
              <input
                type="text"
                placeholder="e.g. 1234567890"
                value={depositAccountNumber}
                onChange={(e) => setDepositAccountNumber(e.target.value)}
                className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-neutral-700)] block mb-1">Amount (USD)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-neutral-700)] block mb-2">Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.value}
                    onClick={() => setSelectedMethod(pm.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all ${
                      selectedMethod === pm.value
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-50)] text-[var(--color-primary)]"
                        : "border-[var(--color-border)] text-[var(--color-neutral-600)] hover:border-[var(--color-primary-300)]"
                    }`}
                  >
                    <pm.icon className="h-5 w-5" />
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDeposit} disabled={depositing} className="gap-2">
                {depositing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
                Deposit
              </Button>
              <Button variant="outline" onClick={() => setShowDeposit(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showInvest && (
        <Card className="border border-[var(--color-primary-200)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[var(--color-primary-800)]">Invest in a Startup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-sm font-medium text-[var(--color-neutral-700)] block mb-3">
                Select a matched startup
              </label>
              {matches.length === 0 ? (
                <p className="text-sm text-[var(--color-neutral-400)] py-4 text-center border border-dashed border-[var(--color-border)] rounded-lg">
                  No matched startups yet
                </p>
              ) : (
                <div className="space-y-2">
                  {matches.map((m) => {
                    const info = startupInfoMap[m.startupUserId];
                    const isSelected = selectedMatchId === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMatchId(isSelected ? null : m.id)}
                        className={`w-full text-left rounded-xl border p-4 transition-all ${
                          isSelected
                            ? "border-[var(--color-primary)] bg-[var(--color-primary-50)] ring-1 ring-[var(--color-primary)]"
                            : "border-[var(--color-border)] hover:border-[var(--color-primary-300)] bg-white"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center flex-shrink-0">
                                <Briefcase className="h-5 w-5 text-[var(--color-primary)]" />
                              </div>
                              <div>
                                <p className="font-semibold text-[var(--color-primary-800)] text-sm">
                                  {info?.fullName ?? `Startup #${m.startupUserId}`}
                                </p>
                                {info?.industry && (
                                  <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)] mt-0.5">
                                    {info.industry}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-700 flex-shrink-0">
                              <BadgePercent className="h-3 w-3" />
                              {Math.round((m.matchScore ?? 0) * 100)}% match
                            </span>
                          </div>

                          {info?.problemStatement && (
                            <div className="flex gap-2">
                              <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-[var(--color-neutral-600)]">Problem they solve</p>
                                <p className="text-xs text-[var(--color-neutral-500)] line-clamp-2">{info.problemStatement}</p>
                              </div>
                            </div>
                          )}

                          {info?.businessModel && (
                            <div className="flex gap-2">
                              <Briefcase className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-[var(--color-neutral-600)]">Business model</p>
                                <p className="text-xs text-[var(--color-neutral-500)] line-clamp-2">{info.businessModel}</p>
                              </div>
                            </div>
                          )}

                          {info?.targetMarket && (
                            <div className="flex gap-2">
                              <Target className="h-3.5 w-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-[var(--color-neutral-600)]">Target market</p>
                                <p className="text-xs text-[var(--color-neutral-500)] line-clamp-1">{info.targetMarket}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 border-t border-[var(--color-border)]">
                            {info?.fundingNeeded && (
                              <span className="flex items-center gap-1 text-xs text-[var(--color-neutral-600)] font-medium">
                                <DollarSign className="h-3 w-3 text-green-600" />
                                Seeking ${info.fundingNeeded.toLocaleString()}
                                {info.suggestedFundingRange && (
                                  <span className="text-[var(--color-neutral-400)] font-normal">({info.suggestedFundingRange})</span>
                                )}
                              </span>
                            )}
                            {info?.teamDetails && (
                              <span className="flex items-center gap-1 text-xs text-[var(--color-neutral-500)]">
                                <Users className="h-3 w-3" />{info.teamDetails}
                              </span>
                            )}
                            {info?.email && (
                              <span className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                                <Mail className="h-3 w-3" />{info.email}
                              </span>
                            )}
                            {info?.phoneNumber && (
                              <span className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                                <Phone className="h-3 w-3" />{info.phoneNumber}
                              </span>
                            )}
                            {(info?.city || info?.country) && (
                              <span className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                                <MapPin className="h-3 w-3" />
                                {[info.city, info.country].filter(Boolean).join(", ")}
                              </span>
                            )}
                            {info?.website && (
                              <span className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                                <Globe className="h-3 w-3" />{info.website}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedMatchId && selectedStartup && (
              <div className="rounded-lg bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] p-3 text-sm text-[var(--color-primary-800)]">
                Investing in <span className="font-semibold">{selectedStartup.fullName}</span>
                {selectedStartup.industry && <span className="text-[var(--color-neutral-500)]"> · {selectedStartup.industry}</span>}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-[var(--color-neutral-700)] block mb-1">Amount (USD)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <p className="text-xs text-[var(--color-neutral-400)] mt-1">
                Available: ${(account?.balance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-neutral-700)] block mb-1">Note (optional)</label>
              <input
                type="text"
                placeholder="e.g. Seed round investment"
                value={investDesc}
                onChange={(e) => setInvestDesc(e.target.value)}
                className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInvest} disabled={investing || !selectedMatchId} className="gap-2">
                {investing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpFromLine className="h-4 w-4" />}
                Transfer Investment
              </Button>
              <Button variant="outline" onClick={() => { setShowInvest(false); setSelectedMatchId(null); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border border-[var(--color-border)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[var(--color-primary-800)]">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-[var(--color-neutral-400)] text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const isSent = tx.fromUserId === myId;
                const StatusIcon = txStatusIcon[tx.status] ?? Clock;
                const counterpartId = isSent ? tx.toUserId : tx.fromUserId;
                const counterpartInfo = startupInfoMap[counterpartId];
                const isSettlement = isSent && tx.toUserId === 0;
                const counterpartName = isSettlement
                  ? (tx.description ?? "Settlement")
                  : counterpartInfo?.fullName ?? (isSent ? `Startup #${tx.toUserId}` : `Investor #${tx.fromUserId}`);
                return (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isSent ? "bg-red-50" : "bg-green-50"}`}>
                        {isSent
                          ? <ArrowUpFromLine className="h-4 w-4 text-red-500" />
                          : <ArrowDownToLine className="h-4 w-4 text-green-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-primary-800)]">
                          {isSettlement ? counterpartName : isSent ? `To ${counterpartName}` : `From ${counterpartName}`}
                        </p>
                        <p className="text-xs text-[var(--color-neutral-400)]">
                          {isSettlement ? new Date(tx.createdAt).toLocaleDateString() : `${tx.description ?? `Match #${tx.matchId}`} · ${new Date(tx.createdAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isSent ? "text-red-500" : "text-green-600"}`}>
                        {isSent ? "−" : "+"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <div className={`flex items-center gap-1 text-xs justify-end ${txStatusColor[tx.status]}`}>
                        <StatusIcon className="h-3 w-3" />{tx.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
