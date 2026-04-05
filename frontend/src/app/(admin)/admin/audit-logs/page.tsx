"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { AuditLog } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, BookOpen, Shield } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadLogs = (filters?: any) => {
    setIsLoading(true);
    adminService
      .getAuditLogs(filters)
      .then((res) => setLogs(res.data.data ?? []))
      .catch(() => setLogs([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs({ search });
  };

  const outcomeVariant = (outcome: string) => {
    if (outcome === "SUCCESS") return "success";
    if (outcome === "FAILURE") return "destructive";
    return "muted";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
          Audit Logs
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          Full system activity trail — every action is permanently recorded
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-400)]" />
          <Input
            placeholder="Search by user, action, or resource…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {/* Logs */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : logs.length === 0 ? (
        <Card className="border-dashed border-2 border-[var(--color-border)]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <BookOpen className="h-10 w-10 text-[var(--color-neutral-400)]" />
            <p className="text-[var(--color-neutral-500)]">
              No audit logs found
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card
              key={log.id}
              className="border border-[var(--color-border)] hover:shadow-sm transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="h-4 w-4 text-[var(--color-primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-[var(--color-foreground)]">
                          {log.actionType}
                        </span>
                        <Badge variant={outcomeVariant(log.outcome) as any}>
                          {log.outcome}
                        </Badge>
                        <span className="text-xs text-[var(--color-neutral-400)]">
                          {log.serviceName}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-neutral-500)]">
                        <span className="font-medium">
                          {log.userEmail ?? "Unknown"}
                        </span>{" "}
                        ({log.userRole}) · {log.affectedResource}
                      </p>
                      {log.details && (
                        <p className="text-xs text-[var(--color-neutral-400)] mt-0.5 truncate">
                          {log.details}
                        </p>
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
    </div>
  );
}