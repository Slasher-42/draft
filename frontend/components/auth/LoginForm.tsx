'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getDashboardPath } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api';

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { login, setUserFromTrustedLogin } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const stepOne = await login(data.email, data.password);

      if (!stepOne.requiresTwoFactor) {
        authService.storeTrustedLoginResult(stepOne);
        const user = await setUserFromTrustedLogin(stepOne);
        router.push(getDashboardPath(user.role));
      } else {
        await authService.sendTwoFactorCode(data.email);
        router.push(`/verify-2fa?email=${encodeURIComponent(data.email)}`);
      }
    } catch (err) {
      setError('root', { message: getErrorMessage(err, 'Invalid email or password') });
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
      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Enter your password"
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

      {errors.root && (
        <motion.p
          className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-4 py-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {errors.root.message}
        </motion.p>
      )}

      <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full">
        Sign In
      </Button>
    </motion.form>
  );
}