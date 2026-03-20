import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
  fullscreen?: boolean;
}

export function ErrorMessage({
  message = 'Something went wrong. Please try again.',
  onRetry,
  className,
  fullscreen = false,
}: ErrorMessageProps) {
  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-4 text-center p-8',
      className
    )}>
      <div className="h-14 w-14 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center">
        <AlertCircle className="h-7 w-7 text-danger" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-white font-semibold font-display">Something went wrong</h3>
        <p className="text-surface-muted text-sm font-body max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-surface flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}