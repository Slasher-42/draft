"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "react-toastify";
import {
  Loader2,
  Save,
  Video,
  Upload,
  Trash2,
  Play,
  Eye,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Type,
  LayoutDashboard,
  RefreshCw,
  Map,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from "lucide-react";
import { useHomeConfig, DEFAULT_HOME_CONFIG, type HomeConfig } from "@/hooks/useHomeConfig";

// ─── Toggle switch ─────────────────────────────────────────────────────────
function Toggle({
  value,
  onChange,
  label,
  description,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
      <div>
        <p className="text-sm font-medium text-[var(--color-neutral-800)]">{label}</p>
        {description && (
          <p className="text-xs text-[var(--color-neutral-400)] mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="flex-shrink-0 transition-colors"
        style={{ color: value ? "var(--color-secondary)" : "var(--color-neutral-300)" }}
      >
        {value ? (
          <ToggleRight className="h-8 w-8" />
        ) : (
          <ToggleLeft className="h-8 w-8" />
        )}
      </button>
    </div>
  );
}

// ─── Field row ─────────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && (
        <p className="text-xs text-[var(--color-neutral-400)]">{hint}</p>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function HomeControllerPage() {
  const { config, saveConfig, resetConfig } = useHomeConfig();
  const [form, setForm] = useState<HomeConfig>(config);
  const [isSaving, setIsSaving] = useState(false);

  // Video upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isRemovingVideo, setIsRemovingVideo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [liveVideoUrl, setLiveVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Sync form when config loads from localStorage
  useEffect(() => {
    setForm(config);
  }, [config]);

  // Load current video URL from backend
  useEffect(() => {
    api
      .get("/api/config")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setLiveVideoUrl(data?.heroVideoUrl ?? null);
        setForm((prev) => ({ ...prev, heroVideoUrl: data?.heroVideoUrl ?? prev.heroVideoUrl }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const set = <K extends keyof HomeConfig>(key: K, value: HomeConfig[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── Save all settings ──────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      saveConfig({ ...form, heroVideoUrl: liveVideoUrl });
      toast.success("Homepage settings saved successfully.");
    } catch {
      toast.error("Failed to save homepage settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Reset to defaults ──────────────────────────────────────────────────
  const handleReset = () => {
    resetConfig();
    setForm({ ...DEFAULT_HOME_CONFIG, heroVideoUrl: liveVideoUrl });
    toast.info("Homepage settings reset to defaults.");
  };

  // ── Video upload ───────────────────────────────────────────────────────
  const handleFileSelect = (file: File) => {
    const validTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload an MP4, WebM, or OGG video file.");
      return;
    }
    if (file.size > 150 * 1024 * 1024) {
      toast.error("Video must be smaller than 150 MB.");
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
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = res.data?.data ?? res.data;
      const newUrl = updated.heroVideoUrl ?? null;
      setLiveVideoUrl(newUrl);
      saveConfig({ heroVideoUrl: newUrl });
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Hero video uploaded successfully.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to upload video.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleRemoveVideo = async () => {
    setIsRemovingVideo(true);
    try {
      await api.delete("/api/config/hero-video");
      setLiveVideoUrl(null);
      saveConfig({ heroVideoUrl: null });
      toast.success("Hero video removed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to remove video.");
    } finally {
      setIsRemovingVideo(false);
    }
  };

  // ── Map preview URL ────────────────────────────────────────────────────
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${
    form.locationLng - 0.05
  },${form.locationLat - 0.05},${form.locationLng + 0.05},${
    form.locationLat + 0.05
  }&layer=mapnik&marker=${form.locationLat},${form.locationLng}`;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary-800)] flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-[var(--color-secondary)]" />
            Home Controller
          </h2>
          <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
            Customize every aspect of the public-facing homepage
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => window.open("/home", "_blank")}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-[var(--color-neutral-500)]"
            onClick={handleReset}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* ── 1. Hero content ──────────────────────────────────────────────── */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Type className="h-5 w-5 text-[var(--color-secondary)]" />
            Hero Content
          </CardTitle>
          <CardDescription>
            The main text and call-to-action buttons shown in the top hero section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Hero Title">
            <textarea
              rows={2}
              value={form.heroTitle}
              onChange={(e) => set("heroTitle", e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-300)]"
            />
          </Field>
          <Field label="Hero Subtitle" hint="Shown below the title in a smaller size.">
            <textarea
              rows={2}
              value={form.heroSubtitle}
              onChange={(e) => set("heroSubtitle", e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-300)]"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Primary CTA Text" hint='e.g. "Get Started"'>
              <Input
                value={form.ctaPrimaryText}
                onChange={(e) => set("ctaPrimaryText", e.target.value)}
              />
            </Field>
            <Field label="Secondary CTA Text" hint='e.g. "Learn More"'>
              <Input
                value={form.ctaSecondaryText}
                onChange={(e) => set("ctaSecondaryText", e.target.value)}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Background video ──────────────────────────────────────────── */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Video className="h-5 w-5 text-[var(--color-secondary)]" />
            Background Video
          </CardTitle>
          <CardDescription>
            Upload a loopable video that plays behind the hero section.
            Recommended: MP4, 1920×1080, under 50 MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current video preview */}
          {liveVideoUrl && !selectedFile && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-[var(--color-neutral-600)] uppercase tracking-wide">
                Current Video
              </p>
              <div className="relative rounded-xl overflow-hidden border border-[var(--color-border)] bg-black aspect-video">
                <video
                  key={liveVideoUrl}
                  src={liveVideoUrl}
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
                {isRemovingVideo ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Remove Video
              </Button>
            </div>
          )}

          {/* Drop zone */}
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
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFileSelect(f);
              }}
            >
              <Upload className="h-8 w-8 mx-auto mb-3 text-[var(--color-neutral-400)]" />
              <p className="text-sm font-medium text-[var(--color-neutral-700)]">
                {liveVideoUrl ? "Replace video" : "Upload a background video"}
              </p>
              <p className="text-xs text-[var(--color-neutral-400)] mt-1">
                Drag & drop or click to browse · MP4, WebM, OGG · Max 150 MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
            </div>
          )}

          {/* Preview + upload */}
          {selectedFile && previewUrl && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-[var(--color-neutral-600)] uppercase tracking-wide">
                Preview — {selectedFile.name} (
                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
              </p>
              <div className="rounded-xl overflow-hidden border border-[var(--color-primary-200)] bg-black aspect-video">
                <video
                  src={previewUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="gap-2 flex-1"
                  onClick={handleUploadVideo}
                  disabled={isUploadingVideo}
                >
                  {isUploadingVideo ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Video
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── 3. Contact information ───────────────────────────────────────── */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-5 w-5 text-[var(--color-secondary)]" />
            Contact Information
          </CardTitle>
          <CardDescription>
            Contact details displayed in the Contact section of the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Email Address">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-400)]" />
              <Input
                type="email"
                className="pl-9"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                placeholder="contact@rgpartners.com"
              />
            </div>
          </Field>
          <Field label="Phone Number">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-400)]" />
              <Input
                type="tel"
                className="pl-9"
                value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
                placeholder="+250 788 000 000"
              />
            </div>
          </Field>
          <Field label="Physical Address">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-400)]" />
              <Input
                className="pl-9"
                value={form.contactAddress}
                onChange={(e) => set("contactAddress", e.target.value)}
                placeholder="Kigali, Rwanda"
              />
            </div>
          </Field>
        </CardContent>
      </Card>

      {/* ── 4. Location & map ────────────────────────────────────────────── */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Map className="h-5 w-5 text-[var(--color-secondary)]" />
            Location & Map
          </CardTitle>
          <CardDescription>
            GPS coordinates pinned on an OpenStreetMap embed shown on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Location Label" hint="Friendly name shown above the map.">
            <Input
              value={form.locationLabel}
              onChange={(e) => set("locationLabel", e.target.value)}
              placeholder="RG Partners HQ — Kigali, Rwanda"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude" hint="e.g. -1.9441">
              <Input
                type="number"
                step="0.0001"
                value={form.locationLat}
                onChange={(e) => set("locationLat", parseFloat(e.target.value) || 0)}
              />
            </Field>
            <Field label="Longitude" hint="e.g. 30.0619">
              <Input
                type="number"
                step="0.0001"
                value={form.locationLng}
                onChange={(e) => set("locationLng", parseFloat(e.target.value) || 0)}
              />
            </Field>
          </div>

          {/* Live map preview */}
          <div>
            <p className="text-xs font-medium text-[var(--color-neutral-600)] uppercase tracking-wide mb-2">
              Map Preview
            </p>
            <div className="rounded-xl overflow-hidden border border-[var(--color-border)] shadow-sm">
              <div
                className="px-4 py-2.5 flex items-center gap-2 text-xs"
                style={{ backgroundColor: "#1e293b", color: "#94a3b8" }}
              >
                <MapPin className="h-3.5 w-3.5" />
                {form.locationLabel}
              </div>
              <iframe
                src={mapSrc}
                title="Location preview"
                width="100%"
                height="260"
                style={{ border: 0, display: "block" }}
                loading="lazy"
              />
            </div>
            <p className="text-xs text-[var(--color-neutral-400)] mt-2">
              Map updates after you save. Powered by OpenStreetMap.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── 5. Animation settings ─────────────────────────────────────────── */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-[var(--color-secondary)]" />
            Animation Settings
          </CardTitle>
          <CardDescription>
            Control motion effects, scroll reveals, and animated counters on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Toggle
            value={form.animationsEnabled}
            onChange={(v) => set("animationsEnabled", v)}
            label="Enable Animations"
            description="Scroll-reveal effects, hero entrance, animated number counters."
          />
        </CardContent>
      </Card>

      {/* ── 6. Section visibility ─────────────────────────────────────────── */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-5 w-5 text-[var(--color-secondary)]" />
            Section Visibility
          </CardTitle>
          <CardDescription>
            Toggle which sections appear on the public homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Toggle
            value={form.showStats}
            onChange={(v) => set("showStats", v)}
            label="Stats Bar"
            description="Investor count, startup count, and platform metrics."
          />
          <Toggle
            value={form.showInvestors}
            onChange={(v) => set("showInvestors", v)}
            label="Investors Section"
            description="Grid of investor profile cards."
          />
          <Toggle
            value={form.showStartups}
            onChange={(v) => set("showStartups", v)}
            label="Startups Section"
            description="Grid of startup profile cards."
          />
          <Toggle
            value={form.showContact}
            onChange={(v) => set("showContact", v)}
            label="Contact Section"
            description="Email, phone, address and CTA buttons."
          />
          <Toggle
            value={form.showMap}
            onChange={(v) => set("showMap", v)}
            label="Map Embed"
            description="OpenStreetMap location pin (requires Contact section to be visible)."
          />
        </CardContent>
      </Card>

      {/* ── Save button ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-8">
        <Button
          className="flex-1 gap-2"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Homepage Settings
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => window.open("/home", "_blank")}
        >
          <ExternalLink className="h-4 w-4" />
          Open Homepage
        </Button>
      </div>
    </div>
  );
}
