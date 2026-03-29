import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";

export type StatsGridProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function StatsGrid({ className, children, ...props }: StatsGridProps) {
  return (
    <div
      className={cn(
        "mb-5 grid grid-cols-2 gap-3 sm:mb-6 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:gap-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
