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
