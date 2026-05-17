// Typed client for the Open-Meteo public APIs.
// No API key required, CORS-friendly, all calls are client-side.
//
// Endpoints used:
//   geocoding-api.open-meteo.com/v1/search  — city → lat/lon
//   api.open-meteo.com/v1/forecast          — 14-day daily forecast

import { browser } from '$app/environment';

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export type Geocoded = {
  lat: number;
  lon: number;
  label: string;
  countryCode: string;
};

export type DailyForecast = {
  date: string; // YYYY-MM-DD
  tempMaxF: number;
  tempMinF: number;
  precipitationMm: number;
};

type CacheEntry<T> = { value: T; expiresAt: number };
const memo = new Map<string, CacheEntry<unknown>>();

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = memo.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expiresAt > now) return hit.value;

  if (browser) {
    try {
      const raw = sessionStorage.getItem(`ps:${key}`);
      if (raw) {
        const parsed = JSON.parse(raw) as CacheEntry<T>;
        if (parsed.expiresAt > now) {
          memo.set(key, parsed);
          return parsed.value;
        }
      }
    } catch {
      // Bad JSON or storage disabled — fall through to network.
    }
  }

  const value = await fn();
  const entry: CacheEntry<T> = { value, expiresAt: now + ttlMs };
  memo.set(key, entry);
  if (browser) {
    try {
      sessionStorage.setItem(`ps:${key}`, JSON.stringify(entry));
    } catch {
      // Storage quota or disabled — in-memory cache still works.
    }
  }
  return value;
}

export async function geocode(query: string, count = 5): Promise<Geocoded[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const url = new URL(GEOCODE_URL);
  url.searchParams.set('name', trimmed);
  url.searchParams.set('count', String(count));
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  return cached(`geocode:${trimmed.toLowerCase()}:${count}`, 24 * 60 * 60 * 1000, async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocode failed: ${res.status}`);
    const json = (await res.json()) as { results?: GeocodingResult[] };
    return (json.results ?? []).map(toGeocoded);
  });
}

type GeocodingResult = {
  latitude: number;
  longitude: number;
  name: string;
  admin1?: string;
  country: string;
  country_code: string;
};

function toGeocoded(r: GeocodingResult): Geocoded {
  const parts = [r.name, r.admin1, r.country].filter(Boolean);
  return {
    lat: r.latitude,
    lon: r.longitude,
    label: parts.join(', '),
    countryCode: r.country_code
  };
}

export async function fetchForecast(
  lat: number,
  lon: number,
  days = 14
): Promise<DailyForecast[]> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set('latitude', lat.toFixed(4));
  url.searchParams.set('longitude', lon.toFixed(4));
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum');
  url.searchParams.set('temperature_unit', 'fahrenheit');
  url.searchParams.set('precipitation_unit', 'mm');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', String(days));

  return cached(
    `forecast:${lat.toFixed(2)},${lon.toFixed(2)}:${days}`,
    6 * 60 * 60 * 1000,
    async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Forecast failed: ${res.status}`);
      const json = (await res.json()) as ForecastResponse;
      const { time, temperature_2m_max, temperature_2m_min, precipitation_sum } = json.daily;
      return time.map((date, i) => ({
        date,
        tempMaxF: temperature_2m_max[i],
        tempMinF: temperature_2m_min[i],
        precipitationMm: precipitation_sum[i]
      }));
    }
  );
}

type ForecastResponse = {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
  };
};

// Test helper. Not for production use.
export function clearCacheForTests() {
  memo.clear();
}
