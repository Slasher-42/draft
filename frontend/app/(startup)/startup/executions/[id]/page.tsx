'use client';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExecutionStatusBadge } from '@/components/execution/ExecutionStatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useStartupExecutionById } from '@/hooks/useStartupExecution';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Pencil } from 'lucide-react';

export default function StartupExecutionDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { execution, loading } = useStartupExecutionById(id);

  if (loading) return <LoadingSpinner size="md" message="Loading execution..." className="mt-20" />;
  if (!execution) return <p className="text-surface-muted text-sm mt-20 text-center">Execution not found.</p>;

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardHeader
        title={`Execution #${execution.id}`}
        subtitle={`Submitted on ${formatDate(execution.createdAt)}`}
        actions={
          <div className="flex gap-3">
            <Link href="/startup/executions">
              <Button variant="secondary" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link href={`/startup/executions/${execution.id}/edit`}>
              <Button variant="primary" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Status</CardTitle>
            <ExecutionStatusBadge status={execution.status} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {execution.statusReason ? (
            <p className="text-sm text-surface-muted">{execution.statusReason}</p>
          ) : (
            <p className="text-sm text-surface-muted">
              {execution.status === 'PENDING'
                ? 'Your execution is being reviewed. You will be notified once a decision is made.'
                : 'No additional reason provided.'}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Execution Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Detail label="Target Company Size" value={execution.targetCompanySize} />
          <Detail label="Suggested Funding Range" value={execution.suggestedFundingRange} />
          <Detail label="Funding Needed" value={`$${execution.fundingNeeded.toLocaleString()}`} />
          <Detail label="Annual Revenue" value={`$${execution.annualRevenue.toLocaleString()}`} />
          <Detail label="Monthly Burn Rate" value={`$${execution.monthlyBurnRate.toLocaleString()}`} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Startup Information</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Detail label="Problem Statement" value={execution.problemStatement} />
          <Detail label="Business Model" value={execution.businessModel} />
          <Detail label="Target Market" value={execution.targetMarket} />
          <Detail label="Team Details" value={execution.teamDetails} />
          {execution.additionalConsiderations && (
            <Detail label="Additional Considerations" value={execution.additionalConsiderations} />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-surface-muted font-medium uppercase tracking-wide">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}