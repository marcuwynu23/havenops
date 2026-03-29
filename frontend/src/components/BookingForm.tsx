import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { createJob } from "../api";
import { queryKeys } from "../lib/queryKeys";
import {
  Alert,
  Button,
  Field,
  FormGrid,
  Input,
  Textarea,
} from "./ui";

type Props = {
  onCreated?: () => void;
};

export default function BookingForm({ onCreated }: Props) {
  const queryClient = useQueryClient();
  const [serviceType, setServiceType] = useState("Standard clean");
  const [scheduledLocal, setScheduledLocal] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createJob,
    onMutate: () => setError(null),
    onSuccess: async () => {
      setNotes("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      onCreated?.();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Could not create job");
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const d = new Date(scheduledLocal);
    mutation.mutate({
      client_id: "",
      service_type: serviceType,
      scheduled_at: d.toISOString(),
      notes: notes || undefined,
    });
  }

  return (
    <FormGrid onSubmit={onSubmit}>
      {error ? <Alert className="col-span-full">{error}</Alert> : null}
      <Field label="Service type" htmlFor="book-service">
        <Input
          id="book-service"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          required
        />
      </Field>
      <Field label="Scheduled time" htmlFor="book-when">
        <Input
          id="book-when"
          type="datetime-local"
          value={scheduledLocal}
          onChange={(e) => setScheduledLocal(e.target.value)}
          required
        />
      </Field>
      <Field label="Notes" htmlFor="book-notes">
        <Textarea
          id="book-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
      <Button type="submit" variant="highlight" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating…" : "Request booking"}
      </Button>
    </FormGrid>
  );
}
