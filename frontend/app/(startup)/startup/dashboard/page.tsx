'use client';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useStartupProfile } from '@/hooks/useStartupProfile';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { StartupProfileCard } from '@/components/startup/StartupProfileCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Building2, DollarSign, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function StartupDashboardPage() {
  const { user } = useAuth();
  const { profile, loading } = useStartupProfile(user?.id ?? 0);

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
        subtitle="Here's an overview of your startup's investment readiness"
        actions={
          !profile && (
            <Link href="/startup/profile/edit">
              <Button variant="primary">Complete Profile</Button>
            </Link>
          )
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          title="Funding Needed"
          value={profile ? formatCurrency(profile.fundingNeeded) : '—'}
          subtitle="Target investment amount"
          icon={<DollarSign className="h-5 w-5" />}
          variant="gold"
          delay={0.1}
        />
        <StatsCard
          title="Team Size"
          value={profile?.teamSize ?? '—'}
          subtitle="Current team members"
          icon={<Building2 className="h-5 w-5" />}
          variant="brand"
          delay={0.15}
        />
      </div>

      {profile ? (
        <StartupProfileCard profile={profile} />
      ) : (
        <motion.div
          className="rounded-xl border border-dashed border-surface-border bg-surface-card/50 p-12 flex flex-col items-center gap-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="h-16 w-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-brand-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold font-display text-lg">Complete your profile</h3>
            <p className="text-surface-muted text-sm font-body mt-1 max-w-sm">
              Add your startup details to get your investment readiness score from our AI engine.
            </p>
          </div>
          <Link href="/startup/profile/edit">
            <Button variant="primary">Set Up Profile</Button>
          </Link>
        </motion.div>
      )}

      <QuickActions
        actions={[
          {
            label:       'Edit Profile',
            description: 'Update your startup information',
            href:        '/startup/profile/edit',
            icon:        <User className="h-5 w-5" />,
            variant:     'brand',
          },
        ]}
      />
    </motion.div>
  );
}