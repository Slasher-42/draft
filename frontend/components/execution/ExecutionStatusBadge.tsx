'use client';
import type { ExecutionStatus } from '@/types/execution';

interface ExecutionStatusBadgeProps {
  status: ExecutionStatus;
}

const config: Record<ExecutionStatus, { label: string; className: string }> = {
  PENDING:  { label: 'Pending',  className: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' },
  MATCHED:  { label: 'Matched',  className: 'bg-green-500/10 text-green-400 border border-green-500/20' },
  REJECTED: { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border border-red-500/20' },
};

export function ExecutionStatusBadge({ status }: ExecutionStatusBadgeProps) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}