'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useInvestorProfile } from '@/hooks/useInvestorProfile';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
  DollarSign, TrendingUp, Search, User,
  ArrowRight, MapPin, Building2, ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { INDUSTRY_LABELS } from '@/types/common';

export default function InvestorDashboardPage() {
  const { user } = useAuth();
  const { profile, loading } = useInvestorProfile(user?.id ?? 0);

  if (loading) return <LoadingSpinner size="md" message="Loading dashboard..." className="mt-20" />;

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Page Header ── */}
      <DashboardHeader
        title={`Welcome back, ${firstName} 👋`}
        subtitle="Discover and connect with investment-ready startups"
        actions={
          !profile ? (
            <Link href="/investor/profile/edit">
              <Button variant="primary" size="lg">Complete Profile</Button>
            </Link>
          ) : (
            <Link href="/investor/execute">
              <Button variant="primary" size="lg">Investment Execute</Button>
            </Link>
          )
        }
      />

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Budget */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <DollarSign className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-medium mb-1">
              Investment Budget
            </p>
            <p className="text-2xl font-bold text-amber-400">
              {profile ? formatCurrency(profile.investmentBudget) : '—'}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Available for investment</p>
          </div>
        </motion.div>

        {/* Industry */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-medium mb-1">
              Focus Industry
            </p>
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {profile
                ? (INDUSTRY_LABELS[profile.preferredIndustry as keyof typeof INDUSTRY_LABELS] ?? profile.preferredIndustry)
                : '—'}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Preferred sector</p>
          </div>
        </motion.div>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
            <MapPin className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-medium mb-1">
              Location
            </p>
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {profile?.city && profile?.country
                ? `${profile.city}, ${profile.country}`
                : profile?.country ?? '—'}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Investment base</p>
          </div>
        </motion.div>
      </div>

      {/* ── Profile Card (if exists) ── */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-[var(--bg-border)] bg-[var(--bg-card)] p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  {profile.organizationName}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  {INDUSTRY_LABELS[profile.preferredIndustry as keyof typeof INDUSTRY_LABELS] ?? profile.preferredIndustry}
                </span>
              </div>
            </div>
            <Link href="/investor/profile/edit">
              <Button variant="outline" size="sm">Edit Profile</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--bg-border)]">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Budget</p>
              <p className="text-lg font-bold text-amber-400">{formatCurrency(profile.investmentBudget)}</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--bg-border)]">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Industry</p>
              <p className="text-base font-semibold text-[var(--text-primary)]">
                {INDUSTRY_LABELS[profile.preferredIndustry as keyof typeof INDUSTRY_LABELS] ?? profile.preferredIndustry}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--bg-border)]">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Location</p>
              <p className="text-base font-semibold text-[var(--text-primary)]">
                {profile.city && profile.country ? `${profile.city}, ${profile.country}` : profile.country ?? '—'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── No Profile CTA ── */}
      {!profile && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 p-12 flex flex-col items-center gap-4 text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">Complete your investor profile</h3>
            <p className="text-sm text-[var(--text-muted)] mt-2 max-w-sm">
              Set your investment budget and preferences to get matched with the right startups.
            </p>
          </div>
          <Link href="/investor/profile/edit">
            <Button variant="gold" size="lg">Set Up Profile</Button>
          </Link>
        </motion.div>
      )}

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">
          Quick Actions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              href: '/investor/execute',
              icon: <TrendingUp className="h-5 w-5" />,
              label: 'Investment Execute',
              desc: 'Submit a new investment execution',
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
              border: 'border-amber-500/20',
            },
            {
              href: '/investor/executions',
              icon: <Search className="h-5 w-5" />,
              label: 'Look Up',
              desc: 'View your executions and matches',
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
              border: 'border-blue-500/20',
            },
            {
              href: '/investor/profile/edit',
              icon: <User className="h-5 w-5" />,
              label: 'Edit Profile',
              desc: 'Update your investment preferences',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
              border: 'border-emerald-500/20',
            },
          ].map((action, i) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
            >
              <Link
                href={action.href}
                className="group flex items-center gap-4 p-5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-card)] hover:border-[var(--brand)] hover:bg-[var(--bg-hover)] transition-all duration-150"
              >
                <div className={`h-10 w-10 rounded-xl ${action.bg} border ${action.border} flex items-center justify-center flex-shrink-0 ${action.color}`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{action.label}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{action.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--brand)] flex-shrink-0 transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}