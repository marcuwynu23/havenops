import L from "leaflet";
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { cn } from "../../lib/cn";

const PIN_HTML =
  '<div style="width:16px;height:16px;border-radius:9999px;background:#618b79;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>';

function makeIcon() {
  return L.divIcon({
    className:
      "ho-leaflet-div-icon !flex !items-center !justify-center !border-0 !bg-transparent",
    html: PIN_HTML,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function MapViewSync({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center[0], center[1], zoom, map]);
  return null;
}

function MapClickPlace({
  onPlace,
}: {
  onPlace: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPlace(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export type LatLng = { lat: number; lng: number };

type Props = {
  className?: string;
  /** Pin position; null = no pin yet (tap map to place). */
  position: LatLng | null;
  onPositionChange: (lat: number, lng: number) => void;
  /** Used when there is no saved pin. */
  defaultCenter: [number, number];
  defaultZoomNoPin?: number;
  defaultZoomWithPin?: number;
};

export function LocationPickerMap({
  className,
  position,
  onPositionChange,
  defaultCenter,
  defaultZoomNoPin = 3,
  defaultZoomWithPin = 16,
}: Props) {
  const center: [number, number] = position
    ? [position.lat, position.lng]
    : defaultCenter;
  const zoom = position ? defaultZoomWithPin : defaultZoomNoPin;
  const icon = useMemo(() => makeIcon(), []);

  return (
    <div
      className={cn(
        "relative z-0 h-72 w-full overflow-hidden rounded-lg border border-border bg-surface",
        className,
      )}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        className="isolate h-full w-full [&_.leaflet-control-zoom]:border-border"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewSync center={center} zoom={zoom} />
        <MapClickPlace onPlace={onPositionChange} />
        {position ? (
          <Marker
            position={[position.lat, position.lng]}
            draggable
            icon={icon}
            eventHandlers={{
              dragend: (e) => {
                const ll = e.target.getLatLng();
                onPositionChange(ll.lat, ll.lng);
              },
            }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
