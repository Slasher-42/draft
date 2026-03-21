'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { COMPANY_SIZE_LABELS, type CompanySize, type StartupExecution, type StartupExecutionRequest } from '@/types/execution';

const schema = z.object({
  targetCompanySize: z.string().min(1, 'Please select a company size'),
  problemStatement:  z.string().min(10, 'Problem statement must be at least 10 characters'),
  businessModel:     z.string().min(10, 'Business model must be at least 10 characters'),
  targetMarket:      z.string().min(5, 'Target market must be at least 5 characters'),
  teamDetails:       z.string().min(10, 'Team details must be at least 10 characters'),
  annualRevenue:     z.string().refine((v) => !isNaN(+v) && +v >= 0, { message: 'Enter a valid amount (0 if pre-revenue)' }),
  monthlyBurnRate:   z.string().refine((v) => !isNaN(+v) && +v >= 0, { message: 'Enter a valid amount' }),
  fundingNeeded:     z.string().refine((v) => !isNaN(+v) && +v > 0, { message: 'Funding needed must be greater than 0' }),
});

type FormData = z.infer<typeof schema>;

const FUNDING_SUGGESTIONS: Record<CompanySize, string> = {
  MICRO:      '$10,000 – $100,000',
  SMALL:      '$100,000 – $500,000',
  MEDIUM:     '$500,000 – $2,000,000',
  LARGE:      '$2,000,000 – $10,000,000',
  ENTERPRISE: '$10,000,000+',
};

interface StartupExecutionFormProps {
  existing?: StartupExecution | null;
  onSubmit: (data: StartupExecutionRequest) => Promise<void>;
}

export function StartupExecutionForm({ existing, onSubmit }: StartupExecutionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<CompanySize | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watchedSize = watch('targetCompanySize') as CompanySize;

  useEffect(() => {
    if (watchedSize) setSelectedSize(watchedSize as CompanySize);
  }, [watchedSize]);

  useEffect(() => {
    if (existing) {
      reset({
        targetCompanySize: existing.targetCompanySize,
        problemStatement:  existing.problemStatement,
        businessModel:     existing.businessModel,
        targetMarket:      existing.targetMarket,
        teamDetails:       existing.teamDetails,
        annualRevenue:     existing.annualRevenue.toString(),
        monthlyBurnRate:   existing.monthlyBurnRate.toString(),
        fundingNeeded:     existing.fundingNeeded.toString(),
      });
      setSelectedSize(existing.targetCompanySize);
    }
  }, [existing, reset]);

  const handleFormSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await onSubmit({
        targetCompanySize: data.targetCompanySize as CompanySize,
        problemStatement:  data.problemStatement,
        businessModel:     data.businessModel,
        targetMarket:      data.targetMarket,
        teamDetails:       data.teamDetails,
        annualRevenue:     parseFloat(data.annualRevenue),
        monthlyBurnRate:   parseFloat(data.monthlyBurnRate),
        fundingNeeded:     parseFloat(data.fundingNeeded),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white">Target Company Size</label>
        <select
          {...register('targetCompanySize')}
          className="w-full rounded-lg border border-surface-border bg-surface-card text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          <option value="">Select company size</option>
          {(Object.keys(COMPANY_SIZE_LABELS) as CompanySize[]).map((size) => (
            <option key={size} value={size}>{COMPANY_SIZE_LABELS[size]}</option>
          ))}
        </select>
        {errors.targetCompanySize && (
          <p className="text-xs text-red-400">{errors.targetCompanySize.message}</p>
        )}
        {selectedSize && (
          <p className="text-xs text-brand-400 mt-1">
            Suggested funding range: <span className="font-semibold">{FUNDING_SUGGESTIONS[selectedSize]}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white">Problem Statement</label>
        <textarea
          {...register('problemStatement')}
          rows={3}
          placeholder="What problem does your startup solve?"
          className="w-full rounded-lg border border-surface-border bg-surface-card text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
        {errors.problemStatement && (
          <p className="text-xs text-red-400">{errors.problemStatement.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white">Business Model</label>
        <textarea
          {...register('businessModel')}
          rows={3}
          placeholder="How does your startup make money?"
          className="w-full rounded-lg border border-surface-border bg-surface-card text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
        {errors.businessModel && (
          <p className="text-xs text-red-400">{errors.businessModel.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white">Target Market</label>
        <textarea
          {...register('targetMarket')}
          rows={2}
          placeholder="Who are your target customers?"
          className="w-full rounded-lg border border-surface-border bg-surface-card text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
        {errors.targetMarket && (
          <p className="text-xs text-red-400">{errors.targetMarket.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white">Team Details</label>
        <textarea
          {...register('teamDetails')}
          rows={3}
          placeholder="Describe your team — roles, experience, and strengths"
          className="w-full rounded-lg border border-surface-border bg-surface-card text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
        {errors.teamDetails && (
          <p className="text-xs text-red-400">{errors.teamDetails.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Input
          label="Annual Revenue (USD)"
          type="number"
          placeholder="0"
          error={errors.annualRevenue?.message}
          {...register('annualRevenue')}
        />
        <Input
          label="Monthly Burn Rate (USD)"
          type="number"
          placeholder="5000"
          error={errors.monthlyBurnRate?.message}
          {...register('monthlyBurnRate')}
        />
        <Input
          label="Funding Needed (USD)"
          type="number"
          placeholder="100000"
          error={errors.fundingNeeded?.message}
          {...register('fundingNeeded')}
        />
      </div>

      <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full">
        Verify
      </Button>
    </motion.form>
  );
}