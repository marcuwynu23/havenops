import { type ReactNode } from "react";
import { cn } from "../../lib/cn";

export type StatCardProps = {
  value: ReactNode;
  label: string;
  className?: string;
};

export function StatCard({ value, label, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-3 sm:p-4",
        className,
      )}
    >
      <div className="font-display text-2xl font-semibold text-accent sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-[0.65rem] text-muted sm:text-xs">{label}</div>
    </div>
  );
}
