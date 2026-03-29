import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border border-border bg-field px-3 py-2.5 text-base text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent-muted sm:px-2.5 sm:py-2 sm:text-sm",
        className,
      )}
      {...props}
    />
  );
});
