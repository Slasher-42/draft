"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
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
  Mail,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to send reset email."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-[var(--color-border)]">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold">
          Reset your password
        </CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send reset instructions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="h-12 w-12 rounded-full bg-[var(--color-secondary-50)] flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-[var(--color-secondary)]" />
            </div>
            <p className="font-medium text-[var(--color-primary-800)]">
              Check your inbox
            </p>
            <p className="text-sm text-[var(--color-neutral-500)]">
              We&apos;ve sent password reset instructions to{" "}
              <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-400)]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Sending…
                  </span>
                ) : (
                  "Send Reset Instructions"
                )}
              </Button>
            </form>
          </>
        )}
      </CardContent>

      <CardFooter className="justify-center">
        <Link
          href="/login"
          className="flex items-center gap-1 text-sm hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}