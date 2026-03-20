'use client';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ReadinessLevel = 'HIGHLY_READY' | 'MODERATELY_READY' | 'NOT_READY' | 'PENDING';

interface ReadinessStatusCardProps {
  status: ReadinessLevel;
  score?: number;
  feedback?: string;
}

const statusConfig = {
  HIGHLY_READY: {
    label:   'Highly Ready',
    color:   'text-success',
    bg:      'bg-success/10 border-success/20',
    icon:    <CheckCircle className="h-6 w-6 text-success" />,
    variant: 'success' as const,
  },
  MODERATELY_READY: {
    label:   'Moderately Ready',
    color:   'text-warning',
    bg:      'bg-warning/10 border-warning/20',
    icon:    <TrendingUp className="h-6 w-6 text-warning" />,
    variant: 'warning' as const,
  },
  NOT_READY: {
    label:   'Not Ready',
    color:   'text-danger',
    bg:      'bg-danger/10 border-danger/20',
    icon:    <XCircle className="h-6 w-6 text-danger" />,
    variant: 'danger' as const,
  },
  PENDING: {
    label:   'Pending Review',
    color:   'text-surface-muted',
    bg:      'bg-surface-border/20 border-surface-border',
    icon:    <Clock className="h-6 w-6 text-surface-muted" />,
    variant: 'muted' as const,
  },
};

export function ReadinessStatusCard({ status, score, feedback }: ReadinessStatusCardProps) {
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Investment Readiness</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${config.bg}`}>
            {config.icon}
            <div>
              <p className="text-white font-semibold font-display">{config.label}</p>
              <Badge variant={config.variant} className="mt-1">
                {status.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {score !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-muted font-body">Readiness Score</span>
                <span className={`text-2xl font-bold font-display ${config.color}`}>
                  {score}<span className="text-sm text-surface-muted">/100</span>
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-border overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    status === 'HIGHLY_READY'     ? 'bg-success' :
                    status === 'MODERATELY_READY' ? 'bg-warning' :
                    status === 'NOT_READY'        ? 'bg-danger'  : 'bg-surface-muted'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {feedback && (
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-white font-body">Feedback</p>
              <p className="text-sm text-surface-muted font-body leading-relaxed">
                {feedback}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}