"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { Eye, EyeOff, Mail, Lock, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("auth.login");

  const schema = z.object({
    email: z.string().email(t("validation.invalidEmail")),
    password: z.string().min(6, t("validation.passwordMinLength")),
  });

  type FormValues = z.infer<typeof schema>;

  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("reason") === "session_expired";

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err.message || t("invalidCredentials"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-[var(--color-border)]">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold">
          {t("title")}
        </CardTitle>
        <CardDescription>
          {t("subtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {sessionExpired && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="space-y-1.5">
            <Label htmlFor="password">{t("passwordLabel")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-400)]" />
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
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

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs hover:underline"
              style={{ color: "var(--color-primary)" }}
            >
              {t("forgotPassword")}
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                {t("signingIn")}
              </span>
            ) : (
              t("signIn")
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="text-center">
        <p className="w-full text-sm text-[var(--color-neutral-500)]">
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="font-medium hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            {t("createAccount")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
