import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import { StatsGrid } from "../ui/StatsGrid";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  Th,
  Td,
} from "../ui/Table";
import { cn } from "../../lib/cn";

const MAIN_PAD =
  "px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:pb-10";

/* —— Shared primitives —— */

function PageHeaderSkeleton({
  titleWidth,
  descLines = 0,
}: {
  titleWidth: string;
  descLines?: number;
}) {
  return (
    <header className="mb-5 sm:mb-6">
      <Skeleton
        className={cn("mb-2 h-8 max-w-full sm:h-9", titleWidth)}
        aria-hidden
      />
      <Skeleton className="h-1 w-14 rounded-full" aria-hidden />
      {descLines > 0 ? (
        <div className="mt-3 max-w-2xl space-y-2">
          {Array.from({ length: descLines }, (_, i) => (
            <Skeleton
              key={i}
              className={cn(
                "h-3.5",
                i === 0 ? "w-full" : i === 1 ? "w-[92%]" : "w-[78%]",
              )}
              aria-hidden
            />
          ))}
        </div>
      ) : null}
    </header>
  );
}

function StatCardsRow({ count }: { count: number }) {
  return (
    <StatsGrid>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-surface p-3 sm:p-4"
        >
          <Skeleton className="h-8 w-12 sm:h-9" aria-hidden />
          <Skeleton className="mt-2 h-3 w-24" aria-hidden />
        </div>
      ))}
    </StatsGrid>
  );
}

function FormFieldSkeleton({ tall }: { tall?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-3 w-24" aria-hidden />
      <Skeleton
        className={cn("w-full rounded-md", tall ? "h-24" : "h-10")}
        aria-hidden
      />
    </div>
  );
}

/** Matches `CardTitle` vertical spacing; avoids invalid `<h2><div>`. */
function CardTitleSkeleton({ barClassName }: { barClassName: string }) {
  return (
    <div className="mb-3 sm:mb-4">
      <Skeleton className={cn("h-5 sm:h-6", barClassName)} aria-hidden />
    </div>
  );
}

/* —— Shells (lazy route / session loading) —— */

function AdminShellSkeleton({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background lg:grid lg:h-screen lg:min-h-0 lg:grid-cols-[240px_1fr] lg:overflow-hidden"
      aria-busy
      aria-label="Loading"
    >
      <header
        className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-surface/80 lg:hidden"
        style={{ paddingTop: "max(0px, env(safe-area-inset-top, 0px))" }}
      >
        <Skeleton className="h-6 w-28" aria-hidden />
        <Skeleton className="ml-auto h-10 w-10 shrink-0 rounded-full" aria-hidden />
      </header>
      <aside className="hidden min-h-0 flex-col gap-1 overflow-y-auto border-border bg-surface p-3 lg:flex lg:border-r">
        <div className="mb-3 px-2 pt-1">
          <Skeleton className="h-7 w-32" aria-hidden />
        </div>
        <nav className="flex flex-1 flex-col gap-0.5" aria-hidden>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </nav>
        <div className="mt-auto space-y-2 border-t border-border pt-4">
          <Skeleton className="h-8 w-full rounded-lg" aria-hidden />
          <Skeleton className="h-3 w-full max-w-[12rem]" aria-hidden />
          <Skeleton className="h-10 w-full rounded-md" aria-hidden />
        </div>
      </aside>
      <main
        className={cn(
          "min-h-0 w-full min-w-0 flex-1 overflow-y-auto overscroll-contain",
          MAIN_PAD,
        )}
      >
        {children}
      </main>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom,0px)] pt-1 backdrop-blur-md supports-[backdrop-filter]:bg-surface/90 lg:hidden"
        aria-hidden
      >
        <div className="mx-auto flex h-[3.5rem] max-w-lg items-stretch justify-around gap-0.5 px-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex min-h-[3.25rem] min-w-0 flex-1 max-w-[5.5rem] flex-col items-center justify-center gap-0.5 py-1"
            >
              <Skeleton className="h-6 w-6 rounded-lg" />
              <Skeleton className="h-2 w-9" />
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}

function EmployeeShellSkeleton({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background lg:grid lg:h-screen lg:min-h-0 lg:grid-cols-[240px_1fr] lg:overflow-hidden"
      aria-busy
      aria-label="Loading"
    >
      <header
        className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-border bg-surface/90 px-4 backdrop-blur-md lg:hidden"
        style={{ paddingTop: "max(0px, env(safe-area-inset-top, 0px))" }}
      >
        <Skeleton className="h-6 w-28" aria-hidden />
        <Skeleton className="ml-auto h-10 w-10 shrink-0 rounded-full" aria-hidden />
      </header>
      <aside className="hidden min-h-0 flex-col border-border bg-surface p-3 lg:flex lg:border-r">
        <div className="mb-3 px-2 pt-1">
          <Skeleton className="h-7 w-32" aria-hidden />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" aria-hidden />
        <div className="mt-auto space-y-2 border-t border-border pt-4">
          <Skeleton className="h-8 w-full rounded-lg" aria-hidden />
          <Skeleton className="h-10 w-full rounded-md" aria-hidden />
        </div>
      </aside>
      <main
        className={cn(
          "min-h-0 w-full min-w-0 flex-1 overflow-y-auto overscroll-contain",
          MAIN_PAD,
        )}
      >
        {children}
      </main>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex h-[3.5rem] items-stretch border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom,0px)] pt-1 backdrop-blur-md lg:hidden"
        aria-hidden
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1">
          <Skeleton className="h-6 w-6 rounded-lg" />
          <Skeleton className="h-2 w-10" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1">
          <Skeleton className="h-6 w-6 rounded-lg" />
          <Skeleton className="h-2 w-14" />
        </div>
      </nav>
    </div>
  );
}

function ClientShellSkeleton({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background lg:grid lg:h-screen lg:min-h-0 lg:grid-cols-[240px_1fr] lg:overflow-hidden"
      aria-busy
      aria-label="Loading"
    >
      <header
        className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-border bg-surface/90 px-4 backdrop-blur-md lg:hidden"
        style={{ paddingTop: "max(0px, env(safe-area-inset-top, 0px))" }}
      >
        <Skeleton className="h-6 w-28" aria-hidden />
        <Skeleton className="ml-auto h-10 w-10 shrink-0 rounded-full" aria-hidden />
      </header>
      <aside className="hidden min-h-0 flex-col gap-1 border-border bg-surface p-3 lg:flex lg:border-r">
        <div className="mb-3 px-2 pt-1">
          <Skeleton className="h-7 w-32" aria-hidden />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" aria-hidden />
        <Skeleton className="h-10 w-full rounded-xl" aria-hidden />
        <div className="mt-auto space-y-2 border-t border-border pt-4">
          <Skeleton className="h-8 w-full rounded-lg" aria-hidden />
          <Skeleton className="h-10 w-full rounded-md" aria-hidden />
        </div>
      </aside>
      <main
        className={cn(
          "min-h-0 w-full min-w-0 flex-1 overflow-y-auto overscroll-contain",
          MAIN_PAD,
        )}
      >
        {children}
      </main>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom,0px)] pt-1 backdrop-blur-md lg:hidden"
        aria-hidden
      >
        <div className="mx-auto flex h-[3.5rem] max-w-lg items-stretch justify-around px-1">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 py-1"
            >
              <Skeleton className="h-6 w-6 rounded-lg" />
              <Skeleton className="h-2 w-12" />
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* —— Table bodies (match JobTable column counts) —— */

function AdminJobTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>When</Th>
          <Th>Client</Th>
          <Th>Site</Th>
          <Th>Service</Th>
          <Th>Assignee</Th>
          <Th>Status</Th>
          <Th>Actions</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }, (_, r) => (
          <TableRow key={r}>
            <Td>
              <Skeleton className="h-4 w-28" aria-hidden />
            </Td>
            <Td>
              <Skeleton className="h-4 w-24" aria-hidden />
            </Td>
            <Td>
              <div className="space-y-1">
                <Skeleton className="h-3 w-full max-w-[8rem]" aria-hidden />
                <Skeleton className="h-16 w-full max-w-[10rem] rounded-md" aria-hidden />
              </div>
            </Td>
            <Td>
              <Skeleton className="h-4 w-20" aria-hidden />
            </Td>
            <Td>
              <Skeleton className="h-4 w-16" aria-hidden />
            </Td>
            <Td>
              <Skeleton className="h-5 w-14 rounded-full" aria-hidden />
            </Td>
            <Td>
              <Skeleton className="h-8 w-24 rounded-md" aria-hidden />
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ClientJobTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>When</Th>
          <Th>Client</Th>
          <Th>Service</Th>
          <Th>Status</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }, (_, r) => (
          <TableRow key={r}>
            <Td>
              <Skeleton className="h-4 w-28" aria-hidden />
            </Td>
            <Td>
              <Skeleton className="h-4 w-24" aria-hidden />
            </Td>
            <Td>
              <Skeleton className="h-4 w-28" aria-hidden />
            </Td>
            <Td>
              <Skeleton className="h-5 w-16 rounded-full" aria-hidden />
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ClientsDirectoryTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Name</Th>
          <Th>Phone</Th>
          <Th>Address</Th>
          <Th>Coordinates</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }, (_, r) => (
          <TableRow key={r}>
            <Td>
              <Skeleton className="h-4 w-32" aria-hidden />
            </Td>
            <Td>
              <Skeleton className="h-4 w-24" aria-hidden />
            </Td>
            <Td>
              <Skeleton className="h-4 w-40 max-w-full" aria-hidden />
            </Td>
            <Td>
              <Skeleton className="h-4 w-20" aria-hidden />
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EmployeesTeamTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Name</Th>
          <Th>Phone</Th>
          <Th>Status</Th>
          <Th className="w-24 min-w-[4rem]">&nbsp;</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }, (_, r) => (
          <TableRow key={r}>
            <Td>
              <Skeleton className="h-4 w-28" aria-hidden />
            </Td>
            <Td>
              <Skeleton className="h-4 w-24" aria-hidden />
            </Td>
            <Td>
              <Skeleton className="h-5 w-16 rounded-full" aria-hidden />
            </Td>
            <Td>
              <Skeleton className="h-8 w-20 rounded-md" aria-hidden />
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ClientsMobileCardListSkeleton() {
  return (
    <div className="space-y-3 md:hidden" aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-surface p-4"
        >
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-2 h-4 w-[75%]" />
          <Skeleton className="mt-2 h-3 w-12" />
          <Skeleton className="mt-1 h-4 w-32" />
          <Skeleton className="mt-2 h-3 w-20" />
          <Skeleton className="mt-1 h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

/* —— In-route loading (data fetching) —— */

export function DashboardContentSkeleton() {
  return (
    <div aria-busy aria-label="Loading dashboard">
      <PageHeaderSkeleton titleWidth="w-36" />
      <StatCardsRow count={5} />
      <Card className="mb-0">
        <CardTitleSkeleton barClassName="w-36" />
        <div className="mt-3 hidden overflow-x-auto md:block">
          <AdminJobTableSkeleton rows={6} />
        </div>
        <div className="mt-3 space-y-3 md:hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border p-3"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-[66%]" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function JobsContentSkeleton() {
  return (
    <div aria-busy aria-label="Loading jobs">
      <PageHeaderSkeleton titleWidth="w-24" />
      <div className="mb-4 max-w-2xl space-y-2">
        <Skeleton className="h-3.5 w-full" aria-hidden />
        <Skeleton className="h-3.5 w-[94%]" aria-hidden />
        <Skeleton className="h-3.5 w-[88%]" aria-hidden />
      </div>
      <Card className="mb-0">
        <CardTitleSkeleton barClassName="w-28" />
        <div className="mt-3 hidden overflow-x-auto md:block">
          <AdminJobTableSkeleton rows={7} />
        </div>
        <div className="mt-3 space-y-3 md:hidden">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="rounded-lg border border-border p-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-2 h-12 w-full rounded-md" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function ClientsContentSkeleton() {
  return (
    <div aria-busy aria-label="Loading clients">
      <PageHeaderSkeleton titleWidth="w-28" />
      <Card className="mb-0">
        <CardTitleSkeleton barClassName="w-28" />
        <div className="mb-4 mt-2 max-w-xl space-y-2">
          <Skeleton className="h-3 w-full" aria-hidden />
          <Skeleton className="h-3 w-[90%]" aria-hidden />
        </div>
        <div className="hidden overflow-x-auto md:block">
          <ClientsDirectoryTableSkeleton rows={6} />
        </div>
        <ClientsMobileCardListSkeleton />
      </Card>
    </div>
  );
}

export function EmployeesPageSkeleton() {
  return (
    <div aria-busy aria-label="Loading team">
      <PageHeaderSkeleton titleWidth="w-40" descLines={2} />
      <div className="mb-4">
        <Skeleton className="h-10 w-40 rounded-md" aria-hidden />
      </div>
      <Card className="mb-0">
        <CardTitleSkeleton barClassName="w-20" />
        <div className="mt-3 hidden overflow-x-auto md:block">
          <EmployeesTeamTableSkeleton rows={6} />
        </div>
        <div className="mt-3 space-y-3 md:hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-lg border border-border p-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-24" />
              <Skeleton className="mt-3 h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function EmployeeAppContentSkeleton() {
  return (
    <div aria-busy aria-label="Loading jobs">
      <PageHeaderSkeleton titleWidth="w-32" descLines={1} />
      <Card className="mb-0">
        <CardTitleSkeleton barClassName="w-36" />
        <div className="mt-3 hidden overflow-x-auto md:block">
          <AdminJobTableSkeleton rows={6} />
        </div>
        <div className="mt-3 space-y-3 md:hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-lg border border-border p-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="mt-2 h-16 w-full rounded-md" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function ClientPortalJobsSkeleton() {
  return (
    <div className="mt-1 space-y-2" aria-busy aria-label="Loading bookings">
      <div className="hidden overflow-x-auto md:block">
        <ClientJobTableSkeleton rows={6} />
      </div>
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-lg border border-border p-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClientPortalLoadingSkeleton() {
  return (
    <div aria-busy aria-label="Loading bookings">
      <PageHeaderSkeleton titleWidth="w-44" descLines={1} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Skeleton className="h-11 w-36 rounded-md" aria-hidden />
      </div>
      <Card className="mb-0">
        <CardTitleSkeleton barClassName="w-28" />
        <ClientPortalJobsSkeleton />
      </Card>
    </div>
  );
}

export function ClientLocationPageSkeleton() {
  return (
    <div aria-busy aria-label="Loading location">
      <PageHeaderSkeleton titleWidth="w-48" descLines={2} />
      <div className="space-y-5">
        <Card className="mb-0">
          <CardTitleSkeleton barClassName="w-28" />
          <div className="mb-3 mt-2 space-y-2">
            <Skeleton className="h-3 w-full max-w-xl" aria-hidden />
            <Skeleton className="h-3 w-[85%] max-w-lg" aria-hidden />
          </div>
          <FormFieldSkeleton tall />
          <Skeleton className="mt-3 h-9 w-32 rounded-md" aria-hidden />
        </Card>
        <Card className="mb-0">
          <CardTitleSkeleton barClassName="w-28" />
          <Skeleton className="mt-3 h-72 w-full rounded-lg" aria-hidden />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Skeleton className="h-4 w-48 font-mono" aria-hidden />
            <Skeleton className="h-8 w-24 rounded-md" aria-hidden />
          </div>
        </Card>
        <div className="flex justify-end">
          <Skeleton className="h-11 w-40 rounded-md" aria-hidden />
        </div>
      </div>
    </div>
  );
}

/* —— Full-screen route fallbacks (lazy chunks) —— */

function LandingPageRouteSkeleton() {
  return (
    <div
      className="relative min-h-[100dvh] overflow-hidden bg-background"
      aria-busy
      aria-label="Loading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-[100px]" />
        <div className="absolute -right-32 top-32 h-[22rem] w-[22rem] rounded-full bg-highlight/10 blur-[90px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(97_139_121_/_0.08),transparent)]" />
      </div>
      <header className="relative z-10 border-b border-border/60 bg-surface/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-36 sm:h-9" />
          <Skeleton className="hidden h-3 w-32 sm:block" />
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-12 lg:pt-20">
        <div>
          <Skeleton className="h-3 w-56 sm:w-72" />
          <Skeleton className="mt-4 h-12 w-full max-w-lg sm:h-14" />
          <Skeleton className="mt-3 h-3.5 w-full max-w-xl" />
          <Skeleton className="mt-2 h-3.5 w-full max-w-lg" />
          <div className="mt-8 flex max-w-md flex-col gap-3">
            <Skeleton className="h-12 w-full rounded-md" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </div>
        </div>
        <div className="mt-12 lg:mt-0">
          <Skeleton className="mx-auto aspect-[4/3] w-full max-w-md rounded-2xl border border-border lg:max-w-none" />
        </div>
      </main>
    </div>
  );
}

function LoginChooserRouteSkeleton() {
  return (
    <div
      className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8"
      aria-busy
      aria-label="Loading"
    >
      <PageHeaderSkeleton titleWidth="w-28" descLines={1} />
      <div className="grid gap-4">
        <Card className="mb-0">
          <Skeleton className="h-4 w-32" aria-hidden />
          <Skeleton className="mt-2 h-3 w-full" aria-hidden />
          <Skeleton className="mt-2 h-3 w-[90%]" aria-hidden />
          <Skeleton className="mt-4 h-11 w-full rounded-md" aria-hidden />
        </Card>
        <Card className="mb-0">
          <Skeleton className="h-4 w-28" aria-hidden />
          <Skeleton className="mt-2 h-3 w-full" aria-hidden />
          <Skeleton className="mt-2 h-3 w-[88%]" aria-hidden />
          <Skeleton className="mt-4 h-11 w-full rounded-md" aria-hidden />
        </Card>
      </div>
      <Skeleton className="mx-auto mt-6 h-3 w-64" aria-hidden />
    </div>
  );
}

function AuthSignInRouteSkeleton() {
  return (
    <div
      className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8"
      aria-busy
      aria-label="Loading"
    >
      <PageHeaderSkeleton titleWidth="w-44" descLines={1} />
      <Card className="mb-0">
        <div className="space-y-4">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <Skeleton className="h-11 w-full rounded-md" aria-hidden />
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="mx-auto h-3 w-56" aria-hidden />
          <Skeleton className="mx-auto h-3 w-48" aria-hidden />
        </div>
      </Card>
    </div>
  );
}

function RegisterRouteSkeleton() {
  return (
    <div
      className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8"
      aria-busy
      aria-label="Loading"
    >
      <PageHeaderSkeleton titleWidth="w-56" descLines={1} />
      <Card className="mb-0">
        <div className="grid gap-4">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton tall />
          <Skeleton className="h-11 w-full rounded-md" aria-hidden />
        </div>
      </Card>
    </div>
  );
}

function ForgotPasswordRouteSkeleton() {
  return (
    <div
      className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8"
      aria-busy
      aria-label="Loading"
    >
      <PageHeaderSkeleton titleWidth="w-52" descLines={2} />
      <Card className="mb-0">
        <FormFieldSkeleton />
        <Skeleton className="mt-4 h-11 w-full rounded-md" aria-hidden />
      </Card>
    </div>
  );
}

function ResetPasswordRouteSkeleton() {
  return (
    <div
      className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8"
      aria-busy
      aria-label="Loading"
    >
      <PageHeaderSkeleton titleWidth="w-48" />
      <Card className="mb-0">
        <div className="space-y-4">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <Skeleton className="h-11 w-full rounded-md" aria-hidden />
        </div>
      </Card>
    </div>
  );
}

function AdminMainRouteSkeleton({ path }: { path: string }) {
  const p = path.replace(/\/$/, "") || "/dashboard";
  if (p.endsWith("/jobs")) {
    return <JobsContentSkeleton />;
  }
  if (p.endsWith("/clients")) {
    return <ClientsContentSkeleton />;
  }
  if (p.endsWith("/employees")) {
    return <EmployeesPageSkeleton />;
  }
  return <DashboardContentSkeleton />;
}

function ClientPortalRouteSkeleton({ path }: { path: string }) {
  if (path.includes("/location")) {
    return <ClientLocationPageSkeleton />;
  }
  return <ClientPortalLoadingSkeleton />;
}

/** Lazy-route Suspense: layout matches URL. */
export function RouteFallbackByPath() {
  const { pathname } = useLocation();
  const p = pathname;

  if (p === "/" || p === "")
    return <LandingPageRouteSkeleton />;
  if (p === "/login") return <LoginChooserRouteSkeleton />;
  if (p.startsWith("/login/client") || p.startsWith("/login/employee"))
    return <AuthSignInRouteSkeleton />;
  if (p === "/register") return <RegisterRouteSkeleton />;
  if (p === "/forgot-password") return <ForgotPasswordRouteSkeleton />;
  if (p === "/reset-password") return <ResetPasswordRouteSkeleton />;

  if (p === "/dashboard" || p.startsWith("/dashboard/")) {
    return (
      <AdminShellSkeleton>
        <AdminMainRouteSkeleton path={p} />
      </AdminShellSkeleton>
    );
  }
  if (p === "/app" || p.startsWith("/app/")) {
    return (
      <EmployeeShellSkeleton>
        <EmployeeAppContentSkeleton />
      </EmployeeShellSkeleton>
    );
  }
  if (p === "/portal" || p.startsWith("/portal/")) {
    return (
      <ClientShellSkeleton>
        <ClientPortalRouteSkeleton path={p} />
      </ClientShellSkeleton>
    );
  }

  return <LandingPageRouteSkeleton />;
}

/** Auth store not hydrated yet: same layouts as route fallback where possible. */
export function SessionLoadingSkeleton() {
  const { pathname } = useLocation();
  const p = pathname;

  if (p === "/" || p === "")
    return <LandingHydrateSkeleton className="min-h-screen" />;
  if (p === "/login") return <LoginChooserRouteSkeleton />;
  if (p.startsWith("/login/client") || p.startsWith("/login/employee"))
    return <AuthSignInRouteSkeleton />;
  if (p === "/register") return <RegisterRouteSkeleton />;
  if (p === "/forgot-password") return <ForgotPasswordRouteSkeleton />;
  if (p === "/reset-password") return <ResetPasswordRouteSkeleton />;

  if (p === "/dashboard" || p.startsWith("/dashboard/")) {
    return (
      <AdminShellSkeleton>
        <AdminMainRouteSkeleton path={p} />
      </AdminShellSkeleton>
    );
  }
  if (p === "/app" || p.startsWith("/app/")) {
    return (
      <EmployeeShellSkeleton>
        <EmployeeAppContentSkeleton />
      </EmployeeShellSkeleton>
    );
  }
  if (p === "/portal" || p.startsWith("/portal/")) {
    return (
      <ClientShellSkeleton>
        <ClientPortalRouteSkeleton path={p} />
      </ClientShellSkeleton>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4"
      aria-busy
      aria-label="Loading"
    >
      <Skeleton className="h-8 w-40" aria-hidden />
      <Skeleton className="h-3 w-52" aria-hidden />
    </div>
  );
}

/** Landing marketing page waiting on auth hydration. */
export function LandingHydrateSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("bg-background", className)} aria-busy aria-label="Loading">
      <LandingPageRouteSkeleton />
    </div>
  );
}

/* —— Deprecated aliases (keep exports stable where needed) —— */

/** @deprecated Use ClientPortalJobsSkeleton for the jobs card only. */
export function TableRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-11 w-full rounded-md" />
      ))}
    </div>
  );
}

/** @deprecated Use RouteFallbackByPath inside Router. */
export function RouteFallbackSkeleton() {
  return <RouteFallbackByPath />;
}

/** @deprecated Use SessionLoadingSkeleton for auth gates, or LandingHydrateSkeleton on marketing. */
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
        <Skeleton className="mx-auto h-10 w-48 rounded-lg" aria-hidden />
        <Skeleton className="h-3 w-full" aria-hidden />
        <Skeleton className="h-3 w-4/5" aria-hidden />
        <Skeleton className="mt-2 h-36 w-full rounded-lg" aria-hidden />
      </div>
    </div>
  );
}

/** @deprecated Use EmployeesPageSkeleton */
export function EmployeesTableSkeleton() {
  return <EmployeesPageSkeleton />;
}

/** @deprecated Use EmployeeAppContentSkeleton */
export function JobTableCardSkeleton(_props?: { titleWidth?: string }) {
  return <EmployeeAppContentSkeleton />;
}
