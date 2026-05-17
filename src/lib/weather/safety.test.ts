import { describe, expect, test } from 'vitest';
import type { Plant } from '$lib/schema/plant';
import { plantWarnings } from './safety';
import type { DailyForecast } from './openMeteo';

const tomato: Plant = {
  slug: 'tomato',
  name: 'Tomato',
  category: 'fruiting-vegetable',
  tags: [],
  growth: {
    daysToGermination: [6, 14],
    daysToMaturity: [60, 90],
    spacing: { in: 24, cm: 60 },
    rowSpacing: { in: 36, cm: 90 },
    depth: { in: 0.25, cm: 0.6 },
    sun: 'full',
    water: 'regular-deep'
  },
  climate: {
    frostTolerance: 'tender',
    minSoilTempF: 60,
    optimalSoilTempF: [70, 85],
    minNightTempF: 50,
    maxDayTempF: 95,
    hardinessZones: [3, 11]
  },
  schedule: [{ phase: 'transplant', from: 'LFD', to: 'LFD+2w' }],
  pests: []
};

function day(date: string, min: number, max: number, precip = 0): DailyForecast {
  return { date, tempMinF: min, tempMaxF: max, precipitationMm: precip };
}

describe('plantWarnings', () => {
  test('flags frost for tender plants', () => {
    const forecast = [day('2026-05-01', 28, 50), day('2026-05-02', 45, 60)];
    const warnings = plantWarnings(tomato, forecast);
    expect(warnings.some((w) => w.severity === 'error' && w.message.includes('Frost'))).toBe(true);
  });

  test('flags overnight lows below plant minimum', () => {
    const forecast = Array.from({ length: 7 }, (_, i) =>
      day(`2026-05-0${i + 1}`, 45, 70)
    );
    const warnings = plantWarnings(tomato, forecast);
    expect(warnings.some((w) => w.message.includes('below the 50°F minimum'))).toBe(true);
  });

  test('flags heat stress when 3+ days exceed plant max', () => {
    const forecast = [
      day('2026-07-01', 70, 98),
      day('2026-07-02', 72, 99),
      day('2026-07-03', 71, 96),
      day('2026-07-04', 70, 90)
    ];
    const warnings = plantWarnings(tomato, forecast);
    expect(warnings.some((w) => w.message.includes('Heat stress'))).toBe(true);
  });

  test('does not flag heat stress for a single hot day', () => {
    const forecast = [
      day('2026-07-01', 70, 98),
      day('2026-07-02', 70, 88),
      day('2026-07-03', 70, 85)
    ];
    const warnings = plantWarnings(tomato, forecast);
    expect(warnings.some((w) => w.message.includes('Heat stress'))).toBe(false);
  });

  test('flags cold soil from rolling 7-day low average', () => {
    const forecast = Array.from({ length: 7 }, (_, i) =>
      day(`2026-04-0${i + 1}`, 48, 60)
    );
    const warnings = plantWarnings(tomato, forecast);
    expect(warnings.some((w) => w.message.includes('Soil likely too cold'))).toBe(true);
  });

  test('empty forecast returns no warnings', () => {
    expect(plantWarnings(tomato, [])).toEqual([]);
  });

  test('all-green forecast returns no warnings', () => {
    const forecast = Array.from({ length: 7 }, (_, i) =>
      day(`2026-06-0${i + 1}`, 65, 82)
    );
    expect(plantWarnings(tomato, forecast)).toEqual([]);
  });
});
