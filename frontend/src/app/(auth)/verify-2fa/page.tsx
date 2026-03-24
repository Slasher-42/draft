"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";

const roleRedirectMap: Record<string, string> = {
  STARTUP: "/startup/executions",
  INVESTOR: "/investor/executions",
  EVALUATOR: "/evaluator/dashboard",
  ADMIN: "/admin/dashboard",
};

function TwoFAForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const router = useRouter();
  const { updateUser } = useAuth();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.post("/api/auth/2fa/verify", { email, code });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      updateUser(user);
      toast.success("Verification successful!");
      router.push(roleRedirectMap[user.role] || "/");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Invalid or expired code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/api/auth/2fa/send", { email });
      toast.success("New code sent to your email.");
    } catch {
      toast.error("Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-[var(--color-border)]">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto h-12 w-12 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center mb-3">
          <ShieldCheck className="h-6 w-6 text-[var(--color-primary)]" />
        </div>
        <CardTitle className="text-2xl font-bold">
          Two-Factor Verification
        </CardTitle>
        <CardDescription>
          We sent a verification code to{" "}
          <span className="font-medium text-[var(--color-foreground)]">
            {email}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={8}
              placeholder="Enter code"
              className="text-center text-lg tracking-[0.5em] font-mono"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, ""))
              }
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Verifying…
              </span>
            ) : (
              "Verify & Continue"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--color-neutral-500)]">
          Didn&apos;t receive a code?{" "}
          <button
            onClick={handleResend}
            disabled={resending}
            className="font-medium hover:underline disabled:opacity-50"
            style={{ color: "var(--color-primary)" }}
          >
            {resending ? "Resending…" : "Resend code"}
          </button>
        </p>
      </CardContent>
    </Card>
  );
}

export default function TwoFAPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
        </div>
      }
    >
      <TwoFAForm />
    </Suspense>
  );
}