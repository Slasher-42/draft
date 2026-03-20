'use client';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useInvestorProfile } from '@/hooks/useInvestorProfile';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { InvestorProfileCard } from '@/components/investor/InvestorProfileCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { DollarSign, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function InvestorDashboardPage() {
  const { user } = useAuth();
  const { profile, loading } = useInvestorProfile(user?.id ?? 0);

  if (loading) return <LoadingSpinner size="md" message="Loading dashboard..." className="mt-20" />;

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardHeader
        title={`Welcome, ${user?.fullName?.split(' ')[0]} 👋`}
        subtitle="Discover and connect with investment-ready startups"
        actions={
          !profile && (
            <Link href="/investor/profile/edit">
              <Button variant="primary">Complete Profile</Button>
            </Link>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4">
        <StatsCard
          title="Investment Budget"
          value={profile ? formatCurrency(profile.investmentBudget) : '—'}
          subtitle="Available for investment"
          icon={<DollarSign className="h-5 w-5" />}
          variant="gold"
          delay={0.1}
        />
      </div>

      {profile ? (
        <InvestorProfileCard profile={profile} />
      ) : (
        <motion.div
          className="rounded-xl border border-dashed border-surface-border bg-surface-card/50 p-12 flex flex-col items-center gap-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="h-16 w-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-gold-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold font-display text-lg">
              Complete your profile
            </h3>
            <p className="text-surface-muted text-sm font-body mt-1 max-w-sm">
              Set your investment budget and preferences to get matched with
              the right startups.
            </p>
          </div>
          <Link href="/investor/profile/edit">
            <Button variant="gold">Set Up Profile</Button>
          </Link>
        </motion.div>
      )}

      <QuickActions
        actions={[
          {
            label:       'Edit Profile',
            description: 'Update your investment preferences',
            href:        '/investor/profile/edit',
            icon:        <User className="h-5 w-5" />,
            variant:     'brand',
          },
        ]}
      />
    </motion.div>
  );
}