'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useInvestorProfile } from '@/hooks/useInvestorProfile';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { InvestorProfileForm } from '@/components/investor/InvestorProfileForm';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function InvestorProfileEditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { profile, loading, save } = useInvestorProfile(user?.id ?? 0);

  if (loading) return <LoadingSpinner size="md" message="Loading..." className="mt-20" />;

  return (
    <motion.div
      className="flex flex-col gap-8 max-w-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardHeader
        title={profile ? 'Edit Profile' : 'Create Profile'}
        subtitle="Set your investment preferences and organization details"
      />

      <InvestorProfileForm
        existing={profile}
        onSave={async (data) => {
          await save(data);
          router.push('/investor/profile');
        }}
      />
    </motion.div>
  );
}