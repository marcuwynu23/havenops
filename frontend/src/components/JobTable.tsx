import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Client, Employee, Job, JobStatus } from "../api";
import { patchJobAssign, patchJobStatus } from "../api";
import { JobSiteBlock } from "./maps/JobSiteBlock";
import { queryKeys } from "../lib/queryKeys";
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
  /** Optional extra callback after a successful job mutation (cache is also invalidated). */
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
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const activeEmps = employees.filter((e) => e.is_active);

  const afterJobWrite = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    onChanged?.();
  };

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: JobStatus;
    }) => patchJobStatus(id, status),
    onMutate: () => setActionError(null),
    onSuccess: afterJobWrite,
    onError: (e) =>
      setActionError(e instanceof Error ? e.message : "Update failed"),
  });

  const assignMutation = useMutation({
    mutationFn: ({
      id,
      employeeId,
    }: {
      id: string;
      employeeId: string | null;
    }) => patchJobAssign(id, employeeId),
    onMutate: () => setActionError(null),
    onSuccess: afterJobWrite,
    onError: (e) =>
      setActionError(e instanceof Error ? e.message : "Assign failed"),
  });

  function setStatus(id: string, status: JobStatus) {
    statusMutation.mutate({ id, status });
  }

  function assign(id: string, employeeId: string) {
    assignMutation.mutate({ id, employeeId: employeeId || null });
  }

  if (jobs.length === 0) {
    return (
      <Muted>
        {mode === "client" ? "No bookings yet." : "No jobs yet."}
      </Muted>
    );
  }

  const showActions = mode !== "client";
  const showSite = mode !== "client";
  const mutating = statusMutation.isPending || assignMutation.isPending;

  return (
    <>
      {actionError ? (
        <Alert className="mb-3">{actionError}</Alert>
      ) : null}
      <TableDesktop>
        <Table className="w-full min-w-[56rem] table-fixed">
          <TableHead>
            <TableRow>
              <Th className="w-[11rem]">When</Th>
              <Th className="w-[9rem]">Client</Th>
              {showSite ? (
                <Th className="w-[11rem] sm:w-[12rem]">Site</Th>
              ) : null}
              <Th className="min-w-0">Service</Th>
              {mode !== "client" ? (
                <Th className="w-[8.5rem]">Assignee</Th>
              ) : null}
              <Th className="w-[7.5rem]">Status</Th>
              {showActions ? (
                <Th className="w-[14rem] sm:w-[15rem]">
                  {mode === "admin" ? "Actions" : "Update"}
                </Th>
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
                  <Td className="align-top whitespace-normal break-words">
                    {formatWhen(j.scheduled_at)}
                  </Td>
                  <Td className="align-top break-words">
                    {client?.name ?? j.client_id}
                  </Td>
                  {showSite ? (
                    <Td className="align-top">
                      <JobSiteBlock
                        client={client}
                        mapClassName="!max-w-full !aspect-auto h-28 max-h-28 w-full"
                      />
                    </Td>
                  ) : null}
                  <Td className="align-top break-words">{j.service_type}</Td>
                  {mode !== "client" ? (
                    <Td className="align-top break-words">
                      {assignee?.name ?? "—"}
                    </Td>
                  ) : null}
                  <Td className="align-top">
                    <JobStatusBadge status={j.status} />
                  </Td>
                  {showActions ? (
                    <Td className="align-top">
                      {mode === "admin" ? (
                        <RowActions>
                          <Select
                            aria-label="Reassign"
                            className="max-w-40 py-1.5 text-xs"
                            value={j.assigned_employee_id ?? ""}
                            onChange={(e) => assign(j.id, e.target.value)}
                            disabled={
                              mutating ||
                              j.status === "done" ||
                              j.status === "cancelled"
                            }
                            options={[
                              { value: "", label: "Unassigned" },
                              ...activeEmps.map((e) => ({
                                value: e.id,
                                label: e.name,
                              })),
                            ]}
                          />
                          {j.status !== "done" && j.status !== "cancelled" ? (
                            <>
                              {j.status === "assigned" ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={mutating}
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
                                  disabled={mutating}
                                  onClick={() => setStatus(j.id, "done")}
                                >
                                  Done
                                </Button>
                              ) : null}
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                disabled={mutating}
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
                              disabled={mutating}
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
                {showSite ? (
                  <DataField label="Site">
                    <JobSiteBlock
                      client={client}
                      mapClassName="!aspect-auto h-32 w-full max-w-none"
                    />
                  </DataField>
                ) : null}
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
                          mutating ||
                          j.status === "done" ||
                          j.status === "cancelled"
                        }
                        options={[
                          { value: "", label: "Unassigned" },
                          ...activeEmps.map((e) => ({
                            value: e.id,
                            label: e.name,
                          })),
                        ]}
                      />
                      {j.status !== "done" && j.status !== "cancelled" ? (
                        <div className="flex flex-wrap gap-2">
                          {j.status === "assigned" ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="flex-1 min-[400px]:flex-none"
                              disabled={mutating}
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
                              disabled={mutating}
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
                            disabled={mutating}
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
                          disabled={mutating}
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
