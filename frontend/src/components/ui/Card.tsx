import { type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mb-4 rounded-lg border border-border bg-surface p-4 sm:mb-5 sm:p-5",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "mb-3 font-display text-base font-semibold sm:mb-4 sm:text-lg",
        className,
      )}
      {...props}
    />
  );
}
