import { useMemo } from "react";
import { cn } from "../../lib/cn";
import { openStreetMapEmbedUrl } from "../../lib/mapUrls";

type Props = {
  latitude: number;
  longitude: number;
  className?: string;
  title?: string;
};

export function StaticMapEmbed({
  latitude,
  longitude,
  className,
  title = "Job location map",
}: Props) {
  const src = useMemo(
    () => openStreetMapEmbedUrl(latitude, longitude),
    [latitude, longitude],
  );
  return (
    <iframe
      title={title}
      className={cn(
        "aspect-[4/3] w-full max-w-md rounded-md border border-border bg-surface",
        className,
      )}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={src}
    />
  );
}
