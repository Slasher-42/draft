'use client';
import { use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useInvestorExecutionById, investorExecutionService } from '@/hooks/useInvestorExecution';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ExecutionStatusBadge } from '@/components/execution/ExecutionStatusBadge';
import { InvestorExecutionForm } from '@/components/execution/InvestorExecutionForm';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  ArrowLeft, Calendar, DollarSign, TrendingUp,
  Clock, Target, FileText, AlertCircle, Pencil,
} from 'lucide-react';
import { useState } from 'react';
import type { InvestorExecutionRequest } from '@/types/execution';
import { toast } from 'react-toastify';

export default function InvestorExecutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const executionId = Number(id);
  const { execution, loading } = useInvestorExecutionById(executionId);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (loading) return <LoadingSpinner size="md" message="Loading execution..." className="mt-20" />;

  if (!execution) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 mt-24 text-center">
        <AlertCircle className="h-12 w-12 text-[var(--text-muted)]" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Execution not found</h2>
        <p className="text-sm text-[var(--text-muted)]">
          This execution does not exist or you do not have access to it.
        </p>
        <Link href="/investor/executions">
          <Button variant="secondary">Back to Executions</Button>
        </Link>
      </div>
    );
  }

  const handleUpdate = async (data: InvestorExecutionRequest) => {
    setIsSaving(true);
    try {
      await investorExecutionService.update(executionId, data);
      toast.success('Execution updated successfully');
      setIsEditing(false);
      window.location.reload();
    } catch {
      toast.error('Failed to update execution');
    } finally {
      setIsSaving(false);
    }
  };

  const statusColors = {
    PENDING:  { bg: 'bg-amber-50 dark:bg-amber-500/10',   text: 'text-amber-700 dark:text-amber-400',  border: 'border-amber-200 dark:border-amber-500/30' },
    MATCHED:  { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/30' },
    REJECTED: { bg: 'bg-red-50 dark:bg-red-500/10',       text: 'text-red-700 dark:text-red-400',       border: 'border-red-200 dark:border-red-500/30' },
  };
  const sc = statusColors[execution.status];

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <DashboardHeader
        title={`Execution #${execution.id}`}
        subtitle="Full details of your investment execution"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/investor/executions">
              <Button variant="secondary" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>
            </Link>
            {execution.status === 'PENDING' && !isEditing && (
              <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
            )}
          </div>
        }
      />

      {/* ── Status Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`rounded-2xl border px-6 py-5 flex items-start gap-4 ${sc.bg} ${sc.border}`}
      >
        <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${sc.text}`} />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-bold ${sc.text}`}>
              Status: {execution.status}
            </span>
            <ExecutionStatusBadge status={execution.status} />
          </div>
          {execution.statusReason ? (
            <p className={`text-sm ${sc.text} opacity-80`}>{execution.statusReason}</p>
          ) : (
            <p className={`text-sm ${sc.text} opacity-70`}>
              {execution.status === 'PENDING'
                ? 'Your execution is under review. You will be notified once a match is found.'
                : execution.status === 'MATCHED'
                ? 'A startup match has been found for your investment criteria.'
                : 'This execution did not meet the matching criteria.'}
            </p>
          )}
        </div>
      </motion.div>

      {isEditing ? (
        /* ── Edit Mode ── */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Edit Execution</span>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InvestorExecutionForm existing={execution} onSubmit={handleUpdate} />
          </CardContent>
        </Card>
      ) : (
        /* ── Detail View ── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left — main details */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Key metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-[var(--bg-card)] border border-[var(--bg-border)] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Budget</span>
                </div>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(execution.investmentBudget)}
                </p>
              </div>

              <div className="bg-[var(--bg-card)] border border-[var(--bg-border)] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Industry</span>
                </div>
                <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                  {execution.preferredIndustry}
                </p>
              </div>

              <div className="bg-[var(--bg-card)] border border-[var(--bg-border)] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Timeline</span>
                </div>
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {execution.expectedReturnTimeline}
                </p>
              </div>
            </div>

            {/* Investment Reason */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Investment Reason
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {execution.investmentReason}
                </p>
              </CardContent>
            </Card>

            {/* Success Criteria */}
            {execution.successCriteria && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-4 w-4 text-emerald-500" />
                    Success Criteria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {execution.successCriteria}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Additional Considerations */}
            {execution.additionalConsiderations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Additional Considerations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {execution.additionalConsiderations}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right — metadata */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Submission Info</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">Submitted</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                    <p className="text-sm text-[var(--text-primary)]">{formatDate(execution.createdAt)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">Last Updated</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                    <p className="text-sm text-[var(--text-primary)]">{formatDate(execution.updatedAt)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">Execution ID</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">#{execution.id}</p>
                </div>
                {execution.statusUpdatedAt && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">Status Updated</p>
                    <p className="text-sm text-[var(--text-primary)]">{formatDate(execution.statusUpdatedAt)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {execution.status === 'PENDING' && (
              <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-4">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Under Review</p>
                <p className="text-xs text-blue-600 dark:text-blue-300 leading-relaxed">
                  Our AI engine is analyzing your criteria and matching it against approved startups. You will receive a notification once results are available.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}