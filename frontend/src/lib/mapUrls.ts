/** Bbox + marker embed (read-only; no Leaflet). */
export function openStreetMapEmbedUrl(lat: number, lon: number, delta = 0.012): string {
  const minLon = lon - delta;
  const minLat = lat - delta * 0.75;
  const maxLon = lon + delta;
  const maxLat = lat + delta * 0.75;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    `${minLon},${minLat},${maxLon},${maxLat}`,
  )}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lon}`)}`;
}

export function googleDirectionsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}

export function appleMapsDirectionsUrl(lat: number, lon: number): string {
  return `https://maps.apple.com/?daddr=${lat},${lon}`;
}
