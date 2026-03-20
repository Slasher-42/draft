'use client';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEvaluatorProfile } from '@/hooks/useEvaluatorProfile';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

const schema = z.object({
  department: z
    .string()
    .min(2, 'Department is required')
    .max(100, 'Department name is too long'),

  specialization: z
    .string()
    .max(100, 'Specialization is too long')
    .optional(),

  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
});

type FormData = z.infer<typeof schema>;

export default function EvaluatorProfileEditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { profile, loading, save } = useEvaluatorProfile(user?.id ?? 0);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      department:     profile?.department ?? '',
      specialization: profile?.specialization ?? '',
      country:        profile?.country ?? '',
      city:           profile?.city ?? '',
    },
  });

  if (loading) return <LoadingSpinner size="md" message="Loading..." className="mt-20" />;

  const onSubmit = async (data: FormData) => {
    await save(data);
    router.push('/evaluator/profile');
  };

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardHeader
        title={profile ? 'Edit Profile' : 'Create Profile'}
        subtitle="Fill in your evaluator details"
        actions={
          <Link href="/evaluator/profile">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Evaluator Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input
              label="Department"
              type="text"
              placeholder="e.g. Investment Analysis"
              error={errors.department?.message}
              {...register('department')}
            />
            <Input
              label="Specialization (optional)"
              type="text"
              placeholder="e.g. Technology Startups"
              error={errors.specialization?.message}
              {...register('specialization')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Country (optional)"
                type="text"
                placeholder="e.g. Rwanda"
                error={errors.country?.message}
                {...register('country')}
              />
              <Input
                label="City (optional)"
                type="text"
                placeholder="e.g. Kigali"
                error={errors.city?.message}
                {...register('city')}
              />
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <Link href="/evaluator/profile">
                <Button variant="secondary" type="button">Cancel</Button>
              </Link>
              <Button variant="primary" type="submit" loading={isSubmitting}>
                {profile ? 'Save Changes' : 'Create Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}