"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { followupService } from "@/services/followupService";
import { matchingService } from "@/services/matchingService";
import { userService } from "@/services/userService";
import { investorService } from "@/services/investorService";
import { useAuth } from "@/context/AuthContext";
import { Account, Transaction } from "@/types/followup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingDown,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Target,
  DollarSign,
  Calendar,
  Star,
  MapPin,
  Building2,
  ChevronDown,
  ChevronUp,
  Banknote,
} from "lucide-react";

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

interface InvestorInfo {
  fullName: string;
  email: string;
  phoneNumber?: string;
  organizationName?: string;
  country?: string;
  city?: string;
  preferredIndustry?: string;
  investmentReason?: string;
  investmentBudget?: number;
  expectedReturnTimeline?: string;
  successCriteria?: string;
}

export default function StartupAccountPage() {
  const { user } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investorInfoMap, setInvestorInfoMap] = useState<Record<number, InvestorInfo>>({});
  const [expandedTx, setExpandedTx] = useState<number | null>(null);
  const [showSettle, setShowSettle] = useState(false);
  const [settleAmount, setSettleAmount] = useState("");
  const [settleAccountNumber, setSettleAccountNumber] = useState("");
  const [settling, setSettling] = useState(false);

  const { data: accountData, isLoading } = useQuery({
    queryKey: ["startup-account", user?.id],
    queryFn: async () => {
      try {
        const [accRes, txRes, matchRes] = await Promise.all([
          followupService.getMyAccount(),
          followupService.getMyTransactions(),
          matchingService.getMatchesForStartup(Number(user!.id)),
        ]);

        const loadedTx: Transaction[] = txRes.data?.data ?? [];
        const loadedMatches: any[] = matchRes.data?.data ?? [];

        const uniqueMatches = loadedMatches.filter(
          (m, i, arr) => arr.findIndex((x: any) => x.investorUserId === m.investorUserId) === i
        );

        let map: Record<number, InvestorInfo> = {};
        if (uniqueMatches.length > 0) {
          const infos = await Promise.allSettled(
            uniqueMatches.map(async (m) => {
              const [userResult, execResult] = await Promise.allSettled([
                userService.getUserById(m.investorUserId),
                m.investorExecutionId
                  ? investorService.getExecutionByIdInternal(m.investorExecutionId)
                  : Promise.resolve(null),
              ]);
              const u = userResult.status === "fulfilled" ? userResult.value : null;
              const exec = execResult.status === "fulfilled"
                ? execResult.value?.data?.data ?? execResult.value?.data
                : null;
              const profile = u?.investorProfile;
              return {
                id: m.investorUserId as number,
                info: {
                  fullName: profile?.organizationName ?? u?.fullName ?? `Investor #${m.investorUserId}`,
                  email: u?.email ?? "",
                  phoneNumber: u?.phoneNumber,
                  organizationName: profile?.organizationName,
                  country: profile?.country,
                  city: profile?.city,
                  preferredIndustry: exec?.preferredIndustry ?? profile?.preferredIndustry,
                  investmentReason: exec?.investmentReason,
                  investmentBudget: exec?.investmentBudget,
                  expectedReturnTimeline: exec?.expectedReturnTimeline,
                  successCriteria: exec?.successCriteria,
                } as InvestorInfo,
              };
            })
          );
          infos.forEach((r) => {
            if (r.status === "fulfilled") map[r.value.id] = r.value.info;
          });
        }

        return {
          account: accRes.data?.data,
          transactions: loadedTx,
          investorInfoMap: map,
        };
      } catch {
        toast.error("Failed to load account data");
        throw new Error("Failed to load account data");
      }
    },
    enabled: !!user?.id,
    retry: false,
  });

  useEffect(() => {
    if (!accountData) return;
    setAccount(accountData.account);
    setTransactions(accountData.transactions);
    setInvestorInfoMap(accountData.investorInfoMap);
  }, [accountData]);

  const handleSettle = async () => {
    const amount = parseFloat(settleAmount);
    if (!settleAccountNumber.trim()) { toast.error("Account number is required"); return; }
    if (isNaN(amount) || amount <= 0) { toast.error("Enter a valid amount"); return; }
    if (amount > (account?.balance ?? 0)) { toast.error("Amount exceeds available balance"); return; }
    setSettling(true);
    try {
      await followupService.settle({ amount, accountNumber: settleAccountNumber.trim() });
      toast.success("Settlement processed successfully");
      setShowSettle(false);
      setSettleAmount("");
      setSettleAccountNumber("");
      const [accRes, txRes] = await Promise.all([
        followupService.getMyAccount(),
        followupService.getMyTransactions(),
      ]);
      setAccount(accRes.data?.data);
      setTransactions(txRes.data?.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Settlement failed");
    } finally {
      setSettling(false);
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
  const totalReceived = transactions
    .filter((t) => t.toUserId === myId && t.status === "COMPLETED")
    .reduce((s, t) => s + t.amount, 0);

  const investorCount = new Set(
    transactions.filter((t) => t.toUserId === myId).map((t) => t.fromUserId)
  ).size;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">Account</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">View your investment funds received</p>
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
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowSettle((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition-colors"
              >
                <Banknote className="h-4 w-4" />
                {showSettle ? "Cancel" : "Settle Funds"}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Card className="border border-[var(--color-border)]">
            <CardContent className="p-4 flex items-center gap-3 h-full">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-50 flex-shrink-0">
                <TrendingDown className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--color-primary-800)]">
                  ${totalReceived.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-[var(--color-neutral-500)]">Total Received</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[var(--color-border)]">
            <CardContent className="p-4 flex items-center gap-3 h-full">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-50 flex-shrink-0">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--color-primary-800)]">{investorCount}</p>
                <p className="text-xs text-[var(--color-neutral-500)]">Investors</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showSettle && (
        <Card className="border border-[var(--color-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[var(--color-primary-800)] flex items-center gap-2">
              <Banknote className="h-4 w-4" /> Settle Funds to Your Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--color-neutral-500)]">
              Available: <span className="font-semibold text-green-600">${(account?.balance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </p>
            <div>
              <label className="block text-xs font-medium text-[var(--color-neutral-600)] mb-1">Account Number</label>
              <input
                type="text"
                value={settleAccountNumber}
                onChange={(e) => setSettleAccountNumber(e.target.value)}
                placeholder="Enter your bank account number"
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-neutral-600)] mb-1">Amount (USD)</label>
              <input
                type="number"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <button
              onClick={handleSettle}
              disabled={settling}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-800)] text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {settling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
              {settling ? "Processing..." : "Confirm Settlement"}
            </button>
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
                const isReceived = tx.toUserId === myId;
                const isSettlement = tx.fromUserId === myId && tx.toUserId === 0;
                const StatusIcon = txStatusIcon[tx.status] ?? Clock;
                const investorId = tx.fromUserId;
                const info = investorInfoMap[investorId];
                const isExpanded = expandedTx === tx.id;

                return (
                  <div key={tx.id} className="border border-[var(--color-border)] rounded-xl overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--color-neutral-50)] transition-colors text-left"
                      onClick={() => setExpandedTx(isExpanded ? null : tx.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${isReceived ? "bg-green-50" : isSettlement ? "bg-amber-50" : "bg-red-50"}`}>
                          {isReceived
                            ? <ArrowDownToLine className="h-4 w-4 text-green-600" />
                            : isSettlement
                            ? <Banknote className="h-4 w-4 text-amber-600" />
                            : <ArrowUpFromLine className="h-4 w-4 text-red-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-primary-800)]">
                            {isReceived
                              ? `Investment from ${info?.fullName ?? `Investor #${tx.fromUserId}`}`
                              : isSettlement
                              ? "Settlement Withdrawal"
                              : `To ${info?.fullName ?? `Startup #${tx.toUserId}`}`}
                          </p>
                          <p className="text-xs text-[var(--color-neutral-400)]">
                            {tx.description ?? `Match #${tx.matchId}`} · {new Date(tx.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${isReceived ? "text-green-600" : "text-red-500"}`}>
                            {isReceived ? "+" : "−"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </p>
                          <div className={`flex items-center gap-1 text-xs justify-end ${txStatusColor[tx.status]}`}>
                            <StatusIcon className="h-3 w-3" />{tx.status}
                          </div>
                        </div>
                        {isExpanded
                          ? <ChevronUp className="h-4 w-4 text-[var(--color-neutral-400)]" />
                          : <ChevronDown className="h-4 w-4 text-[var(--color-neutral-400)]" />}
                      </div>
                    </button>

                    {isExpanded && info && (
                      <div className="border-t border-[var(--color-border)] px-4 py-4 bg-[var(--color-neutral-50)] space-y-3">
                        <p className="text-xs font-semibold text-[var(--color-primary-800)] uppercase tracking-wide">Investor Details</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex gap-2">
                            <User className="h-3.5 w-3.5 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-[var(--color-neutral-600)]">Name</p>
                              <p className="text-xs text-[var(--color-neutral-800)]">{info.fullName}</p>
                            </div>
                          </div>

                          {info.email && (
                            <div className="flex gap-2">
                              <Mail className="h-3.5 w-3.5 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-[var(--color-neutral-600)]">Email</p>
                                <p className="text-xs text-[var(--color-neutral-800)]">{info.email}</p>
                              </div>
                            </div>
                          )}

                          {info.phoneNumber && (
                            <div className="flex gap-2">
                              <Phone className="h-3.5 w-3.5 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-[var(--color-neutral-600)]">Phone</p>
                                <p className="text-xs text-[var(--color-neutral-800)]">{info.phoneNumber}</p>
                              </div>
                            </div>
                          )}

                          {(info.city || info.country) && (
                            <div className="flex gap-2">
                              <MapPin className="h-3.5 w-3.5 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-[var(--color-neutral-600)]">Location</p>
                                <p className="text-xs text-[var(--color-neutral-800)]">
                                  {[info.city, info.country].filter(Boolean).join(", ")}
                                </p>
                              </div>
                            </div>
                          )}

                          {info.preferredIndustry && (
                            <div className="flex gap-2">
                              <Building2 className="h-3.5 w-3.5 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-[var(--color-neutral-600)]">Preferred Industry</p>
                                <p className="text-xs text-[var(--color-neutral-800)]">{info.preferredIndustry}</p>
                              </div>
                            </div>
                          )}

                          {info.investmentBudget && (
                            <div className="flex gap-2">
                              <DollarSign className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-[var(--color-neutral-600)]">Investment Budget</p>
                                <p className="text-xs text-[var(--color-neutral-800)]">
                                  ${info.investmentBudget.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}

                          {info.expectedReturnTimeline && (
                            <div className="flex gap-2">
                              <Calendar className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-[var(--color-neutral-600)]">Expected Return Timeline</p>
                                <p className="text-xs text-[var(--color-neutral-800)]">{info.expectedReturnTimeline}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {info.investmentReason && (
                          <div className="flex gap-2">
                            <Target className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-[var(--color-neutral-600)]">Why they invested</p>
                              <p className="text-xs text-[var(--color-neutral-700)] leading-relaxed">{info.investmentReason}</p>
                            </div>
                          </div>
                        )}

                        {info.successCriteria && (
                          <div className="flex gap-2">
                            <Star className="h-3.5 w-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-[var(--color-neutral-600)]">What success looks like to them</p>
                              <p className="text-xs text-[var(--color-neutral-700)] leading-relaxed">{info.successCriteria}</p>
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-[var(--color-border)]">
                          <p className="text-xs font-semibold text-[var(--color-primary-800)] uppercase tracking-wide mb-2">Investment Details</p>
                          <div className="flex flex-wrap gap-x-6 gap-y-1">
                            <span className="text-xs text-[var(--color-neutral-500)]">
                              Amount: <span className="font-semibold text-green-600">${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                            </span>
                            {tx.description && (
                              <span className="text-xs text-[var(--color-neutral-500)]">
                                Note: <span className="text-[var(--color-neutral-700)]">{tx.description}</span>
                              </span>
                            )}
                            <span className="text-xs text-[var(--color-neutral-500)]">
                              Date: <span className="text-[var(--color-neutral-700)]">{new Date(tx.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
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
