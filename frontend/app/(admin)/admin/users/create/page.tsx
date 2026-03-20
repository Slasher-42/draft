'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'react-toastify';

const schema = z.object({
  fullName:          z.string().min(2, 'Full name is required'),
  email:             z.string().email('Enter a valid email'),
  temporaryPassword: z.string().min(6, 'Password must be at least 6 characters'),
  role:              z.enum(['EVALUATOR', 'ADMIN']).refine((val) => val !== undefined, { message: 'Select a role' }),
});

type FormData = z.infer<typeof schema>;

export default function AdminCreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await api.post('/api/auth/admin/create-user', data);
      toast.success('User created and credentials sent to their email');
      router.push('/admin/users');
    } catch (err) {
      setError('root', { message: getErrorMessage(err, 'Failed to create user') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardHeader
        title="Create User Account"
        subtitle="Create an Evaluator or Admin account and send credentials by email"
        actions={
          <Link href="/admin/users">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand-400" />
            New User Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 max-w-lg">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Jane Doe"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="user@rgpartners.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Temporary Password"
              type="text"
              placeholder="They will be asked to change this"
              error={errors.temporaryPassword?.message}
              {...register('temporaryPassword')}
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white">Role</label>
              <div className="flex gap-3">
                {(['EVALUATOR', 'ADMIN'] as const).map((r) => (
                  <label key={r}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg border border-surface-border bg-surface cursor-pointer hover:border-brand-500 transition-colors">
                    <input type="radio" value={r} {...register('role')} className="accent-brand-500" />
                    <span className="text-sm text-white">{r === 'EVALUATOR' ? 'Evaluator' : 'Administrator'}</span>
                  </label>
                ))}
              </div>
              {errors.role && <p className="text-xs text-danger">{errors.role.message}</p>}
            </div>

            {errors.root && (
              <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-4 py-2.5">
                {errors.root.message}
              </p>
            )}

            <div className="flex justify-end gap-3 mt-2">
              <Link href="/admin/users">
                <Button variant="secondary" type="button">Cancel</Button>
              </Link>
              <Button variant="primary" type="submit" loading={isLoading}>
                Create Account and Send Email
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}