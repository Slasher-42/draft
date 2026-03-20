import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  message?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', message, className }: LoadingSpinnerProps) {
  if (size === 'fullscreen') {
    return (
      <div className="fixed inset-0 bg-surface flex flex-col items-center justify-center z-50">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-surface-border border-t-brand-500 animate-spin" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-gold-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        {message && (
          <p className="mt-4 text-surface-muted text-sm font-body">{message}</p>
        )}
      </div>
    );
  }

  const spinnerSizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn(
        'rounded-full border-surface-border border-t-brand-500 animate-spin',
        spinnerSizes[size]
      )} />
      {message && (
        <p className="text-surface-muted text-sm font-body">{message}</p>
      )}
    </div>
  );
}