'use client';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default function EvaluatorDashboardPage() {
  const { user } = useAuth();

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardHeader
        title={`Welcome, ${user?.fullName?.split(' ')[0]} 👋`}
        subtitle="Review and evaluate startup applications"
      />

      <motion.div
        className="rounded-xl border border-dashed border-surface-border bg-surface-card/50 p-12 flex flex-col items-center gap-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-surface-muted text-sm font-body max-w-sm">
          Evaluator tools are coming in the next phase. Check back soon.
        </p>
      </motion.div>
    </motion.div>
  );
}
