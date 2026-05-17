// Turns a Plant's schedule expressions into concrete dated phases for a given
// location/year. Pure function — caller supplies the context.

import type { Phase, Plant } from '$lib/schema/plant';
import { resolve as resolveDsl, type ResolveContext } from './dsl';

export type { ResolveContext } from './dsl';

export type ResolvedPhase = {
  phase: Phase;
  from: Date;
  to: Date;
  notes?: string;
};

export function resolveSchedule(plant: Plant, ctx: ResolveContext): ResolvedPhase[] {
  return plant.schedule.map((entry) => ({
    phase: entry.phase,
    from: resolveDsl(entry.from, ctx),
    to: resolveDsl(entry.to, ctx),
    notes: entry.notes
  }));
}

// Returns phases whose window overlaps the inclusive [windowStart, windowEnd] range.
// Used to power the "this weekend" and "upcoming" views.
export function phasesInWindow(
  phases: ResolvedPhase[],
  windowStart: Date,
  windowEnd: Date
): ResolvedPhase[] {
  return phases.filter((p) => p.from <= windowEnd && p.to >= windowStart);
}

export type PhaseWithPlant = ResolvedPhase & { plant: Plant };

export function resolveForPlants(plants: Plant[], ctx: ResolveContext): PhaseWithPlant[] {
  const out: PhaseWithPlant[] = [];
  for (const plant of plants) {
    for (const phase of resolveSchedule(plant, ctx)) {
      out.push({ ...phase, plant });
    }
  }
  return out;
}

// Maps a date to a [0, 1] position along the [start, end] year window,
// clamped at the edges. Used to lay out timeline segments.
export function fractionInYear(date: Date, start: Date, end: Date): number {
  const total = end.getTime() - start.getTime();
  if (total <= 0) return 0;
  const offset = date.getTime() - start.getTime();
  if (offset <= 0) return 0;
  if (offset >= total) return 1;
  return offset / total;
}

export type Segment = {
  /** Left edge in % of the timeline width. */
  left: number;
  /** Width in % of the timeline width. */
  width: number;
};

export function segmentFor(phase: ResolvedPhase, start: Date, end: Date): Segment {
  const left = fractionInYear(phase.from, start, end) * 100;
  const right = fractionInYear(phase.to, start, end) * 100;
  return { left, width: Math.max(1.5, right - left) };
}
