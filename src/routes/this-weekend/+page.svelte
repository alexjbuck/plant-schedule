<script lang="ts">
  import { resolve as resolvePath } from '$app/paths';
  import { browser } from '$app/environment';
  import { prefs, hasFrostDates } from '$lib/prefs.svelte';
  import { plantBySlug } from '$lib/data/plants';
  import { resolveSchedule, phasesInWindow, type ResolvedPhase } from '$lib/schedule/resolve';
  import { parseIsoDate } from '$lib/zone/resolve';
  import { PHASE_STYLES } from '$lib/schedule/phaseColors';
  import { addDays, formatRange } from '$lib/util/format';
  import { fetchForecast, type DailyForecast } from '$lib/weather/openMeteo';
  import { plantWarnings, severityOrder, type Warning } from '$lib/weather/safety';
  import ForecastStrip from '$lib/components/ForecastStrip.svelte';
  import type { Plant } from '$lib/schema/plant';

  const location = $derived(prefs.location);
  const selectedSlugs = $derived(prefs.selectedCrops);

  const today = new Date();
  const windowStart = today;
  const windowEnd = addDays(today, 7);

  let forecast: DailyForecast[] = $state([]);
  let forecastError: string | null = $state(null);
  let forecastLoading = $state(false);

  $effect(() => {
    if (!browser || !location) return;
    forecastLoading = true;
    forecastError = null;
    fetchForecast(location.lat, location.lon, 14)
      .then((f) => {
        forecast = f;
      })
      .catch((e: unknown) => {
        forecastError = e instanceof Error ? e.message : String(e);
      })
      .finally(() => {
        forecastLoading = false;
      });
  });

  type Row = {
    plant: Plant;
    phase: ResolvedPhase;
    warnings: Warning[];
    severityRank: number;
  };

  const rows: Row[] = $derived.by(() => {
    if (!hasFrostDates(location)) return [];
    const lastFrost = parseIsoDate(location.lastFrostDate);
    const firstFrost = parseIsoDate(location.firstFrostDate);
    const ctx = { lastFrost, firstFrost, year: lastFrost.getFullYear() };
    const out: Row[] = [];
    for (const slug of selectedSlugs) {
      const plant = plantBySlug(slug);
      if (!plant) continue;
      const phases = phasesInWindow(resolveSchedule(plant, ctx), windowStart, windowEnd);
      const warnings = plantWarnings(plant, forecast.slice(0, 7));
      const severityRank =
        warnings.length === 0 ? 99 : Math.min(...warnings.map((w) => severityOrder[w.severity]));
      for (const phase of phases) {
        out.push({ plant, phase, warnings, severityRank });
      }
    }
    return out.toSorted((a, b) => a.severityRank - b.severityRank);
  });
</script>

<header class="flex items-center justify-between">
  <a href={resolvePath('/')} class="text-sm text-moss-light hover:text-moss dark:text-cream-soft">
    ← Home
  </a>
  <h1 class="font-display text-2xl font-semibold tracking-tight text-moss dark:text-cream">
    This weekend
  </h1>
  <span></span>
</header>

<main class="mt-6 flex flex-1 flex-col gap-5">
  {#if !location}
    <p class="text-moss-light dark:text-cream-soft">
      Set your <a class="underline" href={resolvePath('/')}>location</a> first.
    </p>
  {:else if selectedSlugs.length === 0}
    <p class="text-moss-light dark:text-cream-soft">
      Pick some crops on the <a class="underline" href={resolvePath('/')}>home page</a>.
    </p>
  {:else}
    <p class="text-sm text-moss-light dark:text-cream-soft">
      {location.label} · {formatRange(windowStart, windowEnd)}
    </p>

    {#if forecastLoading}
      <p class="text-xs text-moss-light dark:text-cream-soft">Loading forecast…</p>
    {:else if forecastError}
      <p class="text-xs text-terracotta">Forecast unavailable: {forecastError}</p>
    {:else if forecast.length > 0}
      <ForecastStrip forecast={forecast.slice(0, 7)} />
    {/if}

    {#if rows.length === 0}
      <p class="text-moss-light dark:text-cream-soft">
        Nothing on the schedule for your crops this week. Take a breath.
      </p>
    {:else}
      <ul class="flex flex-col gap-3">
        {#each rows as row, i (row.plant.slug + row.phase.phase + i)}
          {@const style = PHASE_STYLES[row.phase.phase]}
          <li
            class="rounded-card border border-sage/20 bg-cream-soft/40 p-3 dark:border-sage-dark/40 dark:bg-charcoal-soft"
          >
            <div class="flex flex-wrap items-center gap-3">
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium {style.fill} {style.text}"
              >
                {style.label}
              </span>
              <a
                href={resolvePath('/plants/[slug]', { slug: row.plant.slug })}
                class="font-display font-semibold text-moss hover:text-terracotta dark:text-cream"
              >
                {row.plant.name}
              </a>
              <span class="text-xs text-moss-light dark:text-cream-soft">
                {formatRange(row.phase.from, row.phase.to)}
              </span>
            </div>
            {#if row.phase.notes}
              <p class="mt-2 text-sm text-moss-light dark:text-cream-soft">{row.phase.notes}</p>
            {/if}
            {#if row.warnings.length > 0}
              <ul class="mt-2 space-y-1">
                {#each row.warnings as w, j (w.severity + j)}
                  <li class="text-xs">
                    <span
                      class="mr-1.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium
                        {w.severity === 'error'
                        ? 'bg-terracotta text-cream'
                        : w.severity === 'warn'
                          ? 'bg-terracotta-soft text-moss'
                          : 'bg-sage-light/60 text-moss'}">{w.severity}</span
                    >
                    <span class="text-moss-light dark:text-cream-soft">{w.message}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</main>
