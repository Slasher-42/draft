"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { startupService } from "@/services/startupService";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { ChevronRight, Loader2 } from "lucide-react";

const schema = z.object({
  companySize: z.string().min(1, "Select your company stage"),
  problemStatement: z.string().min(30, "Describe the problem in at least 30 characters"),
  businessModel: z.string().min(20, "Describe your business model"),
  targetMarket: z.string().min(10, "Describe your target market"),
  teamDetails: z.string().min(20, "Describe your team"),
  financialDetails: z.string().min(20, "Describe your financials"),
  fundingNeeded: z.number().min(1, "Enter the funding amount"),
});

type FormValues = z.infer<typeof schema>;

const companySizes = [
  { value: "MICRO",      label: "Micro (1–10 employees)",      suggested: 50000     },
  { value: "SMALL",      label: "Small (11–50 employees)",     suggested: 250000    },
  { value: "MEDIUM",     label: "Medium (51–200 employees)",   suggested: 1500000   },
  { value: "LARGE",      label: "Large (201–500 employees)",   suggested: 10000000  },
  { value: "ENTERPRISE", label: "Enterprise (500+ employees)", suggested: 50000000  },
];
export default function StartupExecutePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const res = await startupService.createExecution({
        targetCompanySize: data.companySize,
        problemStatement: data.problemStatement,
        businessModel: data.businessModel,
        targetMarket: data.targetMarket,
        teamDetails: data.teamDetails,
        annualRevenue: 0,
        monthlyBurnRate: 0,
        fundingNeeded: data.fundingNeeded,
      });

      const executionId = res.data.data.id;
      router.push(`/startup/ai?executionId=${executionId}`);
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
          New Execution
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-1">
          Fill in your startup details. After clicking Verify, our AI will have
          a short conversation with you to better understand your venture.
        </p>
      </div>

      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle>Startup Execution Details</CardTitle>
          <CardDescription>All fields are required. Be as detailed as possible.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label>Company Stage</Label>
              <Select
                onValueChange={(v) => {
                  setValue("companySize", v);
                  setSelectedSize(v);
                  const size = companySizes.find((s) => s.value === v);
                  if (size) setValue("fundingNeeded", size.suggested);
                }}
              >
                <SelectTrigger className={errors.companySize ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select your stage" />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.companySize && <p className="text-xs text-red-500">{errors.companySize.message}</p>}
              {selectedSize && (
                <p className="text-xs text-[var(--color-primary-600)] bg-[var(--color-primary-50)] px-3 py-1.5 rounded-md">
                  Suggested funding for this stage: ${companySizes.find((s) => s.value === selectedSize)?.suggested?.toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Problem You Are Solving</Label>
              <Textarea
                placeholder="Describe the problem your startup addresses…"
                rows={3}
                className={errors.problemStatement ? "border-red-500" : ""}
                {...register("problemStatement")}
              />
              {errors.problemStatement && <p className="text-xs text-red-500">{errors.problemStatement.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Business Model</Label>
              <Textarea
                placeholder="How does your startup make money? Describe your revenue model…"
                rows={3}
                className={errors.businessModel ? "border-red-500" : ""}
                {...register("businessModel")}
              />
              {errors.businessModel && <p className="text-xs text-red-500">{errors.businessModel.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Target Market</Label>
              <Input
                placeholder="e.g. SMEs in East Africa, B2B SaaS for healthcare…"
                className={errors.targetMarket ? "border-red-500" : ""}
                {...register("targetMarket")}
              />
              {errors.targetMarket && <p className="text-xs text-red-500">{errors.targetMarket.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Team Details</Label>
              <Textarea
                placeholder="Describe your founding team, key members, and expertise…"
                rows={3}
                className={errors.teamDetails ? "border-red-500" : ""}
                {...register("teamDetails")}
              />
              {errors.teamDetails && <p className="text-xs text-red-500">{errors.teamDetails.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Financial Details</Label>
              <Textarea
                placeholder="Current revenue, burn rate, projections…"
                rows={3}
                className={errors.financialDetails ? "border-red-500" : ""}
                {...register("financialDetails")}
              />
              {errors.financialDetails && <p className="text-xs text-red-500">{errors.financialDetails.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Funding Needed (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)] text-sm font-medium">$</span>
                <Input
                  type="number"
                  placeholder="500000"
                  className={`pl-7 ${errors.fundingNeeded ? "border-red-500" : ""}`}
                  {...register("fundingNeeded", { valueAsNumber: true })}
                />
              </div>
              {errors.fundingNeeded && <p className="text-xs text-red-500">{errors.fundingNeeded.message}</p>}
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</>
              ) : (
                <><ChevronRight className="h-4 w-4" />Verify with AI</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}