"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { startupService } from "@/services/startupService";
import { StartupExecution } from "@/types/execution";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  PlusCircle,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  Briefcase,
  AlertCircle,
} from "lucide-react";

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    variant: "pending" as const,
  },
  MATCHED: {
    label: "Matched",
    icon: CheckCircle2,
    variant: "success" as const,
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    variant: "destructive" as const,
  },
};

const companySizeLabels: Record<string, string> = {
  PRE_SEED: "Pre-seed",
  SEED: "Seed",
  SERIES_A: "Series A",
  SERIES_B: "Series B",
  GROWTH: "Growth",
};

export default function StartupExecutionsPage() {
  const [executions, setExecutions] = useState<StartupExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  const handleWithdraw = async (id: number) => {
    setWithdrawingId(id);
    try {
      await startupService.withdrawExecution(String(id));
      setExecutions((prev) => prev.filter((e) => e.id !== id));
      toast.success("Execution withdrawn successfully.");
    } catch {
      toast.error("Failed to withdraw. Please try again.");
    } finally {
      setWithdrawingId(null);
    }
  };

  useEffect(() => {
    startupService
      .getExecutions()
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setExecutions(data);
        } else if (Array.isArray(data?.content)) {
          setExecutions(data.content);
        } else if (Array.isArray(data?.data)) {
          setExecutions(data.data);
        } else {
          setExecutions([]);
        }
      })
      .catch(() => setExecutions([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
            My Executions
          </h2>
          <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
            Track your startup investment readiness submissions
          </p>
        </div>
        <Link href="/startup/execute">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Execution
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Submitted",
            value: executions.length,
            icon: Briefcase,
            bg: "bg-[var(--color-primary-50)]",
            color: "text-[var(--color-primary)]",
          },
          {
            label: "Matched",
            value: executions.filter((e) => e.status === "MATCHED").length,
            icon: CheckCircle2,
            bg: "bg-green-50",
            color: "text-green-600",
          },
          {
            label: "Pending Review",
            value: executions.filter((e) => e.status === "PENDING").length,
            icon: Clock,
            bg: "bg-blue-50",
            color: "text-blue-600",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border border-[var(--color-border)]">
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.bg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-primary-800)]">
                  {stat.value}
                </p>
                <p className="text-xs text-[var(--color-neutral-500)]">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : executions.length === 0 ? (
        <Card className="border-dashed border-2 border-[var(--color-border)]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-14 w-14 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-[var(--color-primary)]" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-[var(--color-primary-800)]">
                No executions yet
              </p>
              <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                Submit your first execution to get started
              </p>
            </div>
            <Link href="/startup/execute">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Start New Execution
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {executions.map((exec) => {
            const cfg = statusConfig[exec.status];
            const StatusIcon = cfg.icon;
            return (
              <Card
                key={exec.id}
                className="border border-[var(--color-border)] hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={cfg.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                        <span className="text-xs text-[var(--color-neutral-400)]">
                          {new Date(exec.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="font-medium text-[var(--color-primary-800)] truncate">
                        {exec.businessModel || "Startup Execution"}
                      </p>

                      <div className="flex flex-wrap gap-4 mt-1">
                        <span className="text-xs text-[var(--color-neutral-500)]">
                          Stage:{" "}
                          {companySizeLabels[exec.targetCompanySize] ||
                            exec.targetCompanySize}
                        </span>
                        <span className="text-xs text-[var(--color-neutral-500)]">
                          Market: {exec.targetMarket}
                        </span>
                        <span className="text-xs text-[var(--color-neutral-500)]">
                          Funding: ${exec.fundingNeeded?.toLocaleString()}
                        </span>
                      </div>

                      {exec.status === "REJECTED" && exec.statusReason && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-red-500">
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                          <span>{exec.statusReason}</span>
                        </div>
                      )}

                      {exec.status === "PENDING" && (
                        <p className="mt-2 text-xs text-blue-600 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Under review — you will be notified when there is an
                          update
                        </p>
                      )}

                      {exec.status === "MATCHED" && (
                        <p className="mt-2 text-xs text-green-600 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          A potential investor has been found for your startup
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link href={`/startup/executions/${exec.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        onClick={() => handleWithdraw(exec.id)}
                        disabled={withdrawingId === exec.id}
                      >
                        {withdrawingId === exec.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        Withdraw
                      </Button>
                    </div>
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