'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvestorExecutionForm } from '@/components/execution/InvestorExecutionForm';
import { useInvestorExecutions } from '@/hooks/useInvestorExecution';
import type { InvestorExecutionRequest } from '@/types/execution';

export default function InvestorExecutePage() {
  const router = useRouter();
  const { submit } = useInvestorExecutions();

  const handleSubmit = async (data: InvestorExecutionRequest) => {
    const execution = await submit(data);
    router.push(`/investor/execute/conversation?executionId=${execution.id}&type=INVESTOR`);
  };

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardHeader
        title="Investment Execute"
        subtitle="Fill in your investment details. After submitting you will be taken to an AI conversation."
      />
      <Card>
        <CardHeader>
          <CardTitle>Investment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <InvestorExecutionForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </motion.div>
  );
}