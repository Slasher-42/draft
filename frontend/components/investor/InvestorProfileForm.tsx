'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { INDUSTRY_LABELS, type IndustryType } from '@/types/common';
import type { InvestorProfile, InvestorProfileRequest } from '@/types/investor';

const schema = z.object({
  organizationName: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name is too long'),

  preferredIndustry: z
    .string()
    .min(1, 'Please select a preferred industry'),

  investmentBudget: z
    .string()
    .min(1, 'Investment budget is required')
    .refine((v) => !isNaN(+v) && +v > 0, { message: 'Budget must be a number greater than 0' }),

  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
});

type FormData = z.infer<typeof schema>;

interface InvestorProfileFormProps {
  existing?: InvestorProfile | null;
  onSave: (data: InvestorProfileRequest) => Promise<any>;
  isLoading?: boolean;
}

export function InvestorProfileForm({ existing, onSave, isLoading }: InvestorProfileFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (existing) {
      reset({
        organizationName:  existing.organizationName,
        preferredIndustry: existing.preferredIndustry,
        investmentBudget:  existing.investmentBudget.toString(),
        country:           existing.country ?? '',
        city:              existing.city ?? '',
      });
    }
  }, [existing, reset]);

  const onSubmit = async (data: FormData) => {
    await onSave({
      organizationName:  data.organizationName,
      preferredIndustry: data.preferredIndustry as IndustryType,
      investmentBudget:  parseFloat(data.investmentBudget),
      country:           data.country,
      city:              data.city,
    });
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Input
        label="Organization Name"
        placeholder="Venture Capital Ltd."
        error={errors.organizationName?.message}
        {...register('organizationName')}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-300 font-body">
          Preferred Industry
        </label>
        <select
          className="w-full rounded-lg border border-surface-border bg-surface-card text-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          {...register('preferredIndustry')}
        >
          <option value="">Select preferred industry</option>
          {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {errors.preferredIndustry && (
          <p className="text-xs text-danger">{errors.preferredIndustry.message}</p>
        )}
      </div>

      <Input
        label="Investment Budget (USD)"
        type="number"
        placeholder="100000"
        error={errors.investmentBudget?.message}
        {...register('investmentBudget')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Country"
          placeholder="Rwanda"
          error={errors.country?.message}
          {...register('country')}
        />
        <Input
          label="City"
          placeholder="Kigali"
          error={errors.city?.message}
          {...register('city')}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading}
        className="w-full"
      >
        Save Profile
      </Button>
    </motion.form>
  );
}