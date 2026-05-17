import { describe, expect, test } from 'vitest';
import type { Plant } from '$lib/schema/plant';
import { phasesInWindow, resolveForPlants, resolveSchedule } from './resolve';

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
  schedule: [
    { phase: 'indoor-start', from: 'LFD-8w', to: 'LFD-6w' },
    { phase: 'transplant', from: 'LFD+1w', to: 'LFD+4w' },
    { phase: 'harvest', from: 'LFD+12w', to: 'FFD' }
  ],
  pests: []
};

const ctx = {
  lastFrost: new Date(2026, 3, 25), // Apr 25
  firstFrost: new Date(2026, 9, 15), // Oct 15
  year: 2026
};

describe('resolveSchedule', () => {
  test('expands every schedule entry to dated phases', () => {
    const phases = resolveSchedule(tomato, ctx);
    expect(phases).toHaveLength(3);
    expect(phases[0].phase).toBe('indoor-start');
    expect(phases[0].from.toDateString()).toBe(new Date(2026, 1, 28).toDateString());
    expect(phases[0].to.toDateString()).toBe(new Date(2026, 2, 14).toDateString());
  });

  test('harvest spans LFD+12w to FFD', () => {
    const phases = resolveSchedule(tomato, ctx);
    const harvest = phases.find((p) => p.phase === 'harvest')!;
    expect(harvest.to.toDateString()).toBe(ctx.firstFrost.toDateString());
  });
});

describe('phasesInWindow', () => {
  test('includes phases that overlap the window', () => {
    const phases = resolveSchedule(tomato, ctx);
    const start = new Date(2026, 4, 1); // May 1
    const end = new Date(2026, 4, 7); // May 7 — inside the transplant window
    const inWin = phasesInWindow(phases, start, end);
    expect(inWin.map((p) => p.phase)).toEqual(['transplant']);
  });

  test('excludes phases that are fully outside the window', () => {
    const phases = resolveSchedule(tomato, ctx);
    const start = new Date(2026, 0, 1); // Jan
    const end = new Date(2026, 0, 31);
    expect(phasesInWindow(phases, start, end)).toHaveLength(0);
  });

  test('inclusive boundary', () => {
    const phases = resolveSchedule(tomato, ctx);
    const start = new Date(2026, 9, 15); // exactly FFD
    const end = new Date(2026, 9, 20);
    const inWin = phasesInWindow(phases, start, end);
    expect(inWin.map((p) => p.phase)).toContain('harvest');
  });
});

describe('resolveForPlants', () => {
  test('flattens phases across multiple plants', () => {
    const all = resolveForPlants([tomato, tomato], ctx);
    expect(all).toHaveLength(6);
    expect(all.every((p) => p.plant === tomato)).toBe(true);
  });
});
