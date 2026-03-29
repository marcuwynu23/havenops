import { useMemo } from "react";
import JobTable from "../../components/JobTable";
import { JobsContentSkeleton } from "../../components/skeletons/PageContentSkeletons";
import { Alert, Card, CardTitle, PageHeader } from "../../components/ui";
import {
  useClientsQuery,
  useEmployeesQuery,
  useJobsQuery,
} from "../../hooks/useHavenOpsQueries";
import { queryErrorMessage } from "../../lib/queryError";

export default function JobsPage() {
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

  return (
    <>
      <PageHeader title="Jobs" />
      {listError ? <Alert className="mb-4">{listError}</Alert> : null}
      {loading ? (
        <JobsContentSkeleton />
      ) : (
        <>
          <p className="mb-4 text-xs leading-relaxed text-muted sm:text-sm sm:leading-normal">
            Bookings are created by clients from their portal. Jobs without an
            assignee stay pending until someone is free in that time window;
            assign manually if needed.
          </p>
          <Card className="overflow-hidden">
            <CardTitle>All jobs</CardTitle>
            <div className="-mx-4 w-[calc(100%+2rem)] overflow-x-auto sm:-mx-5 sm:w-[calc(100%+2.5rem)]">
              <div className="min-w-0 px-4 sm:px-5">
                <JobTable
                  jobs={jobs}
                  clients={clientMap}
                  employees={employees}
                  mode="admin"
                />
              </div>
            </div>
          </Card>
        </>
      )}
    </>
  );
}
