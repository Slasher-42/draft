'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/context/AuthContext';
import { getDashboardPath } from '@/lib/utils';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

export default function RegisterPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, isLoading, router]);

  return (
    <div className="w-full max-w-md">
      <motion.div
        className="flex flex-col items-center gap-3 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-14 w-14 rounded-2xl bg-brand-500 flex items-center justify-center shadow-glow">
          <span className="text-white font-bold text-2xl font-display">RG</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white font-display">{APP_NAME}</h1>
          <p className="text-surface-muted text-sm font-body mt-1">{APP_TAGLINE}</p>
        </div>
      </motion.div>

      <motion.div
        className="bg-surface-card border border-surface-border rounded-2xl shadow-card p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white font-display">Create your account</h2>
          <p className="text-surface-muted text-sm font-body mt-1">
            Join RG Partners as a Startup or Investor
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-surface-muted font-body mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}