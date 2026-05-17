// Derives a ResolvedLocation (lat/lon + zone + frost dates) from user input.
// Pure functions only. Tested in resolve.test.ts.

import { defaultFrostDates, hemisphereFor, ZONES, type Zone } from './lookup';
import type { Geocoded } from '$lib/weather/openMeteo';
import type { ResolvedLocation } from '$lib/prefs.svelte';

// Approximate USDA hardiness zone from latitude alone — a coarse starting
// point so the dropdown isn't empty. Real zones depend on elevation, marine
// influence, and microclimate; users always confirm/override the value.
//
// Rough N-hemisphere bands derived from the 2023 USDA map's latitude centroids
// (continental US shapes most of these; equatorial 12-13 picked up via the
// tropics). The S-hemisphere mirror is computed by flipping the sign.
function fallbackZoneByLatitude(absLat: number): Zone {
  if (absLat >= 65) return '2a';
  if (absLat >= 60) return '3a';
  if (absLat >= 55) return '4a';
  if (absLat >= 50) return '5a';
  if (absLat >= 45) return '5b';
  if (absLat >= 42) return '6a';
  if (absLat >= 39) return '6b';
  if (absLat >= 36) return '7a';
  if (absLat >= 33) return '7b';
  if (absLat >= 30) return '8b';
  if (absLat >= 27) return '9a';
  if (absLat >= 24) return '9b';
  if (absLat >= 20) return '10a';
  if (absLat >= 15) return '11a';
  if (absLat >= 10) return '12a';
  return '13a';
}

export function defaultZoneForLat(lat: number): Zone {
  return fallbackZoneByLatitude(Math.abs(lat));
}

export function isZone(value: string): value is Zone {
  return (ZONES as readonly string[]).includes(value);
}

export type LocationDraft = {
  lat: number;
  lon: number;
  label: string;
  countryCode: string;
  zone: Zone;
  year?: number;
};

export function buildResolvedLocation(draft: LocationDraft): ResolvedLocation {
  const year = draft.year ?? new Date().getFullYear();
  const { lastFrost, firstFrost } = defaultFrostDates(
    draft.zone,
    year,
    hemisphereFor(draft.lat)
  );
  return {
    lat: draft.lat,
    lon: draft.lon,
    label: draft.label,
    countryCode: draft.countryCode,
    zone: draft.zone,
    lastFrostDate: toIsoDate(lastFrost),
    firstFrostDate: toIsoDate(firstFrost)
  };
}

export function fromGeocoded(g: Geocoded, zone?: Zone, year?: number): ResolvedLocation {
  return buildResolvedLocation({
    lat: g.lat,
    lon: g.lon,
    label: g.label,
    countryCode: g.countryCode,
    zone: zone ?? defaultZoneForLat(g.lat),
    year
  });
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseIsoDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
