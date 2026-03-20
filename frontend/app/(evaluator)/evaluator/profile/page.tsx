'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEvaluatorProfile } from '@/hooks/useEvaluatorProfile';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, MapPin, Briefcase, Plus } from 'lucide-react';

export default function EvaluatorProfilePage() {
  const { user } = useAuth();
  const { profile, loading, error } = useEvaluatorProfile(user?.id ?? 0);

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
        subtitle="Your evaluator profile visible within the RG Partners system"
        actions={
          <Link href="/evaluator/profile/edit">
            <Button variant="primary">{profile ? 'Edit Profile' : 'Create Profile'}</Button>
          </Link>
        }
      />

      {profile ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold font-display text-lg">{user?.fullName}</h3>
                  <p className="text-surface-muted text-sm font-body">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-surface border border-surface-border">
                  <Briefcase className="h-5 w-5 text-brand-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-surface-muted font-body uppercase tracking-wide">Department</p>
                    <p className="text-white font-medium font-body mt-0.5">{profile.department}</p>
                  </div>
                </div>

                {profile.specialization && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-surface border border-surface-border">
                    <Briefcase className="h-5 w-5 text-brand-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-surface-muted font-body uppercase tracking-wide">Specialization</p>
                      <p className="text-white font-medium font-body mt-0.5">{profile.specialization}</p>
                    </div>
                  </div>
                )}

                {(profile.city || profile.country) && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-surface border border-surface-border">
                    <MapPin className="h-5 w-5 text-brand-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-surface-muted font-body uppercase tracking-wide">Location</p>
                      <p className="text-white font-medium font-body mt-0.5">
                        {[profile.city, profile.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
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
              Create your evaluator profile to complete your setup in the system.
            </p>
          </div>
          <Link href="/evaluator/profile/edit">
            <Button variant="primary">Create Profile</Button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}