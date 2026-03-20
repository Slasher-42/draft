'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/api';

const schema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name must contain only letters'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),

  phoneNumber: z
    .string()
    .regex(/^\+?[0-9\s\-]{7,20}$/, 'Phone number must contain only digits (e.g. +250 700 000 000)')
    .optional()
    .or(z.literal('')),

  role: z.enum(['STARTUP', 'INVESTOR']),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),

  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'STARTUP' },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await authService.register({
        fullName:    data.fullName,
        email:       data.email,
        password:    data.password,
        phoneNumber: data.phoneNumber,
        role:        data.role,
      });
      router.push('/login?registered=true');
    } catch (err) {
      setError('root', { message: getErrorMessage(err, 'Registration failed') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-300 font-body">I am a</label>
        <div className="grid grid-cols-2 gap-3">
          {(['STARTUP', 'INVESTOR'] as const).map((role) => (
            <label
              key={role}
              className="relative cursor-pointer"
            >
              <input
                type="radio"
                value={role}
                className="peer sr-only"
                {...register('role')}
              />
              <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-surface-border bg-surface-card text-surface-muted text-sm font-medium font-body transition-all peer-checked:border-brand-500 peer-checked:bg-brand-500/10 peer-checked:text-brand-300">
                {role === 'STARTUP' ? '🚀' : '💼'}
                {role === 'STARTUP' ? 'Startup' : 'Investor'}
              </div>
            </label>
          ))}
        </div>
      </div>

      <Input
        label="Full Name"
        type="text"
        placeholder="John Doe"
        leftIcon={<User className="h-4 w-4" />}
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Phone Number (optional)"
        type="tel"
        placeholder="+250 700 000 000"
        leftIcon={<Phone className="h-4 w-4" />}
        error={errors.phoneNumber?.message}
        {...register('phoneNumber')}
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="At least 6 characters"
        leftIcon={<Lock className="h-4 w-4" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-surface-muted hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Repeat your password"
        leftIcon={<Lock className="h-4 w-4" />}
        error={errors.confirm?.message}
        {...register('confirm')}
      />

      {errors.root && (
        <motion.p
          className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-4 py-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {errors.root.message}
        </motion.p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading}
        className="w-full mt-2"
      >
        Create Account
      </Button>
    </motion.form>
  );
}