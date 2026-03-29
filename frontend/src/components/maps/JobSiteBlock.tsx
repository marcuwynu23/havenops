import type { Client } from "../../api";
import {
  appleMapsDirectionsUrl,
  googleDirectionsUrl,
} from "../../lib/mapUrls";
import { buttonClassName } from "../ui/Button";
import { Muted } from "../ui/Muted";
import { StaticMapEmbed } from "./StaticMapEmbed";

function hasCoords(c: Client): c is Client & { latitude: number; longitude: number } {
  const { latitude: lat, longitude: lon } = c;
  return (
    typeof lat === "number" &&
    typeof lon === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lon)
  );
}

type Props = {
  client: Client | undefined;
  /** Narrow map height in dense tables. */
  mapClassName?: string;
};

export function JobSiteBlock({ client, mapClassName }: Props) {
  if (!client) {
    return <span className="text-muted">—</span>;
  }
  const addr = client.address?.trim() ?? "";
  const coordsOk = hasCoords(client);

  return (
    <div className="max-w-[14rem] space-y-2 text-left sm:max-w-[16rem]">
      {addr ? (
        <p className="text-xs leading-snug text-foreground">{addr}</p>
      ) : (
        <Muted className="text-xs">No address on file</Muted>
      )}
      {coordsOk ? (
        <>
          <p className="font-mono text-[0.65rem] leading-tight text-muted sm:text-xs">
            WGS84 {client.latitude.toFixed(6)}, {client.longitude.toFixed(6)}
          </p>
          <StaticMapEmbed
            latitude={client.latitude}
            longitude={client.longitude}
            className={mapClassName}
            title={`Map for ${client.name}`}
          />
          <div className="flex flex-wrap gap-2">
            <a
              className={buttonClassName({
                variant: "ghost",
                size: "sm",
                className: "min-h-9 text-xs",
              })}
              href={googleDirectionsUrl(client.latitude, client.longitude)}
              target="_blank"
              rel="noreferrer"
            >
              Google Maps
            </a>
            <a
              className={buttonClassName({
                variant: "ghost",
                size: "sm",
                className: "min-h-9 text-xs",
              })}
              href={appleMapsDirectionsUrl(client.latitude, client.longitude)}
              target="_blank"
              rel="noreferrer"
            >
              Apple Maps
            </a>
          </div>
        </>
      ) : addr ? (
        <a
          className={buttonClassName({
            variant: "ghost",
            size: "sm",
            className: "min-h-9 text-xs",
          })}
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`}
          target="_blank"
          rel="noreferrer"
        >
          Open in Maps
        </a>
      ) : null}
    </div>
  );
}
