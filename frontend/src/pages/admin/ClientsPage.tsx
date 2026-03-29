import {
  Alert,
  Card,
  CardTitle,
  DataField,
  DataFieldList,
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
import { useClientsQuery } from "../../hooks/useHavenOpsQueries";
import { queryErrorMessage } from "../../lib/queryError";

export default function ClientsPage() {
  const clientsQ = useClientsQuery();
  const clients = clientsQ.data ?? [];
  const listError = queryErrorMessage(clientsQ.error);

  return (
    <>
      <PageHeader title="Clients" />
      {listError ? <Alert className="mb-4">{listError}</Alert> : null}
      {clientsQ.isPending ? (
        <Muted className="mb-4">Loading clients…</Muted>
      ) : null}
      <Card>
        <CardTitle>Directory</CardTitle>
        <p className="mb-4 text-xs leading-relaxed text-muted sm:text-sm">
          New clients join through self-service registration. You cannot add
          clients from the admin console.
        </p>
        {clients.length === 0 ? (
          <Muted>No registered clients yet.</Muted>
        ) : (
          <>
            <TableDesktop>
              <Table>
                <TableHead>
                  <TableRow>
                    <Th>Name</Th>
                    <Th>Phone</Th>
                    <Th>Address</Th>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((c) => (
                    <TableRow key={c.id}>
                      <Td>{c.name}</Td>
                      <Td>{c.phone || "—"}</Td>
                      <Td>{c.address || "—"}</Td>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableDesktop>
            <TableMobileList>
              {clients.map((c) => (
                <TableMobileCard key={c.id}>
                  <DataFieldList>
                    <DataField label="Name">{c.name}</DataField>
                    <DataField label="Phone">{c.phone || "—"}</DataField>
                    <DataField label="Address">{c.address || "—"}</DataField>
                  </DataFieldList>
                </TableMobileCard>
              ))}
            </TableMobileList>
          </>
        )}
      </Card>
    </>
  );
}
