import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import { StatsGrid } from "../ui/StatsGrid";
import { cn } from "../../lib/cn";

export function TableRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-11 w-full rounded-md" />
      ))}
    </div>
  );
}

/** Suspense fallback while lazy route chunks load — padding matches AdminShell main. */
export function RouteFallbackSkeleton() {
  return (
    <div
      className="min-h-screen bg-background px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6"
      aria-busy
      aria-label="Loading page"
    >
      <div className="mb-5 sm:mb-6">
        <Skeleton className="mb-2 h-8 w-44 max-w-full sm:h-9 sm:w-52" />
        <Skeleton className="h-1 w-14 rounded-full" />
      </div>
      <StatsGrid>
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-surface p-3 sm:p-4"
          >
            <Skeleton className="h-8 w-10 sm:h-9" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </StatsGrid>
      <Card className="mb-0">
        <Skeleton className="mb-3 h-5 w-40 sm:mb-4 sm:h-6" />
        <TableRowsSkeleton rows={7} />
      </Card>
    </div>
  );
}

/** Auth store hydrate / short waits — centered pulse blocks. */
export function HydrateCenterSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-background px-4",
        className ?? "min-h-screen",
      )}
      aria-busy
      aria-label="Loading"
    >
      <div className="flex w-full max-w-sm flex-col gap-3">
        <Skeleton className="mx-auto h-10 w-48 rounded-lg" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="mt-2 h-36 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function DashboardContentSkeleton() {
  return (
    <div aria-busy aria-label="Loading dashboard">
      <StatsGrid>
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-surface p-3 sm:p-4"
          >
            <Skeleton className="h-8 w-10 sm:h-9" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </StatsGrid>
      <Card className="mb-0">
        <Skeleton className="mb-3 h-5 w-36 sm:mb-4 sm:h-6" />
        <TableRowsSkeleton rows={8} />
      </Card>
    </div>
  );
}

export function JobsContentSkeleton() {
  return (
    <div aria-busy aria-label="Loading jobs">
      <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>
      <Card className="mb-0">
        <Skeleton className="mb-4 h-5 w-28 sm:h-6" />
        <TableRowsSkeleton rows={8} />
      </Card>
    </div>
  );
}

export function ClientsContentSkeleton() {
  return (
    <Card className="mb-0" aria-busy aria-label="Loading clients">
      <Skeleton className="mb-3 h-5 w-32 sm:mb-4 sm:h-6" />
      <div className="mb-4 space-y-2">
        <Skeleton className="h-3 w-full max-w-xl" />
        <Skeleton className="h-3 w-full max-w-lg" />
      </div>
      <TableRowsSkeleton rows={6} />
    </Card>
  );
}

export function EmployeesTableSkeleton() {
  return (
    <Card className="mb-0" aria-busy aria-label="Loading team">
      <Skeleton className="mb-4 h-5 w-24 sm:h-6" />
      <TableRowsSkeleton rows={6} />
    </Card>
  );
}

export function JobTableCardSkeleton({ titleWidth = "w-40" }: { titleWidth?: string }) {
  return (
    <Card className="mb-0" aria-busy aria-label="Loading jobs">
      <Skeleton className={cn("mb-4 h-5 sm:h-6", titleWidth)} />
      <TableRowsSkeleton rows={7} />
    </Card>
  );
}
