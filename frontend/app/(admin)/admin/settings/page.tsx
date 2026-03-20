'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Settings, Clock, BarChart2 } from 'lucide-react';
import { api } from '@/lib/api';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@/lib/api';

const schema = z.object({
  updateIntervalValue:     z.number().min(1, 'Must be at least 1'),
  updateIntervalUnit:      z.enum(['MINUTES', 'HOURS', 'DAYS']),
  weightFinancialHealth:   z.number().min(0).max(100),
  weightTeamStrength:      z.number().min(0).max(100),
  weightMarketPotential:   z.number().min(0).max(100),
  weightBusinessViability: z.number().min(0).max(100),
  minimumPassingScore:     z.number().min(0).max(100),
});

type FormData = {
  updateIntervalValue:     number;
  updateIntervalUnit:      'MINUTES' | 'HOURS' | 'DAYS';
  weightFinancialHealth:   number;
  weightTeamStrength:      number;
  weightMarketPotential:   number;
  weightBusinessViability: number;
  minimumPassingScore:     number;
};

export default function AdminSystemSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [weightTotal, setWeightTotal] = useState(100);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      updateIntervalValue:     42,
      updateIntervalUnit:      'HOURS',
      weightFinancialHealth:   25,
      weightTeamStrength:      25,
      weightMarketPotential:   25,
      weightBusinessViability: 25,
      minimumPassingScore:     60,
    },
  });

  const weights = watch([
    'weightFinancialHealth',
    'weightTeamStrength',
    'weightMarketPotential',
    'weightBusinessViability',
  ]);

  useEffect(() => {
    const total = weights.reduce((sum, w) => sum + (Number(w) || 0), 0);
    setWeightTotal(Math.round(total * 100) / 100);
  }, [weights]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/api/config');
        const config = res.data.data;
        reset({
          updateIntervalValue:     config.updateIntervalValue,
          updateIntervalUnit:      config.updateIntervalUnit,
          weightFinancialHealth:   config.weightFinancialHealth,
          weightTeamStrength:      config.weightTeamStrength,
          weightMarketPotential:   config.weightMarketPotential,
          weightBusinessViability: config.weightBusinessViability,
          minimumPassingScore:     config.minimumPassingScore,
        });
      } catch {
        toast.error('Failed to load system configuration');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    const total =
      data.weightFinancialHealth +
      data.weightTeamStrength +
      data.weightMarketPotential +
      data.weightBusinessViability;

    if (Math.abs(total - 100) > 0.01) {
      setError('root' as any, {
        message: 'The four scoring weights must add up to exactly 100',
      });
      return;
    }

    try {
      await api.put('/api/config', data);
      toast.success('System configuration saved successfully');
    } catch (err) {
      setError('root' as any, {
        message: getErrorMessage(err, 'Failed to save configuration'),
      });
    }
  };

  if (loading) return <LoadingSpinner size="md" message="Loading configuration..." className="mt-20" />;

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardHeader
        title="System Settings"
        subtitle="Configure the update interval and AI scoring weights"
      />

      <form onSubmit={handleSubmit(onSubmit as any)} className="flex flex-col gap-6">

        {/* Update Interval */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-400" />
              Update Interval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-surface-muted mb-5">
              After this interval, startups and investors are notified about their execution status.
            </p>
            <div className="flex gap-4 max-w-sm">
              <div className="flex-1">
                <Input
                  label="Value"
                  type="number"
                  min={1}
                  error={errors.updateIntervalValue?.message}
                  {...register('updateIntervalValue', { valueAsNumber: true })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-white">Unit</label>
                <select
                  {...register('updateIntervalUnit')}
                  className="px-3 py-2.5 rounded-lg bg-surface border border-surface-border text-white text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="MINUTES">Minutes</option>
                  <option value="HOURS">Hours</option>
                  <option value="DAYS">Days</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scoring Weights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-brand-400" />
              AI Scoring Weights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-surface-muted mb-2">
              Set the weight for each scoring dimension. They must add up to exactly 100.
            </p>
            <p
              className={`text-sm font-medium mb-5 ${
                Math.abs(weightTotal - 100) < 0.01 ? 'text-success' : 'text-danger'
              }`}
            >
              Current total: {weightTotal}%{' '}
              {Math.abs(weightTotal - 100) < 0.01 ? '✓' : '— must equal 100'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg">
              <Input
                label="Financial Health (%)"
                type="number"
                min={0}
                max={100}
                error={errors.weightFinancialHealth?.message}
                {...register('weightFinancialHealth', { valueAsNumber: true })}
              />
              <Input
                label="Team Strength (%)"
                type="number"
                min={0}
                max={100}
                error={errors.weightTeamStrength?.message}
                {...register('weightTeamStrength', { valueAsNumber: true })}
              />
              <Input
                label="Market Potential (%)"
                type="number"
                min={0}
                max={100}
                error={errors.weightMarketPotential?.message}
                {...register('weightMarketPotential', { valueAsNumber: true })}
              />
              <Input
                label="Business Viability (%)"
                type="number"
                min={0}
                max={100}
                error={errors.weightBusinessViability?.message}
                {...register('weightBusinessViability', { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Minimum Passing Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-brand-400" />
              Minimum Passing Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-surface-muted mb-5">
              Startups scoring below this threshold will be classified as Not Ready.
            </p>
            <div className="max-w-xs">
              <Input
                label="Minimum Score (out of 100)"
                type="number"
                min={0}
                max={100}
                error={errors.minimumPassingScore?.message}
                {...register('minimumPassingScore', { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Root error */}
        {(errors as any).root && (
          <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-4 py-2.5">
            {(errors as any).root.message}
          </p>
        )}

        <div className="flex justify-end">
          <Button variant="primary" type="submit" loading={isSubmitting}>
            Save Configuration
          </Button>
        </div>
      </form>
    </motion.div>
  );
}