"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { startupService } from "@/services/startupService";
import { StartupExecution } from "@/types/execution";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

const statusConfig = {
  PENDING: { label: "Pending", icon: Clock, variant: "pending" as const },
  MATCHED: { label: "Matched", icon: CheckCircle2, variant: "success" as const },
  REJECTED: { label: "Rejected", icon: XCircle, variant: "destructive" as const },
};

const companySizeLabels: Record<string, string> = {
  PRE_SEED: "Pre-seed",
  SEED: "Seed",
  SERIES_A: "Series A",
  SERIES_B: "Series B",
  GROWTH: "Growth",
};

export default function ExecutionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [execution, setExecution] = useState<StartupExecution | null>(null);
  const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
    startupService
      .getExecutionById(id as string)
      .then((res) => {
        const raw = res.data;
        if (raw?.data && typeof raw.data === "object") {
          setExecution(raw.data);
        } else {
          setExecution(raw);
        }
      })
      .catch(() => setExecution(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-[var(--color-neutral-400)]" />
        <p className="text-[var(--color-neutral-500)]">Execution not found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

 const cfg = statusConfig[execution.status] ?? {
  label: execution.status ?? "Unknown",
  icon: Clock,
  variant: "pending" as const,
};
const StatusIcon = cfg.icon;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[var(--color-neutral-500)] hover:text-[var(--color-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to executions
      </button>

      {/* Status banner */}
      <Card className="border border-[var(--color-border)]">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--color-neutral-400)] mb-1">
              Submitted on{" "}
              {new Date(execution.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <Badge variant={cfg.variant} className="gap-1 text-sm px-3 py-1">
              <StatusIcon className="h-4 w-4" />
              {cfg.label}
            </Badge>
          </div>
          {execution.status === "PENDING" && (
            <p className="text-xs text-blue-600 flex items-center gap-1.5 max-w-xs text-right">
              <Clock className="h-4 w-4 flex-shrink-0" />
              Your execution is under review. You will be notified once a
              decision is made.
            </p>
          )}
          {execution.status === "MATCHED" && (
            <p className="text-xs text-green-600 flex items-center gap-1.5 max-w-xs text-right">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              A potential investor match has been found for your startup.
            </p>
          )}
          {execution.status === "REJECTED" && execution.statusReason && (
            <p className="text-xs text-red-500 flex items-start gap-1.5 max-w-xs text-right">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {execution.statusReason}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle>Execution Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {[
            {
              label: "Company Stage",
              value:
                companySizeLabels[execution.targetCompanySize] ||
                execution.targetCompanySize,
            },
            {
              label: "Problem Statement",
              value: execution.problemStatement,
            },
            {
              label: "Business Model",
              value: execution.businessModel,
            },
            {
              label: "Target Market",
              value: execution.targetMarket,
            },
            {
              label: "Team Details",
              value: execution.teamDetails,
            },
            {
              label: "Annual Revenue",
              value: `$${execution.annualRevenue?.toLocaleString()}`,
            },
            {
              label: "Monthly Burn Rate",
              value: `$${execution.monthlyBurnRate?.toLocaleString()}`,
            },
            {
              label: "Funding Needed",
              value: `$${execution.fundingNeeded?.toLocaleString()}`,
            },
            ...(execution.additionalConsiderations
              ? [
                  {
                    label: "Additional Considerations",
                    value: execution.additionalConsiderations,
                  },
                ]
              : []),
          ].map((item) => (
            <div
              key={item.label}
              className="border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0"
            >
              <p className="text-xs font-medium text-[var(--color-neutral-400)] uppercase tracking-wide mb-1">
                {item.label}
              </p>
              <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
                {item.value}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}