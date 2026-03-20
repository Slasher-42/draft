import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:   'bg-brand-500/20 text-brand-300 border border-brand-500/30',
        gold:      'bg-gold-500/20 text-gold-300 border border-gold-500/30',
        success:   'bg-success/20 text-success border border-success/30',
        warning:   'bg-warning/20 text-warning border border-warning/30',
        danger:    'bg-danger/20 text-danger border border-danger/30',
        muted:     'bg-surface-border text-surface-muted border border-surface-border',
        startup:   'bg-brand-500/20 text-brand-300 border border-brand-500/30',
        investor:  'bg-gold-500/20 text-gold-300 border border-gold-500/30',
        evaluator: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        admin:     'bg-red-500/20 text-red-300 border border-red-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };