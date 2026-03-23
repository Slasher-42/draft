import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base — wider padding, taller height, sharper shadow, smoother transitions
  'inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 hover:shadow-lg hover:shadow-blue-500/35',
        primary:
          'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 hover:shadow-lg hover:shadow-blue-500/35',
        brand:
          'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 hover:shadow-lg hover:shadow-blue-500/35',
        outline:
          'border-2 border-[var(--bg-border)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]',
        secondary:
          'bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--bg-border)] hover:bg-[var(--bg-border)] hover:text-[var(--text-primary)]',
        ghost:
          'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
        destructive:
          'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/30 hover:shadow-lg hover:shadow-red-500/35',
        danger:
          'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/30 hover:shadow-lg hover:shadow-red-500/35',
        gold:
          'bg-amber-500 text-white hover:bg-amber-400 shadow-md shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-400/35',
        success:
          'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30 hover:shadow-lg hover:shadow-emerald-500/35',
        link:
          'text-blue-400 underline-offset-4 hover:underline hover:text-blue-300',
      },
      size: {
        // sm  — compact but still readable
        sm: 'h-9 px-5 text-xs',
        // default — the new "comfortable" baseline (was h-9 px-4)
        default: 'h-11 px-6',
        // lg  — prominent CTA (was h-11 px-6)
        lg: 'h-12 px-8 text-base',
        // xl  — hero / page-level CTA
        xl: 'h-14 px-10 text-base',
        // icon sizes — unchanged
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin flex-shrink-0" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };