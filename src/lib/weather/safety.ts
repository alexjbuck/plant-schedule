// Cross-checks a plant's climate requirements against the 14-day forecast.
// Powers the "this weekend" view warnings.

import type { Plant } from '$lib/schema/plant';
import type { DailyForecast } from './openMeteo';

export type Severity = 'info' | 'warn' | 'error';

export type Warning = {
  severity: Severity;
  message: string;
  affectedDates?: string[]; // YYYY-MM-DD
};

export function plantWarnings(plant: Plant, forecast: DailyForecast[]): Warning[] {
  if (forecast.length === 0) return [];
  const out: Warning[] = [];

  // 1. Hard frost risk for tender plants
  const frostDays = forecast.filter((d) => d.tempMinF <= 32);
  if (frostDays.length > 0 && plant.climate.frostTolerance !== 'hardy') {
    out.push({
      severity: 'error',
      message: `Frost forecast: lows reach ${Math.min(...frostDays.map((d) => d.tempMinF))}°F. ${plant.name} is ${plant.climate.frostTolerance} — protect or delay.`,
      affectedDates: frostDays.map((d) => d.date)
    });
  }

  // 2. Overnight lows below plant's tolerance
  const coldDays = forecast.filter(
    (d) => d.tempMinF < plant.climate.minNightTempF && d.tempMinF > 32
  );
  if (coldDays.length > 0) {
    const lowest = Math.min(...coldDays.map((d) => d.tempMinF));
    out.push({
      severity: 'warn',
      message: `Overnight lows of ${lowest}°F on ${coldDays.length} day(s) — below the ${plant.climate.minNightTempF}°F minimum for ${plant.name}. Growth will stall.`,
      affectedDates: coldDays.map((d) => d.date)
    });
  }

  // 3. Heat stress
  const hotDays = forecast.filter((d) => d.tempMaxF > plant.climate.maxDayTempF);
  if (hotDays.length >= 3) {
    const peak = Math.max(...hotDays.map((d) => d.tempMaxF));
    out.push({
      severity: 'warn',
      message: `Heat stress: ${hotDays.length} days above ${plant.climate.maxDayTempF}°F (peak ${peak}°F). ${plant.name} may drop blossoms or bolt. Mulch heavily, shade if possible.`,
      affectedDates: hotDays.map((d) => d.date)
    });
  }

  // 4. Cold soil — rolling 7-day average of daily lows below plant's min soil temp.
  // Soil temps lag air, but as a proxy we look at min air temps over a week.
  const window = forecast.slice(0, 7);
  if (window.length === 7) {
    const avgMin = window.reduce((s, d) => s + d.tempMinF, 0) / window.length;
    if (avgMin < plant.climate.minSoilTempF) {
      out.push({
        severity: 'warn',
        message: `Soil likely too cold for germination: 7-day average low ${avgMin.toFixed(0)}°F vs. ${plant.name}'s ${plant.climate.minSoilTempF}°F minimum.`
      });
    }
  }

  return out;
}

export const severityOrder: Record<Severity, number> = { error: 0, warn: 1, info: 2 };
