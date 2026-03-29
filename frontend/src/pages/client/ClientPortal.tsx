import { useMemo, useState } from "react";
import BookingForm from "../../components/BookingForm";
import JobTable from "../../components/JobTable";
import { Modal } from "../../components/Modal";
import { ClientPortalJobsSkeleton } from "../../components/skeletons/PageContentSkeletons";
import { Alert, Button, Card, CardTitle, PageHeader } from "../../components/ui";
import {
  useClientsQuery,
  useJobsQuery,
} from "../../hooks/useHavenOpsQueries";
import { queryErrorMessage } from "../../lib/queryError";

export default function ClientPortal() {
  const jobsQ = useJobsQuery();
  const clientsQ = useClientsQuery();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

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
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="highlight"
          className="min-h-11 touch-manipulation"
          onClick={() => setBookingModalOpen(true)}
        >
          New booking
        </Button>
      </div>
      {error ? <Alert className="mb-4">{error}</Alert> : null}
      <Card>
        <CardTitle>Your jobs</CardTitle>
        {loading ? (
          <div aria-busy aria-label="Loading jobs">
            <ClientPortalJobsSkeleton />
          </div>
        ) : (
          <JobTable
            jobs={jobs}
            clients={clientMap}
            employees={[]}
            mode="client"
          />
        )}
      </Card>

      <Modal
        open={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title="New booking"
        description="Choose a service type, time, and optional notes. We’ll confirm your visit on the schedule you pick."
        size="md"
      >
        <BookingForm
          onCreated={() => setBookingModalOpen(false)}
          onCancel={() => setBookingModalOpen(false)}
        />
      </Modal>
    </>
  );
}
