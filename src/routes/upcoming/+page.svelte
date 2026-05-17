<script lang="ts">
  import { resolve as resolvePath } from '$app/paths';
  import { prefs, hasFrostDates } from '$lib/prefs.svelte';
  import { plantBySlug } from '$lib/data/plants';
  import { resolveSchedule, phasesInWindow, type ResolvedPhase } from '$lib/schedule/resolve';
  import { parseIsoDate } from '$lib/zone/resolve';
  import { PHASE_STYLES } from '$lib/schedule/phaseColors';
  import { addDays, formatRange, startOfWeek, formatShortDate } from '$lib/util/format';
  import type { Plant } from '$lib/schema/plant';

  const location = $derived(prefs.location);
  const selectedSlugs = $derived(prefs.selectedCrops);

  const today = new Date();
  const windowStart = addDays(today, 7);
  const windowEnd = addDays(today, 42);

  type Row = { plant: Plant; phase: ResolvedPhase };
  type WeekGroup = { weekStart: Date; rows: Row[] };

  const groups: WeekGroup[] = $derived.by(() => {
    if (!hasFrostDates(location)) return [];
    const lastFrost = parseIsoDate(location.lastFrostDate);
    const firstFrost = parseIsoDate(location.firstFrostDate);
    const ctx = { lastFrost, firstFrost, year: lastFrost.getFullYear() };

    const rows: Row[] = [];
    for (const slug of selectedSlugs) {
      const plant = plantBySlug(slug);
      if (!plant) continue;
      for (const phase of phasesInWindow(resolveSchedule(plant, ctx), windowStart, windowEnd)) {
        rows.push({ plant, phase });
      }
    }

    const buckets: Record<number, WeekGroup> = {};
    for (const r of rows) {
      const clamped = r.phase.from < windowStart ? windowStart : r.phase.from;
      const ws = startOfWeek(clamped);
      const key = ws.getTime();
      if (!buckets[key]) buckets[key] = { weekStart: ws, rows: [] };
      buckets[key].rows.push(r);
    }
    return Object.values(buckets).toSorted((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  });
</script>

<header class="flex items-center justify-between">
  <a href={resolvePath('/')} class="text-sm text-moss-light hover:text-moss dark:text-cream-soft">
    ← Home
  </a>
  <h1 class="font-display text-2xl font-semibold tracking-tight text-moss dark:text-cream">
    Start preparing for
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

    {#if groups.length === 0}
      <p class="text-moss-light dark:text-cream-soft">
        Nothing in the next 2–6 weeks. Either everything’s already underway, or you’re between
        seasons.
      </p>
    {:else}
      {#each groups as g (g.weekStart.toISOString())}
        <section class="space-y-2">
          <h2 class="font-display text-lg font-semibold text-moss dark:text-cream">
            Week of {formatShortDate(g.weekStart)}
          </h2>
          <ul class="space-y-2">
            {#each g.rows as row, i (row.plant.slug + row.phase.phase + i)}
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
                  <p class="mt-1 text-sm text-moss-light dark:text-cream-soft">{row.phase.notes}</p>
                {/if}
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    {/if}
  {/if}
</main>
