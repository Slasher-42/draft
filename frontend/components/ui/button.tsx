import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:   'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500 shadow-md hover:shadow-glow',
        secondary: 'bg-surface-card text-white border border-surface-border hover:bg-surface-border focus:ring-brand-500',
        gold:      'bg-gold-500 text-white hover:bg-gold-600 focus:ring-gold-500 shadow-md hover:shadow-gold',
        ghost:     'text-brand-400 hover:bg-surface-card hover:text-brand-300 focus:ring-brand-500',
        danger:    'bg-danger text-white hover:bg-danger-dark focus:ring-danger',
        outline:   'border border-brand-500 text-brand-400 hover:bg-brand-500 hover:text-white focus:ring-brand-500',
      },
      size: {
        sm:   'h-8  px-3 text-xs',
        md:   'h-10 px-5 text-sm',
        lg:   'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size:    'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading...
          </span>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button, buttonVariants };