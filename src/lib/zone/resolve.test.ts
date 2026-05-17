import { describe, expect, test } from 'vitest';
import {
  buildResolvedLocation,
  defaultZoneForLat,
  fromGeocoded,
  isZone,
  parseIsoDate,
  toIsoDate
} from './resolve';

describe('defaultZoneForLat', () => {
  test('mid-latitudes map to temperate zones', () => {
    expect(defaultZoneForLat(42)).toBe('6a');
    expect(defaultZoneForLat(34)).toBe('7b');
  });

  test('symmetric across the equator', () => {
    expect(defaultZoneForLat(45)).toBe(defaultZoneForLat(-45));
  });

  test('tropics get warmest zones', () => {
    expect(defaultZoneForLat(5)).toBe('13a');
  });
});

describe('isZone', () => {
  test('rejects garbage strings', () => {
    expect(isZone('14a')).toBe(false);
    expect(isZone('')).toBe(false);
    expect(isZone('5b')).toBe(true);
  });
});

describe('buildResolvedLocation', () => {
  test('produces ISO frost dates from zone + year', () => {
    const loc = buildResolvedLocation({
      lat: 42.36,
      lon: -71.06,
      label: 'Boston',
      countryCode: 'US',
      zone: '6b',
      year: 2026
    });
    expect(loc.lastFrostDate).toBe('2026-04-15');
    expect(loc.firstFrostDate).toBe('2026-10-28');
    expect(loc.zone).toBe('6b');
  });

  test('southern hemisphere shifts frost dates', () => {
    const loc = buildResolvedLocation({
      lat: -33.87,
      lon: 151.21,
      label: 'Sydney',
      countryCode: 'AU',
      zone: '9a',
      year: 2026
    });
    // Northern 9a LFD is Feb 25 -> S hemisphere shifts to Aug 25
    expect(loc.lastFrostDate).toBe('2026-08-25');
  });
});

describe('fromGeocoded', () => {
  test('uses fallback zone when none provided', () => {
    const loc = fromGeocoded(
      { lat: 42, lon: -71, label: 'Boston, MA, USA', countryCode: 'US' },
      undefined,
      2026
    );
    expect(loc.zone).toBe('6a');
    expect(loc.lastFrostDate).not.toBeNull();
  });
});

describe('toIsoDate / parseIsoDate', () => {
  test('round-trips', () => {
    const d = new Date(2026, 4, 1);
    expect(toIsoDate(d)).toBe('2026-05-01');
    expect(parseIsoDate('2026-05-01').toDateString()).toBe(d.toDateString());
  });
});
