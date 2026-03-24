"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { SystemConfig } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "react-toastify";
import { Loader2, Save, Settings, Clock, BarChart2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    adminService
      .getSystemConfig()
      .then((res) => setConfig(res.data))
      .catch(() => setConfig(null))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      await adminService.updateSystemConfig(config);
      toast.success("System configuration updated successfully.");
    } catch {
      toast.error("Failed to update configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateWeight = (key: keyof SystemConfig["scoringWeights"], value: number) => {
    if (!config) return;
    setConfig({
      ...config,
      scoringWeights: { ...config.scoringWeights, [key]: value },
    });
  };

  const totalWeight = config
    ? Object.values(config.scoringWeights).reduce((a, b) => a + b, 0)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-neutral-500)]">
          Failed to load configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
          System Settings
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          Configure system-wide rules for assessment and notifications
        </p>
      </div>

      {/* Update interval */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--color-secondary)]" />
            Update Interval
          </CardTitle>
          <CardDescription>
            The time period after which startups and investors are notified
            about their execution status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="updateInterval">Interval Value</Label>
          <Input
            id="updateInterval"
            placeholder="e.g. 48 hours, 4 minutes, 2 days"
            value={config.updateInterval}
            onChange={(e) =>
              setConfig({ ...config, updateInterval: e.target.value })
            }
          />
          <p className="text-xs text-[var(--color-neutral-400)]">
            Current value: <strong>{config.updateInterval}</strong>. This will
            be shown to users in confirmation messages.
          </p>
        </CardContent>
      </Card>

      {/* Scoring weights */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-[var(--color-secondary)]" />
            Scoring Dimension Weights
          </CardTitle>
          <CardDescription>
            Set the percentage weight for each dimension. All four must add up
            to exactly 100%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: "financialHealth" as const,
              label: "Financial Health",
              desc: "Revenue, burn rate, financial projections",
            },
            {
              key: "teamStrength" as const,
              label: "Team Strength",
              desc: "Founder experience, team composition",
            },
            {
              key: "marketPotential" as const,
              label: "Market Potential",
              desc: "Market size, growth opportunity",
            },
            {
              key: "businessViability" as const,
              label: "Business Viability",
              desc: "Business model clarity, competitive advantage",
            },
          ].map((dim) => (
            <div key={dim.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{dim.label}</Label>
                  <p className="text-xs text-[var(--color-neutral-400)]">
                    {dim.desc}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20 text-center"
                    value={config.scoringWeights[dim.key]}
                    onChange={(e) =>
                      updateWeight(dim.key, Number(e.target.value))
                    }
                  />
                  <span className="text-sm text-[var(--color-neutral-500)]">
                    %
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-[var(--color-neutral-100)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                  style={{ width: `${config.scoringWeights[dim.key]}%` }}
                />
              </div>
            </div>
          ))}

          <div
            className={`flex items-center justify-between p-3 rounded-lg border ${
              totalWeight === 100
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            <span className="text-sm font-medium">Total Weight</span>
            <span className="text-lg font-bold">{totalWeight}%</span>
          </div>

          {totalWeight !== 100 && (
            <p className="text-xs text-red-500">
              Weights must add up to exactly 100% before saving.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Minimum passing score */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[var(--color-secondary)]" />
            Minimum Passing Score
          </CardTitle>
          <CardDescription>
            Startups scoring below this threshold will be classified as Not
            Ready
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="minScore">Minimum Score (out of 100)</Label>
          <div className="flex items-center gap-3">
            <Input
              id="minScore"
              type="number"
              min={0}
              max={100}
              className="w-28"
              value={config.minimumPassingScore}
              onChange={(e) =>
                setConfig({
                  ...config,
                  minimumPassingScore: Number(e.target.value),
                })
              }
            />
            <span className="text-sm text-[var(--color-neutral-500)]">
              / 100
            </span>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full gap-2"
        onClick={handleSave}
        disabled={isSaving || totalWeight !== 100}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Configuration
          </>
        )}
      </Button>
    </div>
  );
}