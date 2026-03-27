"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { investorService } from "@/services/investorService";
import { InvestorExecution } from "@/types/execution";
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
  DollarSign,
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
    label: "Closed",
    icon: XCircle,
    variant: "destructive" as const,
  },
};

export default function InvestorExecutionsPage() {
  const [executions, setExecutions] = useState<InvestorExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    investorService
      .getExecutions()
      .then((res) => setExecutions(res.data.data ?? []))
      .catch(() => setExecutions([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
            My Investments
          </h2>
          <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
            Manage your investment executions and matched startups
          </p>
        </div>
        <Link href="/investor/execute">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Investment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Executions",
            value: executions.length,
            icon: Briefcase,
            bg: "bg-[var(--color-primary-50)]",
            color: "text-[var(--color-primary)]",
          },
          {
            label: "Active Matches",
            value: executions.filter((e) => e.status === "MATCHED").length,
            icon: CheckCircle2,
            bg: "bg-green-50",
            color: "text-green-600",
          },
          {
            label: "Pending",
            value: executions.filter((e) => e.status === "PENDING").length,
            icon: Clock,
            bg: "bg-blue-50",
            color: "text-blue-600",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="border border-[var(--color-border)]"
          >
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
              <DollarSign className="h-7 w-7 text-[var(--color-primary)]" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-[var(--color-primary-800)]">
                No investment executions yet
              </p>
              <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                Submit your investment criteria to find matching startups
              </p>
            </div>
            <Link href="/investor/execute">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Start New Investment
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
                  <div className="flex items-start justify-between gap-4">
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
                        {exec.preferredIndustry} Investment
                      </p>

                      <div className="flex flex-wrap gap-4 mt-1">
                        <span className="text-xs text-[var(--color-neutral-500)]">
                          Budget: ${exec.investmentBudget?.toLocaleString()}
                        </span>
                        <span className="text-xs text-[var(--color-neutral-500)]">
                          Industry: {exec.preferredIndustry}
                        </span>
                      </div>

                      {exec.status === "PENDING" && (
                        <p className="mt-2 text-xs text-blue-600 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Searching for matching startups
                        </p>
                      )}

                      {exec.status === "MATCHED" && (
                        <p className="mt-2 text-xs text-green-600 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Investment matched successfully
                        </p>
                      )}

                      {exec.status === "REJECTED" && exec.statusReason && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-red-500">
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                          <span>{exec.statusReason}</span>
                        </div>
                      )}
                    </div>

                    <Link href={`/investor/executions/${exec.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 flex-shrink-0"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </Link>
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