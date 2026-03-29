import L from "leaflet";
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
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
    map.setView(center, zoom, { animate: false });
  }, [center[0], center[1], zoom, map]);
  return null;
}

type Props = {
  latitude: number;
  longitude: number;
  className?: string;
  title?: string;
};

const PREVIEW_ZOOM = 15;

export function StaticMapEmbed({
  latitude,
  longitude,
  className,
  title = "Job location map",
}: Props) {
  const center: [number, number] = [latitude, longitude];
  const icon = useMemo(() => makeIcon(), []);

  return (
    <div
      className={cn(
        "aspect-[4/3] w-full max-w-md overflow-hidden rounded-md border border-border bg-surface",
        className,
      )}
    >
      <MapContainer
        aria-label={title}
        center={center}
        zoom={PREVIEW_ZOOM}
        className="isolate h-full w-full [&_.leaflet-control-attribution]:hidden"
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapViewSync center={center} zoom={PREVIEW_ZOOM} />
        <Marker position={center} icon={icon} />
      </MapContainer>
    </div>
  );
}
