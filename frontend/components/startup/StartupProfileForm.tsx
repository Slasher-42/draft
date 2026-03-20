'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { INDUSTRY_LABELS, type IndustryType } from '@/types/common';
import type { StartupProfile, StartupProfileRequest } from '@/types/startup';

const schema = z.object({
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name is too long'),

  industry: z
    .string()
    .min(1, 'Please select an industry'),

  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  foundedYear: z
    .string()
    .refine((v) => !v || (/^\d{4}$/.test(v) && +v >= 1900 && +v <= new Date().getFullYear()),
      { message: `Enter a valid year between 1900 and ${new Date().getFullYear()}` })
    .optional(),

  teamSize: z
    .string()
    .refine((v) => !v || (+v >= 1 && +v <= 100000),
      { message: 'Team size must be a number greater than 0' })
    .optional(),

  website: z
    .string()
    .regex(/^(https?:\/\/)?.+\..+/, 'Enter a valid website URL (e.g. https://mycompany.com)')
    .optional()
    .or(z.literal('')),

  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),

  fundingNeeded: z
    .string()
    .min(1, 'Funding amount is required')
    .refine((v) => !isNaN(+v) && +v > 0, { message: 'Funding amount must be a number greater than 0' }),
});

type FormData = z.infer<typeof schema>;

interface StartupProfileFormProps {
  existing?: StartupProfile | null;
  onSave: (data: StartupProfileRequest) => Promise<any>;
  isLoading?: boolean;
}

export function StartupProfileForm({ existing, onSave, isLoading }: StartupProfileFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (existing) {
      reset({
        companyName:   existing.companyName,
        industry:      existing.industry,
        description:   existing.description ?? '',
        foundedYear:   existing.foundedYear?.toString() ?? '',
        teamSize:      existing.teamSize?.toString() ?? '',
        website:       existing.website ?? '',
        country:       existing.country ?? '',
        city:          existing.city ?? '',
        fundingNeeded: existing.fundingNeeded.toString(),
      });
    }
  }, [existing, reset]);

  const onSubmit = async (data: FormData) => {
    await onSave({
      companyName:   data.companyName,
      industry:      data.industry as IndustryType,
      description:   data.description,
      foundedYear:   data.foundedYear ? parseInt(data.foundedYear) : undefined,
      teamSize:      data.teamSize ? parseInt(data.teamSize) : undefined,
      website:       data.website || undefined,
      country:       data.country,
      city:          data.city,
      fundingNeeded: parseFloat(data.fundingNeeded),
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Company Name"
          placeholder="Acme Inc."
          error={errors.companyName?.message}
          {...register('companyName')}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300 font-body">Industry</label>
          <select
            className="w-full rounded-lg border border-surface-border bg-surface-card text-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            {...register('industry')}
          >
            <option value="">Select industry</option>
            {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.industry && (
            <p className="text-xs text-danger">{errors.industry.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-300 font-body">Description</label>
        <textarea
          rows={3}
          placeholder="Brief description of your startup..."
          className="w-full rounded-lg border border-surface-border bg-surface-card text-white px-4 py-2.5 text-sm placeholder:text-surface-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Input
          label="Founded Year"
          type="number"
          placeholder="2020"
          error={errors.foundedYear?.message}
          {...register('foundedYear')}
        />
        <Input
          label="Team Size"
          type="number"
          placeholder="10"
          error={errors.teamSize?.message}
          {...register('teamSize')}
        />
        <Input
          label="Funding Needed (USD)"
          type="number"
          placeholder="50000"
          error={errors.fundingNeeded?.message}
          {...register('fundingNeeded')}
        />
      </div>

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

      <Input
        label="Website (optional)"
        type="url"
        placeholder="https://yourcompany.com"
        error={errors.website?.message}
        {...register('website')}
      />

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