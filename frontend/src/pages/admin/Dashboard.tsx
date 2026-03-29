import { useMemo } from "react";
import JobTable from "../../components/JobTable";
import { DashboardContentSkeleton } from "../../components/skeletons/PageContentSkeletons";
import { Alert, Card, CardTitle, PageHeader, StatCard, StatsGrid } from "../../components/ui";
import {
  useClientsQuery,
  useEmployeesQuery,
  useJobsQuery,
} from "../../hooks/useHavenOpsQueries";
import { queryErrorMessage } from "../../lib/queryError";

export default function Dashboard() {
  const clientsQ = useClientsQuery();
  const employeesQ = useEmployeesQuery();
  const jobsQ = useJobsQuery();

  const clients = clientsQ.data ?? [];
  const employees = employeesQ.data ?? [];
  const jobs = jobsQ.data ?? [];

  const listError = queryErrorMessage(
    clientsQ.error,
    employeesQ.error,
    jobsQ.error,
  );

  const loading =
    clientsQ.isPending || employeesQ.isPending || jobsQ.isPending;

  const clientMap = useMemo(
    () => new Map(clients.map((c) => [c.id, c])),
    [clients],
  );

  const counts = useMemo(() => {
    const by: Record<string, number> = {};
    for (const j of jobs) {
      by[j.status] = (by[j.status] ?? 0) + 1;
    }
    return by;
  }, [jobs]);

  const recent = useMemo(() => {
    return [...jobs]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 12);
  }, [jobs]);

  return (
    <>
      <PageHeader title="Dashboard" />
      {listError ? <Alert className="mb-4">{listError}</Alert> : null}
      {loading ? (
        <DashboardContentSkeleton />
      ) : (
        <>
          <StatsGrid>
            <StatCard value={clients.length} label="Clients" />
            <StatCard
              value={employees.filter((e) => e.is_active).length}
              label="Active staff"
            />
            <StatCard value={jobs.length} label="All jobs" />
            <StatCard value={counts.in_progress ?? 0} label="In progress" />
            <StatCard value={counts.done ?? 0} label="Completed" />
          </StatsGrid>
          <Card>
            <CardTitle>Recent jobs</CardTitle>
            <JobTable
              jobs={recent}
              clients={clientMap}
              employees={employees}
              mode="admin"
            />
          </Card>
        </>
      )}
    </>
  );
}
