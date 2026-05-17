// USDA hardiness zone derivation and approximate frost-date defaults.
//
// USDA zones are defined by the average annual extreme minimum temperature
// in 10°F bands, each split into 'a' (colder) and 'b' (warmer) halves.
// Reference: https://planthardiness.ars.usda.gov/

export type Zone =
  | '1a' | '1b' | '2a' | '2b' | '3a' | '3b'
  | '4a' | '4b' | '5a' | '5b' | '6a' | '6b'
  | '7a' | '7b' | '8a' | '8b' | '9a' | '9b'
  | '10a' | '10b' | '11a' | '11b' | '12a' | '12b' | '13a' | '13b';

export const ZONES: readonly Zone[] = [
  '1a', '1b', '2a', '2b', '3a', '3b',
  '4a', '4b', '5a', '5b', '6a', '6b',
  '7a', '7b', '8a', '8b', '9a', '9b',
  '10a', '10b', '11a', '11b', '12a', '12b', '13a', '13b'
] as const;

// Lower bound (inclusive) of each zone in °F.
const ZONE_LOWER_F: Record<Zone, number> = {
  '1a': -60, '1b': -55, '2a': -50, '2b': -45, '3a': -40, '3b': -35,
  '4a': -30, '4b': -25, '5a': -20, '5b': -15, '6a': -10, '6b': -5,
  '7a': 0, '7b': 5, '8a': 10, '8b': 15, '9a': 20, '9b': 25,
  '10a': 30, '10b': 35, '11a': 40, '11b': 45, '12a': 50, '12b': 55,
  '13a': 60, '13b': 65
};

export function zoneFromExtremeMinF(extremeMinF: number): Zone {
  let best: Zone = '1a';
  for (const z of ZONES) {
    if (ZONE_LOWER_F[z] <= extremeMinF) best = z;
    else break;
  }
  return best;
}

export function extremeMinRange(zone: Zone): { lowF: number; highF: number } {
  const lowF = ZONE_LOWER_F[zone];
  return { lowF, highF: lowF + 5 };
}

// Approximate last-frost / first-frost dates for each zone in the Northern
// Hemisphere. These are coarse but workable starting points; serious gardeners
// will override per their specific microclimate. Southern hemisphere swaps by
// six months.
const NORTH_FROST: Record<Zone, { lfd: [number, number]; ffd: [number, number] }> = {
  '1a': { lfd: [6, 15], ffd: [8, 25] },
  '1b': { lfd: [6, 10], ffd: [8, 30] },
  '2a': { lfd: [6, 1], ffd: [9, 1] },
  '2b': { lfd: [5, 25], ffd: [9, 5] },
  '3a': { lfd: [5, 20], ffd: [9, 8] },
  '3b': { lfd: [5, 15], ffd: [9, 15] },
  '4a': { lfd: [5, 10], ffd: [9, 25] },
  '4b': { lfd: [5, 5], ffd: [10, 1] },
  '5a': { lfd: [4, 30], ffd: [10, 8] },
  '5b': { lfd: [4, 25], ffd: [10, 15] },
  '6a': { lfd: [4, 20], ffd: [10, 20] },
  '6b': { lfd: [4, 15], ffd: [10, 28] },
  '7a': { lfd: [4, 5], ffd: [11, 1] },
  '7b': { lfd: [3, 28], ffd: [11, 8] },
  '8a': { lfd: [3, 20], ffd: [11, 15] },
  '8b': { lfd: [3, 10], ffd: [11, 25] },
  '9a': { lfd: [2, 25], ffd: [12, 1] },
  '9b': { lfd: [2, 10], ffd: [12, 10] },
  '10a': { lfd: [1, 30], ffd: [12, 20] },
  '10b': { lfd: [1, 15], ffd: [12, 30] },
  '11a': { lfd: [1, 1], ffd: [12, 31] },
  '11b': { lfd: [1, 1], ffd: [12, 31] },
  '12a': { lfd: [1, 1], ffd: [12, 31] },
  '12b': { lfd: [1, 1], ffd: [12, 31] },
  '13a': { lfd: [1, 1], ffd: [12, 31] },
  '13b': { lfd: [1, 1], ffd: [12, 31] }
};

export function defaultFrostDates(
  zone: Zone,
  year: number,
  hemisphere: 'N' | 'S' = 'N'
): { lastFrost: Date; firstFrost: Date } {
  const base = NORTH_FROST[zone];
  if (hemisphere === 'N') {
    return {
      lastFrost: new Date(year, base.lfd[0] - 1, base.lfd[1]),
      firstFrost: new Date(year, base.ffd[0] - 1, base.ffd[1])
    };
  }
  // Southern hemisphere: shift by 6 months and clamp into the same calendar year.
  const lfdMonth = ((base.lfd[0] + 5) % 12) + 1;
  const ffdMonth = ((base.ffd[0] + 5) % 12) + 1;
  return {
    lastFrost: new Date(year, lfdMonth - 1, base.lfd[1]),
    firstFrost: new Date(year, ffdMonth - 1, base.ffd[1])
  };
}

export function hemisphereFor(lat: number): 'N' | 'S' {
  return lat >= 0 ? 'N' : 'S';
}
