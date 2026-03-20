'use client';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useInvestorProfile } from '@/hooks/useInvestorProfile';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { InvestorProfileCard } from '@/components/investor/InvestorProfileCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function InvestorProfilePage() {
  const { user } = useAuth();
  const { profile, loading, error } = useInvestorProfile(user?.id ?? 0);

  if (loading) return <LoadingSpinner size="md" message="Loading profile..." className="mt-20" />;
  if (error)   return <ErrorMessage message={error} />;

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardHeader
        title="My Profile"
        subtitle="Your investor profile visible to matched startups"
        actions={
          <Link href="/investor/profile/edit">
            <Button variant="primary">Edit Profile</Button>
          </Link>
        }
      />

      {profile ? (
        <InvestorProfileCard profile={profile} showEditButton={false} />
      ) : (
        <motion.div
          className="rounded-xl border border-dashed border-surface-border bg-surface-card/50 p-12 flex flex-col items-center gap-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="h-16 w-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
            <Plus className="h-8 w-8 text-gold-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold font-display text-lg">No profile yet</h3>
            <p className="text-surface-muted text-sm font-body mt-1 max-w-sm">
              Create your investor profile to start getting matched with startups.
            </p>
          </div>
          <Link href="/investor/profile/edit">
            <Button variant="gold">Create Profile</Button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}