'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getDashboardPath } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api';
import { APP_NAME } from '@/lib/constants';

function VerifyTwoFactorContent() {
  const { completeTwoFactor } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const user = await completeTwoFactor(email, code);
      router.push(getDashboardPath(user.role));
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid or expired code'));
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="text-sm mt-1" style={{ color: '#4a6080' }}>Two-factor authentication</p>
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
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="h-12 w-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(34,145,99,0.15)', border: '1px solid rgba(34,145,99,0.3)' }}>
            <ShieldCheck className="h-6 w-6" style={{ color: '#44b282' }} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Verify your identity</h2>
            <p className="text-sm mt-1" style={{ color: '#4a6080' }}>
              We sent a 6-digit code to <span className="text-white">{email}</span>
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <Input
            label="Verification Code"
            type="text"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="text-center text-2xl tracking-widest"
          />

          {error && (
            <motion.p
              className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-4 py-2.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full">
            Verify and Sign In
          </Button>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-sm text-center transition-colors hover:opacity-80"
            style={{ color: '#4a6080' }}
          >
            Back to login
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function VerifyTwoFactorPage() {
  return (
    <Suspense>
      <VerifyTwoFactorContent />
    </Suspense>
  );
}