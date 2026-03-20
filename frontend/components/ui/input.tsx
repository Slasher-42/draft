import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, type, style, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-slate-300 font-body">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center justify-center text-surface-muted pointer-events-none"
              style={{ top: '50%', transform: 'translateY(-50%)' }}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full rounded-lg border bg-surface-card text-white placeholder:text-surface-muted',
              'py-2.5 text-sm transition-all duration-200',
              'border-surface-border focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-danger focus:border-danger focus:ring-danger/20',
              className
            )}
            style={{
              paddingLeft:  leftIcon  ? '2.5rem' : '1rem',
              paddingRight: rightIcon ? '2.5rem' : '1rem',
              ...style,
            }}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center justify-center text-surface-muted"
              style={{ top: '50%', transform: 'translateY(-50%)' }}>
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-surface-muted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };