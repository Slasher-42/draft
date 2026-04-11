"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { followupService } from "@/services/followupService";
import { matchingService } from "@/services/matchingService";
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

export default function InvestorAccountPage() {
  const { user } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [depositing, setDepositing] = useState(false);

  const [showInvest, setShowInvest] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | "">("");
  const [investAmount, setInvestAmount] = useState("");
  const [investDesc, setInvestDesc] = useState("");
  const [investing, setInvesting] = useState(false);

  useEffect(() => {
    Promise.all([
      followupService.getMyAccount(),
      followupService.getMyTransactions(),
      user?.id ? matchingService.getMatchesForInvestor(user.id) : Promise.resolve({ data: { data: [] } }),
    ])
      .then(([accRes, txRes, matchRes]) => {
        setAccount(accRes.data?.data);
        setTransactions(txRes.data?.data ?? []);
        setMatches(matchRes.data?.data ?? []);
      })
      .catch(() => toast.error("Failed to load account data"))
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }
    setDepositing(true);
    try {
      const res = await followupService.deposit({ amount, paymentMethod: selectedMethod });
      setAccount(res.data.data);
      toast.success("Deposit successful");
      setShowDeposit(false);
      setDepositAmount("");
    } catch {
      toast.error("Deposit failed");
    } finally {
      setDepositing(false);
    }
  };

  const handleInvest = async () => {
    const amount = parseFloat(investAmount);
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }
    if (!selectedMatchId) { toast.error("Select a match"); return; }
    setInvesting(true);
    try {
      const res = await followupService.invest({ matchId: Number(selectedMatchId), amount, description: investDesc });
      setTransactions((prev) => [res.data.data, ...prev]);
      const accRes = await followupService.getMyAccount();
      setAccount(accRes.data.data);
      toast.success("Investment transferred successfully");
      setShowInvest(false);
      setInvestAmount("");
      setInvestDesc("");
      setSelectedMatchId("");
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

  const totalSent = transactions.filter((t) => t.fromUserId === user?.id && t.status === "COMPLETED").reduce((s, t) => s + t.amount, 0);

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
                onClick={() => setShowDeposit((v) => !v)}>
                <ArrowDownToLine className="h-4 w-4" />Deposit
              </Button>
              <Button size="sm" variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => setShowInvest((v) => !v)}>
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
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-neutral-700)] block mb-1">Select Match</label>
              <select
                value={selectedMatchId}
                onChange={(e) => setSelectedMatchId(e.target.value ? Number(e.target.value) : "")}
                className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">— choose a match —</option>
                {matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    Match #{m.id} — Startup #{m.startupUserId} ({Math.round((m.matchScore ?? 0) * 100)}% match)
                  </option>
                ))}
              </select>
            </div>
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
              <label className="text-sm font-medium text-[var(--color-neutral-700)] block mb-1">Description (optional)</label>
              <input
                type="text"
                placeholder="e.g. Seed round investment"
                value={investDesc}
                onChange={(e) => setInvestDesc(e.target.value)}
                className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInvest} disabled={investing} className="gap-2">
                {investing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpFromLine className="h-4 w-4" />}
                Transfer Investment
              </Button>
              <Button variant="outline" onClick={() => setShowInvest(false)}>Cancel</Button>
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
                const isSent = tx.fromUserId === user?.id;
                const StatusIcon = txStatusIcon[tx.status] ?? Clock;
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
                          {isSent ? `To startup #${tx.toUserId}` : `From investor #${tx.fromUserId}`}
                        </p>
                        <p className="text-xs text-[var(--color-neutral-400)]">
                          {tx.description ?? `Match #${tx.matchId}`} · {new Date(tx.createdAt).toLocaleDateString()}
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
