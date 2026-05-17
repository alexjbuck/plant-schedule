import { describe, expect, test } from 'vitest';
import {
  defaultFrostDates,
  extremeMinRange,
  hemisphereFor,
  zoneFromExtremeMinF
} from './lookup';

describe('zoneFromExtremeMinF', () => {
  test('boundaries map to the warmer zone', () => {
    expect(zoneFromExtremeMinF(-20)).toBe('5a');
    expect(zoneFromExtremeMinF(-15)).toBe('5b');
    expect(zoneFromExtremeMinF(-10)).toBe('6a');
    expect(zoneFromExtremeMinF(0)).toBe('7a');
    expect(zoneFromExtremeMinF(10)).toBe('8a');
  });

  test('values inside a band stay in that band', () => {
    expect(zoneFromExtremeMinF(-18)).toBe('5a');
    expect(zoneFromExtremeMinF(-12)).toBe('5b');
    expect(zoneFromExtremeMinF(7)).toBe('7b');
  });

  test('extreme cold clamps to zone 1a', () => {
    expect(zoneFromExtremeMinF(-100)).toBe('1a');
  });

  test('extreme heat caps at zone 13b', () => {
    expect(zoneFromExtremeMinF(80)).toBe('13b');
  });
});

describe('extremeMinRange', () => {
  test('zone 5b is -15 to -10', () => {
    expect(extremeMinRange('5b')).toEqual({ lowF: -15, highF: -10 });
  });

  test('zone 7a is 0 to 5', () => {
    expect(extremeMinRange('7a')).toEqual({ lowF: 0, highF: 5 });
  });
});

describe('defaultFrostDates', () => {
  test('zone 5b 2026 northern hemisphere', () => {
    const { lastFrost, firstFrost } = defaultFrostDates('5b', 2026, 'N');
    expect(lastFrost.toDateString()).toBe(new Date(2026, 3, 25).toDateString());
    expect(firstFrost.toDateString()).toBe(new Date(2026, 9, 15).toDateString());
  });

  test('zone 9a southern hemisphere shifts by 6 months', () => {
    const { lastFrost, firstFrost } = defaultFrostDates('9a', 2026, 'S');
    // Northern 9a LFD is Feb 25; in S hemisphere shifts to Aug 25
    expect(lastFrost.getMonth()).toBe(7); // August
    expect(lastFrost.getDate()).toBe(25);
    // Northern 9a FFD is Dec 1; in S hemisphere shifts to Jun 1
    expect(firstFrost.getMonth()).toBe(5); // June
    expect(firstFrost.getDate()).toBe(1);
  });
});

describe('hemisphereFor', () => {
  test('positive latitude is north', () => {
    expect(hemisphereFor(42.36)).toBe('N');
  });
  test('negative latitude is south', () => {
    expect(hemisphereFor(-33.87)).toBe('S');
  });
  test('equator is north', () => {
    expect(hemisphereFor(0)).toBe('N');
  });
});
