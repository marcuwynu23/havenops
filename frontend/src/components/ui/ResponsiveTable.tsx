import { type HTMLAttributes, type LiHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";

/** Wraps `<Table>` — hidden below `md`, horizontal scroll on desktop. */
export function TableDesktop({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("hidden overflow-x-auto md:block", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/** Stacked list — visible only below `md`. */
export function TableMobileList({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn("list-none space-y-3 p-0 md:hidden", className)}
      role="list"
      {...props}
    >
      {children}
    </ul>
  );
}

/** One row as a card on small screens. */
export function TableMobileCard({
  className,
  children,
  ...props
}: LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={cn(
        "rounded-lg border border-border bg-surface/60 p-4 shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </li>
  );
}

type DataFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

/** Label + value stack for mobile list rows. */
export function DataField({ label, children, className }: DataFieldProps) {
  return (
    <div
      className={cn(
        "border-b border-border/50 py-2.5 last:border-b-0 last:pb-0 first:pt-0",
        className,
      )}
    >
      <dt className="text-[0.6875rem] font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-1 min-w-0 text-sm leading-snug text-foreground sm:text-sm">
        {children}
      </dd>
    </div>
  );
}

export function DataFieldList({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <dl className={cn("m-0 space-y-0", className)}>{children}</dl>
  );
}
