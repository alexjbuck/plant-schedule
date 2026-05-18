<script lang="ts">
  import { resolve as resolvePath } from '$app/paths';
  import { prefs, hasFrostDates } from '$lib/prefs.svelte';
  import { plantBySlug } from '$lib/data/plants';
  import { resolveSchedule, segmentFor, fractionInYear } from '$lib/schedule/resolve';
  import { parseIsoDate } from '$lib/zone/resolve';
  import { PHASE_STYLES } from '$lib/schedule/phaseColors';
  import { formatRange, monthTicks } from '$lib/util/format';
  import type { Plant } from '$lib/schema/plant';

  const location = $derived(prefs.location);
  const selectedSlugs = $derived(prefs.selectedCrops);

  const selectedPlants = $derived(
    selectedSlugs.map((slug) => plantBySlug(slug)).filter((p): p is Plant => !!p)
  );

  const ctx = $derived.by(() => {
    if (!hasFrostDates(location)) return null;
    const lastFrost = parseIsoDate(location.lastFrostDate);
    const firstFrost = parseIsoDate(location.firstFrostDate);
    return { lastFrost, firstFrost, year: lastFrost.getFullYear() };
  });

  const yearStart = $derived(ctx ? new Date(ctx.year, 0, 1) : new Date());
  const yearEnd = $derived(ctx ? new Date(ctx.year, 11, 31) : new Date());

  const ticks = $derived(ctx ? monthTicks(ctx.year) : []);
  const today = $derived(new Date());
  const todayLeft = $derived(ctx ? fractionInYear(today, yearStart, yearEnd) * 100 : -1);

  type Row = {
    plant: Plant;
    segments: ReturnType<typeof toSegments>;
  };

  function toSegments(plant: Plant) {
    if (!ctx) return [];
    const phases = resolveSchedule(plant, ctx);
    return phases.map((p) => ({
      ...p,
      seg: segmentFor(p, yearStart, yearEnd),
      style: PHASE_STYLES[p.phase]
    }));
  }

  const rows: Row[] = $derived(
    selectedPlants.map((plant) => ({ plant, segments: toSegments(plant) }))
  );

  let activeTooltip: string | null = $state(null);

  const phaseEntries = Object.entries(PHASE_STYLES);

  const MONTH_LABELS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  type TimelineEvent = {
    plant: Plant;
    segment: Row['segments'][number];
  };

  const monthGroups = $derived.by(() => {
    const events: TimelineEvent[] = [];
    for (const row of rows) {
      for (const segment of row.segments) {
        events.push({ plant: row.plant, segment });
      }
    }
    events.sort(
      (a, b) =>
        a.segment.from.getTime() - b.segment.from.getTime() ||
        a.plant.name.localeCompare(b.plant.name)
    );
    const buckets: TimelineEvent[][] = Array.from({ length: 12 }, () => []);
    for (const e of events) {
      buckets[e.segment.from.getMonth()].push(e);
    }
    return buckets
      .map((items, month) => ({ month, label: MONTH_LABELS[month], items }))
      .filter((g) => g.items.length > 0);
  });

  const currentMonth = $derived(today.getMonth());

  function isActiveNow(from: Date, to: Date): boolean {
    return today >= from && today <= to;
  }
</script>

<header class="flex items-center justify-between">
  <a href={resolvePath('/')} class="text-sm text-moss-light hover:text-moss dark:text-cream-soft">
    ← Home
  </a>
  <h1 class="font-display text-2xl font-semibold tracking-tight text-moss dark:text-cream">
    Year timeline
  </h1>
  <span></span>
</header>

<main class="mt-6 flex flex-1 flex-col gap-4">
  {#if !location}
    <p class="text-moss-light dark:text-cream-soft">
      Set your <a class="underline" href={resolvePath('/')}>location</a> first to see a timeline.
    </p>
  {:else if rows.length === 0}
    <p class="text-moss-light dark:text-cream-soft">
      Pick some crops on the <a class="underline" href={resolvePath('/')}>home page</a>
      and they'll show up here.
    </p>
  {:else if !ctx}
    <p class="text-terracotta">
      Frost dates are missing.
      <a class="underline" href={resolvePath('/')}>Reset your location</a>.
    </p>
  {:else}
    <p class="text-sm text-moss-light dark:text-cream-soft">
      {location.label} · zone {location.zone} · last frost {location.lastFrostDate} · first frost
      {location.firstFrostDate}
    </p>

    <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs text-moss-light dark:text-cream-soft">
      {#each phaseEntries as [phase, style] (phase)}
        <span class="inline-flex items-center gap-1.5">
          <span class="inline-block h-2.5 w-4 rounded {style.fill}"></span>
          {style.label}
        </span>
      {/each}
    </div>

    <div class="hidden overflow-x-auto sm:block">
      <div class="min-w-[640px]">
        <div
          class="sticky top-0 z-10 border-b border-sage/20 bg-cream/95 backdrop-blur dark:border-sage-dark/30 dark:bg-charcoal/95"
        >
          <div class="grid" style="grid-template-columns: 9rem 1fr;">
            <div></div>
            <div class="relative h-7">
              {#each ticks as t, i (i)}
                <span
                  class="absolute -translate-x-1/2 text-xs text-moss-light dark:text-cream-soft"
                  style="left: {(i / 12) * 100}%; top: 0.25rem;"
                >
                  {t.label}
                </span>
              {/each}
            </div>
          </div>
        </div>

        <ul class="divide-y divide-sage/15 dark:divide-sage-dark/30">
          {#each rows as row (row.plant.slug)}
            <li>
              <div class="grid items-center" style="grid-template-columns: 9rem 1fr;">
                <a
                  href={resolvePath('/plants/[slug]', { slug: row.plant.slug })}
                  class="truncate py-3 pr-2 text-sm font-medium text-moss hover:text-terracotta dark:text-cream"
                >
                  {row.plant.name}
                </a>
                <div class="relative h-9 rounded bg-cream-soft/40 dark:bg-charcoal-soft/60">
                  {#each ticks as _t, i (i)}
                    {#if i > 0}
                      <span
                        class="absolute inset-y-0 w-px bg-sage/10 dark:bg-sage-dark/20"
                        style="left: {(i / 12) * 100}%"
                      ></span>
                    {/if}
                  {/each}

                  {#if todayLeft >= 0 && todayLeft <= 100}
                    <span
                      class="absolute inset-y-0 w-px bg-terracotta"
                      style="left: {todayLeft}%"
                      aria-hidden="true"
                    ></span>
                  {/if}

                  {#each row.segments as s, i (row.plant.slug + s.phase + i)}
                    {@const tipKey = `${row.plant.slug}:${i}`}
                    <a
                      href={resolvePath('/plants/[slug]', { slug: row.plant.slug })}
                      aria-label={row.plant.name +
                        ' — ' +
                        s.style.label +
                        ': ' +
                        formatRange(s.from, s.to)}
                      onmouseenter={() => (activeTooltip = tipKey)}
                      onmouseleave={() => (activeTooltip = null)}
                      onfocus={() => (activeTooltip = tipKey)}
                      onblur={() => (activeTooltip = null)}
                      class="absolute top-1.5 bottom-1.5 flex items-center rounded px-1.5 text-[10px] font-medium hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-terracotta {s
                        .style.fill} {s.style.text}"
                      style="left: {s.seg.left}%; width: {s.seg.width}%;"
                    >
                      <span class="truncate">{s.style.label}</span>
                      {#if activeTooltip === tipKey}
                        <span
                          role="tooltip"
                          class="absolute -top-1 left-1/2 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-card border border-sage/20 bg-cream px-2 py-1 text-xs text-moss shadow-md dark:border-sage-dark/40 dark:bg-charcoal-soft dark:text-cream"
                        >
                          {s.style.label} · {formatRange(s.from, s.to)}
                          {#if s.notes}
                            <br /><span class="text-moss-light dark:text-cream-soft">{s.notes}</span
                            >
                          {/if}
                        </span>
                      {/if}
                    </a>
                  {/each}
                </div>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    </div>

    <div class="space-y-5 sm:hidden">
      {#each monthGroups as group (group.month)}
        <section>
          <h2
            class="sticky top-0 z-10 -mx-1 mb-2 flex items-baseline gap-2 bg-cream/95 px-1 py-1 font-display text-sm font-semibold tracking-wide text-moss-light uppercase backdrop-blur dark:bg-charcoal/95 dark:text-cream-soft"
            class:text-terracotta={group.month === currentMonth}
            class:dark:text-terracotta={group.month === currentMonth}
          >
            {group.label}
            {#if group.month === currentMonth}
              <span class="text-[10px] font-medium tracking-normal normal-case">· now</span>
            {/if}
          </h2>
          <ul
            class="divide-y divide-sage/15 overflow-hidden rounded-card border border-sage/20 bg-cream-soft/40 dark:divide-sage-dark/30 dark:border-sage-dark/40 dark:bg-charcoal-soft"
          >
            {#each group.items as e, i (e.plant.slug + e.segment.phase + i)}
              {@const active = isActiveNow(e.segment.from, e.segment.to)}
              <li>
                <a
                  href={resolvePath('/plants/[slug]', { slug: e.plant.slug })}
                  class="flex items-center gap-3 px-3 py-2.5 hover:bg-cream-soft dark:hover:bg-charcoal"
                >
                  <span
                    class="inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium {e
                      .segment.style.fill} {e.segment.style.text}"
                  >
                    {e.segment.style.label}
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-medium text-moss dark:text-cream">
                      {e.plant.name}
                    </span>
                    <span class="block text-xs text-moss-light dark:text-cream-soft">
                      {formatRange(e.segment.from, e.segment.to)}
                    </span>
                  </span>
                  {#if active}
                    <span
                      class="shrink-0 rounded-full bg-terracotta/15 px-1.5 py-0.5 text-[10px] font-medium text-terracotta"
                    >
                      now
                    </span>
                  {/if}
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  {/if}
</main>
