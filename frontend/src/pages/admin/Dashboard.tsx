import { useEffect, useMemo } from "react";
import JobTable from "../../components/JobTable";
import {
  Alert,
  Card,
  CardTitle,
  PageHeader,
  StatCard,
  StatsGrid,
} from "../../components/ui";
import { useHavenOpsStore } from "../../store/havenopsStore";

export default function Dashboard() {
  const jobs = useHavenOpsStore((s) => s.jobs);
  const clients = useHavenOpsStore((s) => s.clients);
  const employees = useHavenOpsStore((s) => s.employees);
  const listError = useHavenOpsStore((s) => s.listError);
  const fetchLists = useHavenOpsStore((s) => s.fetchLists);
  const refreshAll = useHavenOpsStore((s) => s.refreshAll);

  useEffect(() => {
    void fetchLists();
  }, [fetchLists]);

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
          onChanged={refreshAll}
        />
      </Card>
    </>
  );
}
