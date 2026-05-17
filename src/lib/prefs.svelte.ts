import { browser } from '$app/environment';

const STORAGE_KEY = 'plant-schedule:prefs:v1';

export type Theme = 'light' | 'dark' | 'auto';
export type Units = 'imperial' | 'metric' | 'auto';

export type ResolvedLocation = {
  lat: number;
  lon: number;
  label: string;
  countryCode: string;
  zone: string | null;
  lastFrostDate: string | null;
  firstFrostDate: string | null;
};

export function hasFrostDates(
  loc: ResolvedLocation | null
): loc is ResolvedLocation & { lastFrostDate: string; firstFrostDate: string } {
  return !!loc && !!loc.lastFrostDate && !!loc.firstFrostDate;
}

type Snapshot = {
  theme: Theme;
  units: Units;
  location: ResolvedLocation | null;
  selectedCrops: string[];
};

const DEFAULTS: Snapshot = {
  theme: 'auto',
  units: 'auto',
  location: null,
  selectedCrops: []
};

class PrefsStore {
  theme: Theme = $state(DEFAULTS.theme);
  units: Units = $state(DEFAULTS.units);
  location: ResolvedLocation | null = $state(DEFAULTS.location);
  selectedCrops: string[] = $state(DEFAULTS.selectedCrops);

  constructor() {
    if (!browser) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<Snapshot>;
      if (parsed.theme) this.theme = parsed.theme;
      if (parsed.units) this.units = parsed.units;
      if (parsed.location !== undefined) this.location = parsed.location;
      if (Array.isArray(parsed.selectedCrops)) this.selectedCrops = parsed.selectedCrops;
    } catch {
      // Corrupt storage — fall back to defaults silently.
    }
  }

  toJSON(): Snapshot {
    return {
      theme: this.theme,
      units: this.units,
      location: this.location,
      selectedCrops: [...this.selectedCrops]
    };
  }

  toggleCrop(slug: string) {
    const i = this.selectedCrops.indexOf(slug);
    if (i === -1) this.selectedCrops.push(slug);
    else this.selectedCrops.splice(i, 1);
  }
}

export const prefs = new PrefsStore();
