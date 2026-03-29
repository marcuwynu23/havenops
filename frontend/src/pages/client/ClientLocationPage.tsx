import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  geocodeForward,
  geocodeReverse,
  patchClientMe,
} from "../../api";
import { LocationPickerMap } from "../../components/maps/LocationPickerMap";
import {
  Alert,
  Button,
  Card,
  CardTitle,
  Field,
  Muted,
  PageHeader,
  Textarea,
} from "../../components/ui";
import { ClientLocationPageSkeleton } from "../../components/skeletons/PageContentSkeletons";
import { useClientsQuery } from "../../hooks/useHavenOpsQueries";
import { queryKeys } from "../../lib/queryKeys";

const MAP_FALLBACK_CENTER: [number, number] = [39.8283, -98.5795];

export default function ClientLocationPage() {
  const queryClient = useQueryClient();
  const clientsQ = useClientsQuery();
  const me = clientsQ.data?.[0];

  const [address, setAddress] = useState("");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [hadServerCoords, setHadServerCoords] = useState(false);
  const [suggestedAddress, setSuggestedAddress] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;
    setAddress(me.address ?? "");
    if (
      me.latitude != null &&
      me.longitude != null &&
      Number.isFinite(me.latitude) &&
      Number.isFinite(me.longitude)
    ) {
      setPosition({ lat: me.latitude, lng: me.longitude });
      setHadServerCoords(true);
    } else {
      setPosition(null);
      setHadServerCoords(false);
    }
    setSuggestedAddress(null);
    setFormError(null);
  }, [me?.id, me?.address, me?.latitude, me?.longitude]);

  const onMarkerOrMap = useCallback((lat: number, lng: number) => {
    setPosition({ lat, lng });
    setSuggestedAddress(null);
    setGeoError(null);
    void (async () => {
      try {
        const r = await geocodeReverse(lat, lng);
        if (r.display_name?.trim()) {
          setSuggestedAddress(r.display_name.trim());
        }
      } catch {
        /* optional hint */
      }
    })();
  }, []);

  const saveMutation = useMutation({
    mutationFn: patchClientMe,
    onSuccess: async () => {
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    },
    onError: (e) => {
      setFormError(e instanceof Error ? e.message : "Could not save");
    },
  });

  function onSave(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const trimmed = address.trim();
    const hasPin =
      position != null &&
      Number.isFinite(position.lat) &&
      Number.isFinite(position.lng);

    if (hasPin) {
      saveMutation.mutate({
        address: trimmed,
        latitude: position.lat,
        longitude: position.lng,
      });
      return;
    }
    if (hadServerCoords) {
      saveMutation.mutate({ address: trimmed, clear_coordinates: true });
      return;
    }
    saveMutation.mutate({ address: trimmed });
  }

  async function onGeocodeAddress() {
    setGeoError(null);
    const q = address.trim();
    if (!q) {
      setGeoError("Enter an address first.");
      return;
    }
    try {
      const r = await geocodeForward(q);
      onMarkerOrMap(r.lat, r.lon);
    } catch (e) {
      setGeoError(e instanceof Error ? e.message : "Could not find that address");
    }
  }

  if (clientsQ.isPending) {
    return <ClientLocationPageSkeleton />;
  }

  if (!me) {
    return (
      <Alert>
        We could not load your profile. Try signing out and back in.
      </Alert>
    );
  }

  return (
    <>
      <PageHeader
        title="Home location"
        description="Update the address we use for service visits and set a precise map pin (WGS84). Crew see this only for jobs you book."
      />

      <form onSubmit={onSave} className="space-y-5">
        {formError ? <Alert>{formError}</Alert> : null}
        {geoError ? <Alert variant="warning">{geoError}</Alert> : null}

        <Card>
          <CardTitle>Address</CardTitle>
          <Muted className="mb-3 text-xs sm:text-sm">
            Same field as when you registered — building, street, city, and any
            gate or unit details that help us arrive smoothly.
          </Muted>
          <Field label="Home address" htmlFor="client-address">
            <Textarea
              id="client-address"
              value={address}
              onChange={(ev) => setAddress(ev.target.value)}
              rows={4}
              className="min-h-[5.5rem] text-base sm:text-sm"
              placeholder="e.g. 42 Maple St, Springfield"
            />
          </Field>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="subtle"
              size="sm"
              className="min-h-11"
              onClick={() => void onGeocodeAddress()}
            >
              Find on map
            </Button>
          </div>
        </Card>

        <Card>
          <CardTitle>Map pin</CardTitle>
          <Muted className="mb-3 text-xs sm:text-sm">
            Tap the map or drag the pin to fine-tune. Coordinates update in real
            time; we can suggest an address line from the pin (optional).
          </Muted>
          <LocationPickerMap
            position={position}
            onPositionChange={onMarkerOrMap}
            defaultCenter={
              position
                ? [position.lat, position.lng]
                : MAP_FALLBACK_CENTER
            }
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Muted className="font-mono text-xs">
              {position
                ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`
                : "No pin — tap the map to place one"}
            </Muted>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-9"
              onClick={() => {
                setPosition(null);
                setSuggestedAddress(null);
              }}
            >
              Clear pin
            </Button>
          </div>
          {suggestedAddress ? (
            <div className="mt-3 rounded-md border border-border bg-overlay-subtle p-3 text-xs">
              <p className="text-muted">Suggested from pin:</p>
              <p className="mt-1 text-foreground">{suggestedAddress}</p>
              <Button
                type="button"
                variant="subtle"
                size="sm"
                className="mt-2 min-h-9"
                onClick={() => {
                  setAddress(suggestedAddress);
                  setSuggestedAddress(null);
                }}
              >
                Use for address
              </Button>
            </div>
          ) : null}
        </Card>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="submit"
            variant="primary"
            className="min-h-11 w-full sm:w-auto"
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving…" : "Save location"}
          </Button>
        </div>
      </form>
    </>
  );
}
