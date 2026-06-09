"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "react-toastify";
import { Loader2, Save, Clock, BarChart2, ShieldCheck, Video, Upload, Trash2, Play } from "lucide-react";

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
  heroVideoUrl?: string | null;
}

const INTERVAL_UNITS = ["MINUTES", "HOURS", "DAYS"];

function getWeightFields(t: ReturnType<typeof useTranslations<"admin.settings">>) {
  return [
    { key: "weightFinancialHealth"   as const, label: t("weightFinancialHealth"),   desc: t("weightFinancialHealthDesc") },
    { key: "weightTeamStrength"      as const, label: t("weightTeamStrength"),       desc: t("weightTeamStrengthDesc") },
    { key: "weightMarketPotential"   as const, label: t("weightMarketPotential"),    desc: t("weightMarketPotentialDesc") },
    { key: "weightBusinessViability" as const, label: t("weightBusinessViability"),  desc: t("weightBusinessViabilityDesc") },
  ] as { key: keyof SystemConfig; label: string; desc: string }[];
}

export default function AdminSettingsPage() {
  const t = useTranslations("admin.settings");
  const locale = useLocale();
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isRemovingVideo, setIsRemovingVideo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
      toast.success(t("toastSaved"));
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? t("toastSaveFailed");
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (file: File) => {
    const validTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (!validTypes.includes(file.type)) {
      toast.error(t("toastInvalidVideoType"));
      return;
    }
    if (file.size > 150 * 1024 * 1024) {
      toast.error(t("toastVideoTooLarge"));
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadVideo = async () => {
    if (!selectedFile) return;
    setIsUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await api.post("/api/config/hero-video", formData, {
        headers: { "Content-Type": null as any },
      });
      const updated = res.data?.data ?? res.data;
      setConfig((prev) => prev ? { ...prev, heroVideoUrl: updated.heroVideoUrl } : prev);
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success(t("toastVideoUploaded"));
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t("toastVideoUploadFailed"));
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleRemoveVideo = async () => {
    setIsRemovingVideo(true);
    try {
      await api.delete("/api/config/hero-video");
      setConfig((prev) => prev ? { ...prev, heroVideoUrl: null } : prev);
      toast.success(t("toastVideoRemoved"));
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t("toastVideoRemoveFailed"));
    } finally {
      setIsRemovingVideo(false);
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
        <p className="text-sm text-[var(--color-neutral-500)]">{t("failedToLoad")}</p>
      </div>
    );
  }

  const weightFields = getWeightFields(t);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">{t("title")}</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          {t("subtitle")}
        </p>
      </div>

      {/* Hero background video */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Video className="h-5 w-5 text-[var(--color-secondary)]" />
            {t("heroVideoTitle")}
          </CardTitle>
          <CardDescription>
            {t("heroVideoDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {config.heroVideoUrl && !selectedFile && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-[var(--color-neutral-600)] uppercase tracking-wide">{t("currentVideo")}</p>
              <div className="relative rounded-xl overflow-hidden border border-[var(--color-border)] bg-black aspect-video">
                <video
                  key={config.heroVideoUrl}
                  src={config.heroVideoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/40 rounded-full p-3">
                    <Play className="h-6 w-6 text-white" fill="white" />
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400"
                onClick={handleRemoveVideo}
                disabled={isRemovingVideo}
              >
                {isRemovingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {t("removeVideo")}
              </Button>
            </div>
          )}

          {!selectedFile && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-50)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-primary-300)] hover:bg-[var(--color-neutral-50)]"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFileSelect(f); }}
            >
              <Upload className="h-8 w-8 mx-auto mb-3 text-[var(--color-neutral-400)]" />
              <p className="text-sm font-medium text-[var(--color-neutral-700)]">
                {config.heroVideoUrl ? t("replaceVideo") : t("uploadVideo")}
              </p>
              <p className="text-xs text-[var(--color-neutral-400)] mt-1">
                {t("dropOrClick")}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
              />
            </div>
          )}

          {selectedFile && previewUrl && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-[var(--color-neutral-600)] uppercase tracking-wide">
                {t("previewLabel", { name: selectedFile.name, size: (selectedFile.size / 1024 / 1024).toFixed(1) })}
              </p>
              <div className="rounded-xl overflow-hidden border border-[var(--color-primary-200)] bg-black aspect-video">
                <video src={previewUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                <Button className="gap-2 flex-1" onClick={handleUploadVideo} disabled={isUploadingVideo}>
                  {isUploadingVideo
                    ? <><Loader2 className="h-4 w-4 animate-spin" />{t("uploading")}</>
                    : <><Upload className="h-4 w-4" />{t("uploadVideoBtn")}</>}
                </Button>
                <Button variant="outline" onClick={() => { setSelectedFile(null); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                  {t("cancel")}
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Update interval */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-[var(--color-secondary)]" />
            {t("updateIntervalTitle")}
          </CardTitle>
          <CardDescription>
            {t("updateIntervalDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="intervalValue">{t("intervalValueLabel")}</Label>
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
              <Label>{t("intervalUnitLabel")}</Label>
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
                    {unit === "MINUTES" ? t("unitMinutes") : unit === "HOURS" ? t("unitHours") : t("unitDays")}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--color-neutral-400)] mt-3">
            {t("intervalCurrentHint", { value: config.updateIntervalValue, unit: config.updateIntervalUnit.toLowerCase() })}
          </p>
        </CardContent>
      </Card>

      {/* Scoring weights */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart2 className="h-5 w-5 text-[var(--color-secondary)]" />
            {t("scoringWeightsTitle")}
          </CardTitle>
          <CardDescription>
            {t("scoringWeightsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {weightFields.map((dim) => (
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
            <span className="text-sm font-medium">{t("totalWeight")}</span>
            <span className="text-lg font-bold">{totalWeight.toFixed(1)}%</span>
          </div>

          {!weightsValid && (
            <p className="text-xs text-red-500">
              {t("weightsInvalid")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Minimum passing score */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-[var(--color-secondary)]" />
            {t("minScoreTitle")}
          </CardTitle>
          <CardDescription>
            {t("minScoreDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="minScore">{t("minScoreLabel")}</Label>
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
            {t("minScoreHint", { score: config.minimumPassingScore })}
          </p>
        </CardContent>
      </Card>

      {config.updatedAt && (
        <p className="text-xs text-[var(--color-neutral-400)]">
          {t("lastUpdated", { date: new Date(config.updatedAt).toLocaleString(locale) })}
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
            {t("saving")}
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            {t("saveConfiguration")}
          </>
        )}
      </Button>
    </div>
  );
}
