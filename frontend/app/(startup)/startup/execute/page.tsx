'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StartupExecutionForm } from '@/components/execution/StartupExecutionForm';
import { useStartupExecutions } from '@/hooks/useStartupExecution';
import type { StartupExecutionRequest } from '@/types/execution';

export default function StartupExecutePage() {
  const router = useRouter();
  const { submit } = useStartupExecutions();

  const handleSubmit = async (data: StartupExecutionRequest) => {
    const execution = await submit(data);
    router.push(`/startup/execute/conversation?executionId=${execution.id}&type=STARTUP`);
  };

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardHeader
        title="Startup Execute"
        subtitle="Fill in your startup details. After submitting you will be taken to an AI conversation."
      />
      <Card>
        <CardHeader>
          <CardTitle>Execution Details</CardTitle>
        </CardHeader>
        <CardContent>
          <StartupExecutionForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </motion.div>
  );
}