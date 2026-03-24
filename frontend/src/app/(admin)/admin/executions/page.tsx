"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ClipboardList, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function AdminExecutionsPage() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    adminService
      .getAllExecutions({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      })
      .then((res) => setExecutions(res.data))
      .catch(() => setExecutions([]))
      .finally(() => setIsLoading(false));
  }, [statusFilter]);

  const statusConfig: Record<string, any> = {
    PENDING: { label: "Pending", icon: Clock, variant: "pending" },
    MATCHED: { label: "Matched", icon: CheckCircle2, variant: "success" },
    REJECTED: { label: "Rejected", icon: XCircle, variant: "destructive" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
          All Executions
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          All startup and investor executions across the platform
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["ALL", "PENDING", "MATCHED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === s
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-200)]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : executions.length === 0 ? (
        <Card className="border-dashed border-2 border-[var(--color-border)]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <ClipboardList className="h-10 w-10 text-[var(--color-neutral-400)]" />
            <p className="text-[var(--color-neutral-500)]">
              No executions found
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {executions.map((exec) => {
            const cfg = statusConfig[exec.status] ?? statusConfig.PENDING;
            const StatusIcon = cfg.icon;
            return (
              <Card
                key={exec.id}
                className="border border-[var(--color-border)] hover:shadow-sm transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <Badge variant={cfg.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                        <span className="text-xs text-[var(--color-neutral-400)] bg-[var(--color-neutral-100)] px-2 py-0.5 rounded-full">
                          {exec.type ?? "STARTUP"}
                        </span>
                        <span className="text-xs text-[var(--color-neutral-400)]">
                          {new Date(exec.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[var(--color-foreground)] truncate">
                        {exec.businessModel ??
                          exec.industry ??
                          "Execution"}
                      </p>
                      <p className="text-xs text-[var(--color-neutral-400)]">
                        User: {exec.userId}
                      </p>
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