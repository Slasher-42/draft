import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 flex items-start gap-3",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary-50)] border-[var(--color-primary-200)] text-[var(--color-primary-800)]",
        destructive:
          "bg-red-50 border-red-200 text-red-800",
        success:
          "bg-green-50 border-green-200 text-green-800",
        warning:
          "bg-yellow-50 border-yellow-200 text-yellow-800",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription };