export function googleDirectionsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}

export function appleMapsDirectionsUrl(lat: number, lon: number): string {
  return `https://maps.apple.com/?daddr=${lat},${lon}`;
}
