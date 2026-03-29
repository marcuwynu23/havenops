import { useState } from "react";
import type { Client, Employee, Job, JobStatus } from "../api";
import { patchJobAssign, patchJobStatus } from "../api";
import {
  Alert,
  Button,
  DataField,
  DataFieldList,
  JobStatusBadge,
  Muted,
  RowActions,
  Select,
  Table,
  TableBody,
  TableDesktop,
  TableHead,
  TableMobileCard,
  TableMobileList,
  TableRow,
  Td,
  Th,
} from "./ui";

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

type Props = {
  jobs: Job[];
  clients: Map<string, Client>;
  employees: Employee[];
  mode: "admin" | "employee" | "client";
  onChanged?: () => void;
};

const nextEmployeeActions: Partial<Record<JobStatus, JobStatus>> = {
  assigned: "in_progress",
  in_progress: "done",
};

export default function JobTable({
  jobs,
  clients,
  employees,
  mode,
  onChanged,
}: Props) {
  const [actionError, setActionError] = useState<string | null>(null);
  const activeEmps = employees.filter((e) => e.is_active);

  async function setStatus(id: string, status: JobStatus) {
    setActionError(null);
    try {
      await patchJobStatus(id, status);
      onChanged?.();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function assign(id: string, employeeId: string) {
    setActionError(null);
    try {
      await patchJobAssign(id, employeeId || null);
      onChanged?.();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Assign failed");
    }
  }

  if (jobs.length === 0) {
    return <Muted>No jobs yet.</Muted>;
  }

  const showActions = mode !== "client";

  return (
    <>
      {actionError ? (
        <Alert className="mb-3">{actionError}</Alert>
      ) : null}
      <TableDesktop>
        <Table>
          <TableHead>
            <TableRow>
              <Th>When</Th>
              <Th>Client</Th>
              <Th>Service</Th>
              {mode !== "client" ? <Th>Assignee</Th> : null}
              <Th>Status</Th>
              {showActions ? (
                <Th>{mode === "admin" ? "Actions" : "Update"}</Th>
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((j) => {
              const client = clients.get(j.client_id);
              const assignee = j.assigned_employee_id
                ? employees.find((e) => e.id === j.assigned_employee_id)
                : null;
              const next = nextEmployeeActions[j.status];
              const canEmployeeAdvance =
                mode === "employee" &&
                next &&
                j.status !== "done" &&
                j.status !== "cancelled";

              return (
                <TableRow key={j.id}>
                  <Td>{formatWhen(j.scheduled_at)}</Td>
                  <Td>{client?.name ?? j.client_id}</Td>
                  <Td>{j.service_type}</Td>
                  {mode !== "client" ? (
                    <Td>{assignee?.name ?? "—"}</Td>
                  ) : null}
                  <Td>
                    <JobStatusBadge status={j.status} />
                  </Td>
                  {showActions ? (
                    <Td>
                      {mode === "admin" ? (
                        <RowActions>
                          <Select
                            aria-label="Reassign"
                            className="max-w-40 py-1.5 text-xs"
                            value={j.assigned_employee_id ?? ""}
                            onChange={(e) => assign(j.id, e.target.value)}
                            disabled={
                              j.status === "done" || j.status === "cancelled"
                            }
                          >
                            <option value="">Unassigned</option>
                            {activeEmps.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.name}
                              </option>
                            ))}
                          </Select>
                          {j.status !== "done" && j.status !== "cancelled" ? (
                            <>
                              {j.status === "assigned" ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setStatus(j.id, "in_progress")
                                  }
                                >
                                  In progress
                                </Button>
                              ) : null}
                              {j.status === "in_progress" ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => setStatus(j.id, "done")}
                                >
                                  Done
                                </Button>
                              ) : null}
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => setStatus(j.id, "cancelled")}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : null}
                        </RowActions>
                      ) : (
                        <RowActions>
                          {canEmployeeAdvance ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => next && setStatus(j.id, next)}
                            >
                              {next === "done" ? "Mark done" : "Start job"}
                            </Button>
                          ) : null}
                        </RowActions>
                      )}
                    </Td>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableDesktop>

      <TableMobileList>
        {jobs.map((j) => {
          const client = clients.get(j.client_id);
          const assignee = j.assigned_employee_id
            ? employees.find((e) => e.id === j.assigned_employee_id)
            : null;
          const next = nextEmployeeActions[j.status];
          const canEmployeeAdvance =
            mode === "employee" &&
            next &&
            j.status !== "done" &&
            j.status !== "cancelled";

          return (
            <TableMobileCard key={j.id}>
              <DataFieldList>
                <DataField label="When">{formatWhen(j.scheduled_at)}</DataField>
                <DataField label="Client">
                  {client?.name ?? j.client_id}
                </DataField>
                <DataField label="Service">{j.service_type}</DataField>
                {mode !== "client" ? (
                  <DataField label="Assignee">
                    {assignee?.name ?? "—"}
                  </DataField>
                ) : null}
                <DataField label="Status">
                  <JobStatusBadge status={j.status} />
                </DataField>
              </DataFieldList>
              {showActions ? (
                <div className="mt-4 border-t border-border pt-4">
                  {mode === "admin" ? (
                    <RowActions className="flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                      <Select
                        aria-label="Reassign"
                        className="w-full max-w-full py-2 text-sm sm:max-w-[16rem] sm:py-1.5 sm:text-xs"
                        value={j.assigned_employee_id ?? ""}
                        onChange={(e) => assign(j.id, e.target.value)}
                        disabled={
                          j.status === "done" || j.status === "cancelled"
                        }
                      >
                        <option value="">Unassigned</option>
                        {activeEmps.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name}
                          </option>
                        ))}
                      </Select>
                      {j.status !== "done" && j.status !== "cancelled" ? (
                        <div className="flex flex-wrap gap-2">
                          {j.status === "assigned" ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="flex-1 min-[400px]:flex-none"
                              onClick={() => setStatus(j.id, "in_progress")}
                            >
                              In progress
                            </Button>
                          ) : null}
                          {j.status === "in_progress" ? (
                            <Button
                              type="button"
                              size="sm"
                              className="flex-1 min-[400px]:flex-none"
                              onClick={() => setStatus(j.id, "done")}
                            >
                              Done
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            className="flex-1 min-[400px]:flex-none"
                            onClick={() => setStatus(j.id, "cancelled")}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : null}
                    </RowActions>
                  ) : (
                    <RowActions className="flex-col items-stretch gap-2">
                      {canEmployeeAdvance ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => next && setStatus(j.id, next)}
                        >
                          {next === "done" ? "Mark done" : "Start job"}
                        </Button>
                      ) : null}
                    </RowActions>
                  )}
                </div>
              ) : null}
            </TableMobileCard>
          );
        })}
      </TableMobileList>
    </>
  );
}
