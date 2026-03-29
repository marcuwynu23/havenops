import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full rounded-md border border-border bg-field px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent-muted sm:px-2.5 sm:py-2 sm:text-sm",
          className,
        )}
        {...props}
      />
    );
  },
);
