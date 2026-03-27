"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
  Shield,
  RefreshCw,
} from "lucide-react";

const ROLES = [
  {
    value: "EVALUATOR",
    label: "Evaluator",
    description: "Reviews AI scores and makes final approval decisions on startup executions.",
    icon: ShieldCheck,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    selectedBg: "bg-amber-50",
    selectedBorder: "border-amber-500",
    selectedRing: "ring-amber-500/20",
  },
  {
    value: "ADMIN",
    label: "Admin",
    description: "Full system access — manage users, configure settings, and view all data.",
    icon: Shield,
    color: "text-[var(--color-primary-700)]",
    bg: "bg-[var(--color-primary-50)]",
    border: "border-[var(--color-primary-200)]",
    selectedBg: "bg-[var(--color-primary-50)]",
    selectedBorder: "border-[var(--color-primary)]",
    selectedRing: "ring-[var(--color-primary)]/20",
  },
];

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function AdminCreateUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    temporaryPassword: generatePassword(),
    role: "EVALUATOR" as "EVALUATOR" | "ADMIN",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email address.";
    if (!form.temporaryPassword.trim())
      newErrors.temporaryPassword = "Temporary password is required.";
    else if (form.temporaryPassword.length < 8)
      newErrors.temporaryPassword = "Password must be at least 8 characters.";
    return newErrors;
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await userService.createUser({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        temporaryPassword: form.temporaryPassword,
        role: form.role,
      });
      toast.success(`${form.role === "ADMIN" ? "Admin" : "Evaluator"} account created. Credentials sent via email.`);
      router.push("/admin/users");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to create user. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[var(--color-neutral-500)] hover:text-[var(--color-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </button>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
          Create User Account
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-1">
          Create accounts for Evaluators and Admins. Credentials will be sent to their email automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role selector */}
        <Card className="border border-[var(--color-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[var(--color-neutral-700)]">
              Select Role
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = form.role === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => handleChange("role", role.value)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? `${role.selectedBorder} ${role.selectedBg} ring-4 ${role.selectedRing}`
                      : `${role.border} bg-white hover:${role.selectedBg}`
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                  )}
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${role.bg}`}>
                    <Icon className={`h-5 w-5 ${role.color}`} />
                  </div>
                  <p className="font-semibold text-sm text-[var(--color-primary-800)]">
                    {role.label}
                  </p>
                  <p className="text-xs text-[var(--color-neutral-500)] mt-1 leading-relaxed">
                    {role.description}
                  </p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Personal details */}
        <Card className="border border-[var(--color-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[var(--color-neutral-700)]">
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--color-neutral-700)]">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="e.g. Jean-Pierre Habimana"
                className={`w-full h-10 px-3 rounded-lg border text-sm bg-white outline-none transition-colors
                  focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]
                  ${errors.fullName ? "border-red-400 bg-red-50" : "border-[var(--color-border)]"}`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--color-neutral-700)]">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="e.g. jean@rgpartners.rw"
                className={`w-full h-10 px-3 rounded-lg border text-sm bg-white outline-none transition-colors
                  focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]
                  ${errors.email ? "border-red-400 bg-red-50" : "border-[var(--color-border)]"}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Temporary password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--color-neutral-700)]">
                Temporary Password <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.temporaryPassword}
                    onChange={(e) => handleChange("temporaryPassword", e.target.value)}
                    placeholder="Minimum 8 characters"
                    className={`w-full h-10 px-3 pr-10 rounded-lg border text-sm bg-white outline-none font-mono transition-colors
                      focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]
                      ${errors.temporaryPassword ? "border-red-400 bg-red-50" : "border-[var(--color-border)]"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange("temporaryPassword", generatePassword())}
                  title="Generate a new password"
                  className="h-10 w-10 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-neutral-500)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary-200)] transition-colors bg-white"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              {errors.temporaryPassword && (
                <p className="text-xs text-red-500">{errors.temporaryPassword}</p>
              )}
              <p className="text-xs text-[var(--color-neutral-400)]">
                This password will be emailed to the user. They must change it after first login.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info banner */}
        <div className="flex gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <div className="h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
            i
          </div>
          <p className="text-sm text-blue-700">
            Once created, the system will automatically email the login credentials to{" "}
            <strong>{form.email || "the user"}</strong>. They will be able to log in immediately.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[160px]">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create {form.role === "ADMIN" ? "Admin" : "Evaluator"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}