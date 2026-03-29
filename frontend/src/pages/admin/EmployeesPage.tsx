import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import type { Employee } from "../../api";
import { createEmployee, setEmployeeActive } from "../../api";
import { Modal } from "../../components/Modal";
import { EmployeesPageSkeleton } from "../../components/skeletons/PageContentSkeletons";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardTitle,
  DataField,
  DataFieldList,
  Field,
  FormGrid,
  Input,
  Muted,
  PageHeader,
  Table,
  TableBody,
  TableDesktop,
  TableHead,
  TableMobileCard,
  TableMobileList,
  TableRow,
  Td,
  Th,
} from "../../components/ui";
import { useEmployeesQuery } from "../../hooks/useHavenOpsQueries";
import { queryErrorMessage } from "../../lib/queryError";
import { queryKeys } from "../../lib/queryKeys";

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const employeesQ = useEmployeesQuery();
  const employees = employeesQ.data ?? [];
  const listError = queryErrorMessage(employeesQ.error);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onMutate: () => setCreateError(null),
    onSuccess: async () => {
      resetCreateForm();
      setModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
    onError: (err) => {
      setCreateError(
        err instanceof Error ? err.message : "Could not create",
      );
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => setEmployeeActive(id, is_active),
    onMutate: () => setToggleError(null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
    onError: (err) => {
      setToggleError(err instanceof Error ? err.message : "Update failed");
    },
  });

  function resetCreateForm() {
    setName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setCreateError(null);
  }

  function closeModal() {
    setModalOpen(false);
    resetCreateForm();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      name,
      phone,
      email,
      password,
      is_active: true,
    });
  }

  function toggle(emp: Employee) {
    toggleMutation.mutate({ id: emp.id, is_active: !emp.is_active });
  }

  return (
    <>
      <PageHeader
        title="Employees"
        description="Staff accounts can only be created here (admin). They sign in with the email and password you set."
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() => {
            setToggleError(null);
            setCreateError(null);
            setModalOpen(true);
          }}
        >
          Add employee
        </Button>
      </div>
      {listError ? <Alert className="mb-4">{listError}</Alert> : null}
      {toggleError ? <Alert className="mb-4">{toggleError}</Alert> : null}
      {employeesQ.isPending ? (
        <EmployeesPageSkeleton />
      ) : (
        <Card>
          <CardTitle>Team</CardTitle>
          {employees.length === 0 ? (
            <Muted>No employees yet. Use Add employee to invite staff.</Muted>
          ) : (
          <>
            <TableDesktop>
              <Table>
                <TableHead>
                  <TableRow>
                    <Th>Name</Th>
                    <Th>Phone</Th>
                    <Th>Status</Th>
                    <Th />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((e) => (
                    <TableRow key={e.id}>
                      <Td>{e.name}</Td>
                      <Td>{e.phone || "—"}</Td>
                      <Td>
                        <Badge variant={e.is_active ? "success" : "danger"}>
                          {e.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggle(e)}
                          disabled={toggleMutation.isPending}
                        >
                          {e.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </Td>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableDesktop>
            <TableMobileList>
              {employees.map((e) => (
                <TableMobileCard key={e.id}>
                  <DataFieldList>
                    <DataField label="Name">{e.name}</DataField>
                    <DataField label="Phone">{e.phone || "—"}</DataField>
                    <DataField label="Status">
                      <Badge variant={e.is_active ? "success" : "danger"}>
                        {e.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </DataField>
                  </DataFieldList>
                  <div className="mt-4 border-t border-border pt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => toggle(e)}
                      disabled={toggleMutation.isPending}
                    >
                      {e.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </TableMobileCard>
              ))}
            </TableMobileList>
          </>
        )}
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Add employee"
        description="They will sign in with the work email and initial password you set below."
        size="md"
      >
        <FormGrid onSubmit={onSubmit}>
          {createError ? (
            <Alert className="col-span-full">{createError}</Alert>
          ) : null}
          <Field label="Name" htmlFor="emp-name">
            <Input
              id="emp-name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              required
              autoFocus
            />
          </Field>
          <Field label="Work email (login)" htmlFor="emp-email">
            <Input
              id="emp-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              required
            />
          </Field>
          <Field label="Initial password (min 8)" htmlFor="emp-password">
            <Input
              id="emp-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              minLength={8}
              required
            />
          </Field>
          <Field label="Phone" htmlFor="emp-phone">
            <Input
              id="emp-phone"
              value={phone}
              onChange={(ev) => setPhone(ev.target.value)}
            />
          </Field>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving…" : "Create employee"}
            </Button>
          </div>
        </FormGrid>
      </Modal>
    </>
  );
}
