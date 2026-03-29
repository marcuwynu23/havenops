import { type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type AlertVariant = "error" | "warning" | "info";

const variantClass: Record<AlertVariant, string> = {
  error: "border-danger/40 bg-danger/15 text-danger-foreground",
  warning: "border-warning/40 bg-warning/15 text-warning",
  info: "border-border bg-surface text-muted",
};

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
};

export function Alert({
  variant = "error",
  className,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm",
        variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}
