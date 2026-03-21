'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExecutionStatusBadge } from '@/components/execution/ExecutionStatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useInvestorExecutions } from '@/hooks/useInvestorExecution';
import { formatDate } from '@/lib/utils';
import { PlusCircle, Eye } from 'lucide-react';

export default function InvestorExecutionsPage() {
  const { executions, loading } = useInvestorExecutions();

  if (loading) return <LoadingSpinner size="md" message="Loading executions..." className="mt-20" />;

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardHeader
        title="Look Up"
        subtitle="View the status of your investment executions and matched startups"
        actions={
          <Link href="/investor/execute">
            <Button variant="primary" size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Execution
            </Button>
          </Link>
        }
      />

      {executions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-surface-muted text-sm">You have not submitted any investment executions yet.</p>
            <Link href="/investor/execute">
              <Button variant="primary" size="sm">Submit your first execution</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {executions.map((execution) => (
            <motion.div
              key={execution.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="flex items-center justify-between py-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium text-sm">
                        Execution #{execution.id}
                      </span>
                      <ExecutionStatusBadge status={execution.status} />
                    </div>
                    <p className="text-surface-muted text-xs">
                      {execution.preferredIndustry} · ${execution.investmentBudget.toLocaleString()} budget · Submitted {formatDate(execution.createdAt)}
                    </p>
                    {execution.statusReason && (
                      <p className="text-xs text-surface-muted mt-1 italic">
                        Reason: {execution.statusReason}
                      </p>
                    )}
                  </div>
                  <Link href={`/investor/executions/${execution.id}`}>
                    <Button variant="secondary" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}