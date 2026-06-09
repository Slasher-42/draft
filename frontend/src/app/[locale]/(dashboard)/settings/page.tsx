"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { userService } from "@/services/userService";
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
import { Loader2, Save, Lock, LogOut, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError(t("errPasswordShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("errPasswordMismatch"));
      return;
    }

    setIsSaving(true);
    try {
      await userService.changePassword(user!.id, { currentPassword, newPassword });
      toast.success(t("toastPasswordChanged"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(
        err.response?.data?.message || t("toastPasswordFailed")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const accountItems = [
    { labelKey: "labelFullName", value: user?.fullName ?? "—" },
    { labelKey: "labelEmail",    value: user?.email ?? "—" },
    { labelKey: "labelRole",     value: user?.role ?? "—" },
    {
      labelKey: "labelStatus",
      value: (user?.enabled ?? user?.isActive) ? t("statusActive") : t("statusInactive"),
    },
  ];

  return (
   <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
          {t("title")}
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          {t("subtitle")}
        </p>
      </div>

      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[var(--color-secondary)]" />
            {t("accountInfoTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {accountItems.map((item) => (
            <div
              key={item.labelKey}
              className="flex justify-between items-center border-b border-[var(--color-border)] pb-2 last:border-0"
            >
              <span className="text-xs text-[var(--color-neutral-400)]">
                {t(item.labelKey as any)}
              </span>
              <span className="text-sm font-medium text-[var(--color-foreground)]">
                {item.value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-[var(--color-secondary)]" />
            {t("changePasswordTitle")}
          </CardTitle>
          <CardDescription>
            {t("changePasswordDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">{t("currentPasswordLabel")}</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">{t("newPasswordLabel")}</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder={t("newPasswordPlaceholder")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{t("confirmPasswordLabel")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t("confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={
                isSaving ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("changingPasswordBtn")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t("changePasswordBtn")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-red-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <LogOut className="h-5 w-5" />
            {t("signOutTitle")}
          </CardTitle>
          <CardDescription>
            {t("signOutDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="gap-2 border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            {t("signOutBtn")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
