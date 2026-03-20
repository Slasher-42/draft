'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';
import { getDashboardPath } from '@/lib/utils';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

function LoginContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

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
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: '#229163', boxShadow: '0 0 40px rgba(34,145,99,0.25)' }}
        >
          <span className="text-white font-bold text-2xl">RG</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
          <p className="text-sm mt-1" style={{ color: '#4a6080' }}>{APP_TAGLINE}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          backgroundColor: '#111f35',
          border: '1px solid #1e3352',
          borderRadius: '1rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          padding: '2rem',
        }}
      >
        {reason === 'session_expired' && (
          <motion.div
            className="mb-5 text-sm rounded-lg px-4 py-2.5"
            style={{
              backgroundColor: 'rgba(186,117,23,0.1)',
              border: '1px solid rgba(186,117,23,0.25)',
              color: '#EF9F27',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Your session has expired. Please sign in again.
          </motion.div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Welcome back</h2>
          <p className="text-sm mt-1" style={{ color: '#4a6080' }}>Sign in to your account to continue</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm mt-6" style={{ color: '#4a6080' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium transition-colors hover:opacity-80"
            style={{ color: '#44b282' }}>
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}