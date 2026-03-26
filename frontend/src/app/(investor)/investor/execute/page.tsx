"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { aiService } from "@/services/aiService";
import { investorService } from "@/services/investorService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "react-toastify";
import { ChevronRight, Loader2 } from "lucide-react";

const schema = z.object({
  industry: z.string().min(2, "Select or enter an industry"),
  reasonForInvesting: z
    .string()
    .min(20, "Explain your reason for investing in at least 20 characters"),
  investmentBudget: z.number().min(1, "Enter your investment budget"),
  dreamOfSuccess: z
    .string()
    .min(20, "Describe your vision of success in at least 20 characters"),
  specificCriteria: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const industries = [
  "Fintech",
  "Healthtech",
  "Agritech",
  "Edtech",
  "Logistics",
  "E-commerce",
  "SaaS",
  "Clean Energy",
  "Real Estate",
  "Media & Entertainment",
  "Other",
];

export default function InvestorExecutePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const selectedIndustry = watch("industry");

  const onSubmit = async (data: FormValues) => {
  setIsSubmitting(true);
  try {
    const execRes = await investorService.createExecution({
      industry: data.industry,
      reasonForInvesting: data.reasonForInvesting,
      investmentBudget: data.investmentBudget,
      dreamOfSuccess: data.dreamOfSuccess,
      specificCriteria: data.specificCriteria ?? "",
    });

    const execution = execRes.data.data;

    router.push(`/investor/ai?executionId=${execution.id}`);
  } catch {
    toast.error("Failed to save execution. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
          New Investment Execution
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-1">
          Tell us about your investment goals. After clicking Verify, our AI
          will ask you questions to better understand your investment thesis.
        </p>
      </div>

      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle>Investment Execution Details</CardTitle>
          <CardDescription>
            Be as specific as possible to get the best startup matches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Industry */}
            <div className="space-y-1.5">
              <Label>Industry / Sector</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {industries.map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setValue("industry", ind)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      selectedIndustry === ind
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                        : "bg-white text-[var(--color-neutral-600)] border-[var(--color-border)] hover:border-[var(--color-primary-200)]"
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Or type a custom industry…"
                className={errors.industry ? "border-red-500" : ""}
                {...register("industry")}
              />
              {errors.industry && (
                <p className="text-xs text-red-500">{errors.industry.message}</p>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <Label>Reason for Investing in This Area</Label>
              <Textarea
                placeholder="Why are you interested in this industry? What opportunity do you see?"
                rows={3}
                className={errors.reasonForInvesting ? "border-red-500" : ""}
                {...register("reasonForInvesting")}
              />
              {errors.reasonForInvesting && (
                <p className="text-xs text-red-500">
                  {errors.reasonForInvesting.message}
                </p>
              )}
            </div>

            {/* Budget */}
            <div className="space-y-1.5">
              <Label>Investment Budget (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)] text-sm font-medium">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="500000"
                  className={`pl-7 ${
                    errors.investmentBudget ? "border-red-500" : ""
                  }`}
                  {...register("investmentBudget", { valueAsNumber: true })}
                />
              </div>
              {errors.investmentBudget && (
                <p className="text-xs text-red-500">
                  {errors.investmentBudget.message}
                </p>
              )}
            </div>

            {/* Dream of success */}
            <div className="space-y-1.5">
              <Label>Dream of Success</Label>
              <Textarea
                placeholder="When do you expect returns? What does a successful investment look like for you?"
                rows={3}
                className={errors.dreamOfSuccess ? "border-red-500" : ""}
                {...register("dreamOfSuccess")}
              />
              {errors.dreamOfSuccess && (
                <p className="text-xs text-red-500">
                  {errors.dreamOfSuccess.message}
                </p>
              )}
            </div>

            {/* Specific criteria */}
            <div className="space-y-1.5">
              <Label>
                Specific Criteria{" "}
                <span className="text-[var(--color-neutral-400)] font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                placeholder="Any specific requirements for the startups you want to fund? e.g. team size, revenue stage, geography…"
                rows={3}
                {...register("specificCriteria")}
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting AI Session…
                </>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4" />
                  Verify with AI
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}