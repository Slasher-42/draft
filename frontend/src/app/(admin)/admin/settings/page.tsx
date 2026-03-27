"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "react-toastify";
import { Loader2, Save, Clock, BarChart2, ShieldCheck } from "lucide-react";

interface SystemConfig {
  id?: number;
  updateIntervalValue: number;
  updateIntervalUnit: string;
  weightFinancialHealth: number;
  weightTeamStrength: number;
  weightMarketPotential: number;
  weightBusinessViability: number;
  minimumPassingScore: number;
  updatedAt?: string;
}

const INTERVAL_UNITS = ["MINUTES", "HOURS", "DAYS"];

const WEIGHT_FIELDS: { key: keyof SystemConfig; label: string; desc: string }[] = [
  { key: "weightFinancialHealth",   label: "Financial Health",    desc: "Revenue, burn rate, financial projections" },
  { key: "weightTeamStrength",      label: "Team Strength",       desc: "Founder experience, team composition" },
  { key: "weightMarketPotential",   label: "Market Potential",    desc: "Market size, growth opportunity" },
  { key: "weightBusinessViability", label: "Business Viability",  desc: "Business model clarity, competitive advantage" },
];

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.get("/api/config")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setConfig(data);
      })
      .catch(() => setConfig(null))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      await api.put("/api/config", {
        updateIntervalValue:      config.updateIntervalValue,
        updateIntervalUnit:       config.updateIntervalUnit,
        weightFinancialHealth:    config.weightFinancialHealth,
        weightTeamStrength:       config.weightTeamStrength,
        weightMarketPotential:    config.weightMarketPotential,
        weightBusinessViability:  config.weightBusinessViability,
        minimumPassingScore:      config.minimumPassingScore,
      });
      toast.success("System configuration saved successfully.");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to save configuration.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const set = (key: keyof SystemConfig, value: any) =>
    setConfig((prev) => prev ? { ...prev, [key]: value } : prev);

  const totalWeight = config
    ? config.weightFinancialHealth +
      config.weightTeamStrength +
      config.weightMarketPotential +
      config.weightBusinessViability
    : 0;

  const weightsValid = Math.abs(totalWeight - 100) < 0.01;

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
        <p className="text-sm text-[var(--color-neutral-500)]">Failed to load configuration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">System Settings</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          Configure system-wide rules for assessment and notifications
        </p>
      </div>

      {/* Update interval */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-[var(--color-secondary)]" />
            Update Interval
          </CardTitle>
          <CardDescription>
            How long after submission before startups and investors receive a status update.
            This value is shown to users in AI confirmation messages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="intervalValue">Value</Label>
              <Input
                id="intervalValue"
                type="number"
                min={1}
                value={config.updateIntervalValue}
                onChange={(e) => set("updateIntervalValue", Number(e.target.value))}
                className="w-28"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <div className="flex gap-2">
                {INTERVAL_UNITS.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => set("updateIntervalUnit", unit)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      config.updateIntervalUnit === unit
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                        : "bg-white text-[var(--color-neutral-600)] border-[var(--color-border)] hover:border-[var(--color-primary-200)]"
                    }`}
                  >
                    {unit.charAt(0) + unit.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--color-neutral-400)] mt-3">
            Current: users will be told{" "}
            <strong>
              "{config.updateIntervalValue} {config.updateIntervalUnit.toLowerCase()}"
            </strong>{" "}
            in AI confirmation messages.
          </p>
        </CardContent>
      </Card>

      {/* Scoring weights */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart2 className="h-5 w-5 text-[var(--color-secondary)]" />
            Scoring Dimension Weights
          </CardTitle>
          <CardDescription>
            Set the percentage weight for each dimension used by the AI Assessment Engine.
            All four must add up to exactly 100%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {WEIGHT_FIELDS.map((dim) => (
            <div key={dim.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{dim.label}</Label>
                  <p className="text-xs text-[var(--color-neutral-400)]">{dim.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20 text-center"
                    value={config[dim.key] as number}
                    onChange={(e) => set(dim.key, Number(e.target.value))}
                  />
                  <span className="text-sm text-[var(--color-neutral-500)]">%</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-[var(--color-neutral-100)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                  style={{ width: `${Math.min(config[dim.key] as number, 100)}%` }}
                />
              </div>
            </div>
          ))}

          <div className={`flex items-center justify-between p-3 rounded-lg border ${
            weightsValid
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}>
            <span className="text-sm font-medium">Total Weight</span>
            <span className="text-lg font-bold">{totalWeight.toFixed(1)}%</span>
          </div>

          {!weightsValid && (
            <p className="text-xs text-red-500">
              Weights must add up to exactly 100% before saving.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Minimum passing score */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-[var(--color-secondary)]" />
            Minimum Passing Score
          </CardTitle>
          <CardDescription>
            Startups scoring below this threshold will be classified as Not Ready
            by the AI Assessment Engine.
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
              onChange={(e) => set("minimumPassingScore", Number(e.target.value))}
            />
            <span className="text-sm text-[var(--color-neutral-500)]">/ 100</span>
          </div>
          <p className="text-xs text-[var(--color-neutral-400)]">
            Current threshold: <strong>{config.minimumPassingScore}</strong>. Startups below this
            score are classified as Not Ready and will not be sent to evaluators.
          </p>
        </CardContent>
      </Card>

      {config.updatedAt && (
        <p className="text-xs text-[var(--color-neutral-400)]">
          Last updated: {new Date(config.updatedAt).toLocaleString("en-GB")}
        </p>
      )}

      <Button
        className="w-full gap-2"
        onClick={handleSave}
        disabled={isSaving || !weightsValid}
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