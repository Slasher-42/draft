'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { InvestorExecution, InvestorExecutionRequest } from '@/types/execution';

const schema = z.object({
  preferredIndustry:      z.string().min(2, 'Preferred industry is required'),
  investmentReason:       z.string().min(10, 'Investment reason must be at least 10 characters'),
  investmentBudget:       z.string().refine((v) => !isNaN(+v) && +v > 0, { message: 'Budget must be greater than 0' }),
  expectedReturnTimeline: z.string().min(2, 'Expected return timeline is required'),
  successCriteria:        z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface InvestorExecutionFormProps {
  existing?: InvestorExecution | null;
  onSubmit: (data: InvestorExecutionRequest) => Promise<void>;
}

export function InvestorExecutionForm({ existing, onSubmit }: InvestorExecutionFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (existing) {
      reset({
        preferredIndustry:      existing.preferredIndustry,
        investmentReason:       existing.investmentReason,
        investmentBudget:       existing.investmentBudget.toString(),
        expectedReturnTimeline: existing.expectedReturnTimeline,
        successCriteria:        existing.successCriteria ?? '',
      });
    }
  }, [existing, reset]);

  const handleFormSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await onSubmit({
        preferredIndustry:      data.preferredIndustry,
        investmentReason:       data.investmentReason,
        investmentBudget:       parseFloat(data.investmentBudget),
        expectedReturnTimeline: data.expectedReturnTimeline,
        successCriteria:        data.successCriteria || undefined,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Preferred Industry"
          placeholder="e.g. Fintech, Agritech, Health"
          error={errors.preferredIndustry?.message}
          {...register('preferredIndustry')}
        />
        <Input
          label="Investment Budget (USD)"
          type="number"
          placeholder="500000"
          error={errors.investmentBudget?.message}
          {...register('investmentBudget')}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white">Investment Reason</label>
        <textarea
          {...register('investmentReason')}
          rows={3}
          placeholder="Why are you interested in investing in this industry?"
          className="w-full rounded-lg border border-surface-border bg-surface-card text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
        {errors.investmentReason && (
          <p className="text-xs text-red-400">{errors.investmentReason.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white">Expected Return Timeline</label>
        <select
          {...register('expectedReturnTimeline')}
          className="w-full rounded-lg border border-surface-border bg-surface-card text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          <option value="">Select timeline</option>
          <option value="Less than 1 year">Less than 1 year</option>
          <option value="1–2 years">1–2 years</option>
          <option value="3–5 years">3–5 years</option>
          <option value="5+ years">5+ years</option>
        </select>
        {errors.expectedReturnTimeline && (
          <p className="text-xs text-red-400">{errors.expectedReturnTimeline.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white">Success Criteria <span className="text-surface-muted text-xs">(optional)</span></label>
        <textarea
          {...register('successCriteria')}
          rows={3}
          placeholder="Any specific criteria you have for startups you want to fund?"
          className="w-full rounded-lg border border-surface-border bg-surface-card text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
      </div>

      <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full">
        Verify
      </Button>
    </motion.form>
  );
}