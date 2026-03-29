import { useCallback, useEffect, useMemo, useState } from "react";
import type { Client, Job } from "../../api";
import { getClients, getJobs } from "../../api";
import BookingForm from "../../components/BookingForm";
import JobTable from "../../components/JobTable";
import { Alert, Card, CardTitle, PageHeader } from "../../components/ui";

export default function ClientPortal() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [j, c] = await Promise.all([getJobs(), getClients()]);
      setJobs(j);
      setClients(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
      <Card>
        <CardTitle>New booking</CardTitle>
        <BookingForm onCreated={load} />
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
