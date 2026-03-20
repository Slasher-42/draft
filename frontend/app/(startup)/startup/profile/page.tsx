'use client';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useStartupProfile } from '@/hooks/useStartupProfile';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StartupProfileCard } from '@/components/startup/StartupProfileCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function StartupProfilePage() {
  const { user } = useAuth();
  const { profile, loading, error } = useStartupProfile(user?.id ?? 0);

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
        subtitle="Your startup information visible to evaluators and investors"
        actions={
          <Link href="/startup/profile/edit">
            <Button variant="primary">Edit Profile</Button>
          </Link>
        }
      />

      {profile ? (
        <StartupProfileCard profile={profile} showEditButton={false} />
      ) : (
        <motion.div
          className="rounded-xl border border-dashed border-surface-border bg-surface-card/50 p-12 flex flex-col items-center gap-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="h-16 w-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <Plus className="h-8 w-8 text-brand-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold font-display text-lg">No profile yet</h3>
            <p className="text-surface-muted text-sm font-body mt-1 max-w-sm">
              Create your startup profile to get started with the investment readiness assessment.
            </p>
          </div>
          <Link href="/startup/profile/edit">
            <Button variant="primary">Create Profile</Button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}