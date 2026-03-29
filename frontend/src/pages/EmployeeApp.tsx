import { useCallback, useEffect, useMemo, useState } from "react";
import type { Client, Job } from "../api";
import { getClients, getJobs } from "../api";
import JobTable from "../components/JobTable";
import { Alert, Card, CardTitle, PageHeader } from "../components/ui";

export default function EmployeeApp() {
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

  // Employees need client names for the table; API allows getClients only for admin.
  // If forbidden, JobTable still shows client_id.
  const employees: import("../api").Employee[] = [];

  return (
    <>
      <PageHeader
        title="My jobs"
        description="Jobs assigned to you. Update status as you work."
      />
      {error ? <Alert className="mb-4">{error}</Alert> : null}
      <Card>
        <CardTitle>Assigned work</CardTitle>
        <JobTable
          jobs={jobs}
          clients={clientMap}
          employees={employees}
          mode="employee"
          onChanged={load}
        />
      </Card>
    </>
  );
}
