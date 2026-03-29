import { useMemo } from "react";
import BookingForm from "../../components/BookingForm";
import JobTable from "../../components/JobTable";
import { Alert, Card, CardTitle, Muted, PageHeader } from "../../components/ui";
import {
  useClientsQuery,
  useJobsQuery,
} from "../../hooks/useHavenOpsQueries";
import { queryErrorMessage } from "../../lib/queryError";

export default function ClientPortal() {
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

  return (
    <>
      <PageHeader
        title="My bookings"
        description="Request service and track your jobs."
      />
      {error ? <Alert className="mb-4">{error}</Alert> : null}
      {loading ? <Muted className="mb-4">Loading…</Muted> : null}
      <Card>
        <CardTitle>New booking</CardTitle>
        <BookingForm />
      </Card>
      <Card>
        <CardTitle>Your jobs</CardTitle>
        <JobTable
          jobs={jobs}
          clients={clientMap}
          employees={[]}
          mode="client"
        />
      </Card>
    </>
  );
}
