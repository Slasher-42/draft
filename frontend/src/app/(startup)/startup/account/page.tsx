"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { followupService } from "@/services/followupService";
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

export default function StartupAccountPage() {
  const { user } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([followupService.getMyAccount(), followupService.getMyTransactions()])
      .then(([accRes, txRes]) => {
        setAccount(accRes.data?.data);
        setTransactions(txRes.data?.data ?? []);
      })
      .catch(() => toast.error("Failed to load account data"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const totalReceived = transactions
    .filter((t) => t.toUserId === user?.id && t.status === "COMPLETED")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">Account</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">View your investment funds received</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border border-[var(--color-border)] sm:col-span-1" style={{ background: "linear-gradient(135deg, #052654 0%, #0B4A8B 100%)" }}>
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
          </CardContent>
        </Card>

        <Card className="border border-[var(--color-border)]">
          <CardContent className="p-4 flex items-center gap-4 h-full">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-50">
              <TrendingDown className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-primary-800)]">
                ${totalReceived.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-[var(--color-neutral-500)]">Total Received</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
                const isReceived = tx.toUserId === user?.id;
                const StatusIcon = txStatusIcon[tx.status] ?? Clock;
                return (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isReceived ? "bg-green-50" : "bg-red-50"}`}>
                        {isReceived
                          ? <ArrowDownToLine className="h-4 w-4 text-green-600" />
                          : <ArrowUpFromLine className="h-4 w-4 text-red-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-primary-800)]">
                          {isReceived ? `From investor #${tx.fromUserId}` : `To startup #${tx.toUserId}`}
                        </p>
                        <p className="text-xs text-[var(--color-neutral-400)]">
                          {tx.description ?? `Match #${tx.matchId}`} · {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isReceived ? "text-green-600" : "text-red-500"}`}>
                        {isReceived ? "+" : "−"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
