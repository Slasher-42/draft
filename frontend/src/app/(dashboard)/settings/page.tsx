"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
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
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSaving(true);
    try {
      await userService.changePassword(user!.id, { currentPassword, newPassword });
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to change password. Check your current password."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
          Settings
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          Manage your account security and preferences
        </p>
      </div>

      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[var(--color-secondary)]" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Full Name", value: user?.fullName ?? "—" },
            { label: "Email", value: user?.email ?? "—" },
            { label: "Role", value: user?.role ?? "—" },
            {
              label: "Account Status",
              value: user?.isActive ? "Active" : "Inactive",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex justify-between items-center border-b border-[var(--color-border)] pb-2 last:border-0"
            >
              <span className="text-xs text-[var(--color-neutral-400)]">
                {item.label}
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
            Change Password
          </CardTitle>
          <CardDescription>
            You must enter your current password to set a new one
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
              <Label htmlFor="currentPassword">Current Password</Label>
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
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat new password"
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
                  Changing Password…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Change Password
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
            Sign Out
          </CardTitle>
          <CardDescription>
            You will be redirected to the login page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="gap-2 border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out of Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}