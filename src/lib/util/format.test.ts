import { describe, expect, test } from 'vitest';
import {
  addDays,
  daysBetween,
  formatRange,
  formatShortDate,
  monthTicks,
  startOfWeek
} from './format';

describe('formatShortDate', () => {
  test('Apr 25', () => {
    expect(formatShortDate(new Date(2026, 3, 25))).toBe('Apr 25');
  });
});

describe('formatRange', () => {
  test('single day collapses', () => {
    const d = new Date(2026, 3, 25);
    expect(formatRange(d, d)).toBe('Apr 25');
  });

  test('same month range', () => {
    expect(formatRange(new Date(2026, 3, 5), new Date(2026, 3, 12))).toBe('Apr 5–12');
  });

  test('cross-month range', () => {
    expect(formatRange(new Date(2026, 3, 25), new Date(2026, 4, 5))).toBe('Apr 25 – May 5');
  });
});

describe('monthTicks', () => {
  test('returns 12 evenly-spaced months', () => {
    const ticks = monthTicks(2026);
    expect(ticks).toHaveLength(12);
    expect(ticks[0].label).toBe('Jan');
    expect(ticks[11].label).toBe('Dec');
  });
});

describe('addDays / daysBetween', () => {
  test('addDays then daysBetween round-trips', () => {
    const base = new Date(2026, 0, 1);
    expect(daysBetween(base, addDays(base, 7))).toBe(7);
  });
});

describe('startOfWeek', () => {
  test('Wednesday rolls back to Sunday', () => {
    // 2026-05-13 is a Wednesday in real calendar; using the constructor-friendly
    // proxy: just verify the day is 0 (Sunday) after the call.
    const wed = new Date(2026, 4, 13);
    expect(startOfWeek(wed).getDay()).toBe(0);
  });
});
