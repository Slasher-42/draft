"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  AlertTriangle,
  Rocket,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("auth.register");

  const schema = z
    .object({
      fullName: z.string().min(2, t("validation.fullNameRequired")),
      email: z.string().email(t("validation.invalidEmail")),
      phoneNumber: z.string().min(8, t("validation.invalidPhone")),
      password: z.string().min(8, t("validation.passwordMinLength")),
      confirmPassword: z.string(),
      role: z.enum(["STARTUP", "INVESTOR"]),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t("validation.passwordsMustMatch"),
      path: ["confirmPassword"],
    });

  type FormValues = z.infer<typeof schema>;

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "STARTUP" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsLoading(true);
    try {
      await registerUser(
        data.fullName,
        data.email,
        data.password,
        data.phoneNumber,
        data.role
      );
    } catch (err: any) {
      setError(err.message || t("registrationFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { value: "STARTUP",  label: t("startup"),  icon: Rocket,     desc: t("startupDesc")  },
    { value: "INVESTOR", label: t("investor"),  icon: TrendingUp, desc: t("investorDesc") },
  ];

  return (
    <Card className="w-full shadow-lg border-[var(--color-border)]">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role selector */}
          <div className="space-y-1.5">
            <Label>{t("iAmA")}</Label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("role", value as "STARTUP" | "INVESTOR")}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-sm font-medium transition-all",
                    selectedRole === value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-50)] text-[var(--color-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-neutral-600)] hover:border-[var(--color-primary-200)]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                  <span className="text-xs font-normal text-[var(--color-neutral-400)]">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Full name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName">{t("fullNameLabel")}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-400)]" />
              <Input
                id="fullName"
                placeholder={t("fullNamePlaceholder")}
                className={`pl-9 ${errors.fullName ? "border-red-500" : ""}`}
                disabled={isLoading}
                {...register("fullName")}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-400)]" />
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                className={`pl-9 ${errors.email ? "border-red-500" : ""}`}
                disabled={isLoading}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber">{t("phoneLabel")}</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-400)]" />
              <Input
                id="phoneNumber"
                placeholder={t("phonePlaceholder")}
                className={`pl-9 ${errors.phoneNumber ? "border-red-500" : ""}`}
                disabled={isLoading}
                {...register("phoneNumber")}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("passwordLabel")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-400)]" />
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                className={`pl-9 pr-9 ${errors.password ? "border-red-500" : ""}`}
                disabled={isLoading}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">{t("confirmPasswordLabel")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-400)]" />
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder={t("confirmPasswordPlaceholder")}
                className={`pl-9 pr-9 ${errors.confirmPassword ? "border-red-500" : ""}`}
                disabled={isLoading}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                {t("creatingAccount")}
              </span>
            ) : (
              t("createAccount")
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="text-center">
        <p className="w-full text-sm text-[var(--color-neutral-500)]">
          {t("alreadyHaveAccount")}{" "}
          <Link
            href="/login"
            className="font-medium hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            {t("signIn")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
