"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
  Trash2,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

const roleColors: Record<string, string> = {
  STARTUP: "bg-blue-100 text-blue-700",
  INVESTOR: "bg-purple-100 text-purple-700",
  EVALUATOR: "bg-yellow-100 text-yellow-700",
  ADMIN: "bg-[var(--color-primary-100)] text-[var(--color-primary-700)]",
};

export default function UserDetailPage() {
  const t = useTranslations("admin.userDetail");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);

 userService
  .getUserById(id as string)
  .then((user) => setUser(user))
  .catch(() => setUser(null))
  .finally(() => setIsLoading(false));

  const handleActivate = async () => {
    setIsActing(true);
    try {
      await userService.activateUser(id as string);
      setUser((prev) => (prev ? { ...prev, enabled: true, isActive: true } : prev));
      toast.success(t("toastActivated"));
    } catch {
      toast.error(t("toastActivateFailed"));
    } finally {
      setIsActing(false);
    }
  };

  const handleDeactivate = async () => {
    setIsActing(true);
    try {
      await userService.deactivateUser(id as string);
      setUser((prev) => (prev ? { ...prev, enabled: false, isActive: false } : prev));
      toast.success(t("toastDeactivated"));
    } catch {
      toast.error(t("toastDeactivateFailed"));
    } finally {
      setIsActing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("confirmDelete")))
      return;
    setIsActing(true);
    try {
      await userService.deleteUser(id as string);
      toast.success(t("toastDeleted"));
      router.push("/admin/users");
    } catch {
      toast.error(t("toastDeleteFailed"));
      setIsActing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-[var(--color-neutral-400)]" />
        <p className="text-[var(--color-neutral-500)]">{t("userNotFound")}</p>
        <Button variant="outline" onClick={() => router.back()}>
          {t("goBack")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[var(--color-neutral-500)] hover:text-[var(--color-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToUsers")}
      </button>

      {/* Profile card */}
      <Card className="border border-[var(--color-border)]">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {user.fullName?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-bold text-[var(--color-primary-800)]">
                  {user.fullName}
                </h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    roleColors[user.role]
                  }`}
                >
                  {tCommon(`roles.${user.role.toLowerCase()}`)}
                </span>
                <Badge
                  variant={(user.enabled ?? user.isActive) ? "success" : "destructive"}
                >
                  {(user.enabled ?? user.isActive) ? tCommon("status.active") : tCommon("status.inactive")}
                </Badge>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-500)]">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-500)]">
                    <Phone className="h-4 w-4" />
                    {user.phoneNumber}
                  </div>
                )}
                {user.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-500)]">
                    <Calendar className="h-4 w-4" />
                    {t("joined")}{" "}
                    {new Date(user.createdAt).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identity profile */}
      {(user.startupProfile ||
        user.investorProfile ||
        user.evaluatorProfile) && (
        <Card className="border border-[var(--color-border)]">
          <CardHeader>
            <CardTitle>{t("identityProfile")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.startupProfile && (
              <>
                {[
                  {
                    label: t("fields.companyName"),
                    value: user.startupProfile.companyName,
                  },
                  { label: t("fields.industry"), value: user.startupProfile.industry },
                  { label: t("fields.country"), value: user.startupProfile.country },
                  { label: t("fields.city"), value: user.startupProfile.city },
                  { label: t("fields.website"), value: user.startupProfile.website },
                  {
                    label: t("fields.teamSize"),
                    value: user.startupProfile.teamSize?.toString(),
                  },
                  {
                    label: t("fields.foundedYear"),
                    value: user.startupProfile.foundedYear?.toString(),
                  },
                ]
                  .filter((f) => f.value)
                  .map((field) => (
                    <div
                      key={field.label}
                      className="flex justify-between border-b border-[var(--color-border)] pb-2 last:border-0"
                    >
                      <span className="text-xs text-[var(--color-neutral-400)]">
                        {field.label}
                      </span>
                      <span className="text-sm font-medium text-[var(--color-foreground)]">
                        {field.value}
                      </span>
                    </div>
                  ))}
              </>
            )}

            {user.investorProfile && (
              <>
                {[
                  {
                    label: t("fields.organization"),
                    value: user.investorProfile.organizationName,
                  },
                  {
                    label: t("fields.preferredIndustry"),
                    value: user.investorProfile.preferredIndustry,
                  },
                  {
                    label: t("fields.budgetRange"),
                    value: user.investorProfile.investmentBudgetRange,
                  },
                  { label: t("fields.country"), value: user.investorProfile.country },
                  { label: t("fields.city"), value: user.investorProfile.city },
                ]
                  .filter((f) => f.value)
                  .map((field) => (
                    <div
                      key={field.label}
                      className="flex justify-between border-b border-[var(--color-border)] pb-2 last:border-0"
                    >
                      <span className="text-xs text-[var(--color-neutral-400)]">
                        {field.label}
                      </span>
                      <span className="text-sm font-medium text-[var(--color-foreground)]">
                        {field.value}
                      </span>
                    </div>
                  ))}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle>{t("accountActions")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {(user.enabled ?? user.isActive) ? (
            <Button
              variant="outline"
              className="gap-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50"
              onClick={handleDeactivate}
              disabled={isActing}
            >
              <UserX className="h-4 w-4" />
              {t("deactivateAccount")}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="gap-2 border-green-400 text-green-600 hover:bg-green-50"
              onClick={handleActivate}
              disabled={isActing}
            >
              <UserCheck className="h-4 w-4" />
              {t("activateAccount")}
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2 border-red-400 text-red-500 hover:bg-red-50"
            onClick={handleDelete}
            disabled={isActing}
          >
            <Trash2 className="h-4 w-4" />
            {t("deletePermanently")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}