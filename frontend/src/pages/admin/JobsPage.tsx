import { useEffect, useMemo } from "react";
import JobTable from "../../components/JobTable";
import { Alert, Card, CardTitle, PageHeader } from "../../components/ui";
import { useHavenOpsStore } from "../../store/havenopsStore";

export default function JobsPage() {
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

  return (
    <>
      <PageHeader title="Jobs" />
      {listError ? <Alert className="mb-4">{listError}</Alert> : null}
      <p className="mb-4 text-xs leading-relaxed text-muted sm:text-sm sm:leading-normal">
        Bookings are created by clients from their portal. Jobs without an
        assignee stay pending until someone is free in that time window; assign
        manually if needed.
      </p>
      <Card>
        <CardTitle>All jobs</CardTitle>
        <JobTable
          jobs={jobs}
          clients={clientMap}
          employees={employees}
          mode="admin"
          onChanged={refreshAll}
        />
      </Card>
    </>
  );
}
