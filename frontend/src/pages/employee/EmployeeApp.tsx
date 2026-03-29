import { useMemo } from "react";
import JobTable from "../../components/JobTable";
import { EmployeeAppContentSkeleton } from "../../components/skeletons/PageContentSkeletons";
import { Alert, Card, CardTitle, PageHeader } from "../../components/ui";
import {
  useClientsQuery,
  useJobsQuery,
} from "../../hooks/useHavenOpsQueries";
import { queryErrorMessage } from "../../lib/queryError";

export default function EmployeeApp() {
  const jobsQ = useJobsQuery();
  const clientsQ = useClientsQuery();

  const jobs = jobsQ.data ?? [];
  const clients = clientsQ.data ?? [];

  const error = queryErrorMessage(jobsQ.error, clientsQ.error);
  const loading = jobsQ.isPending || clientsQ.isPending;

  const clientMap = useMemo(
    () => new Map(clients.map((c) => [c.id, c])),
    [clients],
  );

  const employees: import("../../api").Employee[] = [];

  return (
    <>
      <PageHeader
        title="My jobs"
        description="Jobs assigned to you. Update status as you work."
      />
      {error ? <Alert className="mb-4">{error}</Alert> : null}
      {loading ? (
        <EmployeeAppContentSkeleton />
      ) : (
        <Card>
          <CardTitle>Assigned work</CardTitle>
          <JobTable
            jobs={jobs}
            clients={clientMap}
            employees={employees}
            mode="employee"
          />
        </Card>
      )}
    </>
  );
}
