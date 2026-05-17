<script lang="ts">
  import { resolve as resolvePath } from '$app/paths';
  import { prefs, hasFrostDates } from '$lib/prefs.svelte';
  import { resolveSchedule } from '$lib/schedule/resolve';
  import { parseIsoDate } from '$lib/zone/resolve';
  import { PHASE_STYLES } from '$lib/schedule/phaseColors';
  import { formatRange } from '$lib/util/format';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const plant = $derived(data.plant);

  const location = $derived(prefs.location);
  const isSelected = $derived(prefs.selectedCrops.includes(plant.slug));

  const ctx = $derived.by(() => {
    if (!hasFrostDates(location)) return null;
    const lastFrost = parseIsoDate(location.lastFrostDate);
    const firstFrost = parseIsoDate(location.firstFrostDate);
    return { lastFrost, firstFrost, year: lastFrost.getFullYear() };
  });

  const resolvedPhases = $derived(ctx ? resolveSchedule(plant, ctx) : null);

  let selectedVariety = $state<string | null>(null);

  const activeMaturity = $derived.by(() => {
    if (!plant.varieties) return plant.growth.daysToMaturity;
    const v = plant.varieties.find((x) => x.slug === selectedVariety);
    return v?.daysToMaturity ?? plant.growth.daysToMaturity;
  });
</script>

<header class="flex items-center justify-between gap-4">
  <a href={resolvePath('/')} class="text-sm text-moss-light hover:text-moss dark:text-cream-soft">
    ← Home
  </a>
  <h1 class="font-display text-2xl font-semibold tracking-tight text-moss dark:text-cream">
    {plant.name}
  </h1>
  <button
    type="button"
    onclick={() => prefs.toggleCrop(plant.slug)}
    class="rounded-card border px-3 py-1.5 text-xs font-medium transition
      {isSelected
      ? 'border-terracotta bg-terracotta text-cream hover:bg-terracotta-soft'
      : 'border-sage/40 bg-cream-soft/60 text-moss hover:border-sage hover:bg-sage/10 dark:border-sage-dark/40 dark:bg-charcoal-soft dark:text-cream'}"
  >
    {isSelected ? 'Remove from my plants' : 'Add to my plants'}
  </button>
</header>

<main class="mt-8 grid gap-6 sm:grid-cols-2">
  <section>
    <h2 class="font-display text-lg font-semibold">At a glance</h2>
    <dl class="mt-2 space-y-1 text-sm text-moss-light dark:text-cream-soft">
      {#if plant.scientificName}
        <div><dt class="inline italic">{plant.scientificName}</dt></div>
      {/if}
      <div>
        <dt class="inline font-medium">Category:</dt>
        <dd class="inline">{plant.category}</dd>
      </div>
      <div>
        <dt class="inline font-medium">Days to maturity:</dt>
        <dd class="inline">
          {activeMaturity[0]}–{activeMaturity[1]}
        </dd>
      </div>
      <div>
        <dt class="inline font-medium">Spacing:</dt>
        <dd class="inline">
          {plant.growth.spacing.in}" / {plant.growth.spacing.cm} cm
        </dd>
      </div>
      <div>
        <dt class="inline font-medium">Sun:</dt>
        <dd class="inline">{plant.growth.sun}</dd>
      </div>
      <div>
        <dt class="inline font-medium">Water:</dt>
        <dd class="inline">{plant.growth.water}</dd>
      </div>
      <div>
        <dt class="inline font-medium">Frost tolerance:</dt>
        <dd class="inline">{plant.climate.frostTolerance}</dd>
      </div>
      <div>
        <dt class="inline font-medium">Hardiness zones:</dt>
        <dd class="inline">
          {plant.climate.hardinessZones[0]}–{plant.climate.hardinessZones[1]}
        </dd>
      </div>
    </dl>
  </section>

  <section>
    <h2 class="font-display text-lg font-semibold">Schedule</h2>
    {#if resolvedPhases}
      <p class="mt-1 text-xs text-moss-light dark:text-cream-soft">
        Dated for {location?.label}.
      </p>
      <ul class="mt-2 space-y-2 text-sm">
        {#each resolvedPhases as p, i (p.phase + i)}
          {@const style = PHASE_STYLES[p.phase]}
          <li class="flex flex-wrap items-baseline gap-2">
            <span class="rounded-full px-2 py-0.5 text-xs font-medium {style.fill} {style.text}">
              {style.label}
            </span>
            <span class="font-medium text-moss dark:text-cream">{formatRange(p.from, p.to)}</span>
            {#if p.notes}
              <span class="text-xs text-moss-light dark:text-cream-soft">— {p.notes}</span>
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <p class="mt-1 text-xs text-moss-light dark:text-cream-soft">
        Showing schedule expressions — <a class="underline" href={resolvePath('/')}
          >set your location</a
        > to see real dates.
      </p>
      <ul class="mt-2 space-y-1 text-sm text-moss-light dark:text-cream-soft">
        {#each plant.schedule as entry, i (entry.phase + i)}
          <li>
            <span class="font-medium">{PHASE_STYLES[entry.phase].label}</span>: {entry.from} → {entry.to}
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  {#if plant.varieties && plant.varieties.length > 0}
    <section class="sm:col-span-2">
      <h2 class="font-display text-lg font-semibold">Varieties</h2>
      <div class="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onclick={() => (selectedVariety = null)}
          aria-pressed={selectedVariety === null}
          class="rounded-full border px-2.5 py-1 text-xs transition
            {selectedVariety === null
            ? 'border-terracotta bg-terracotta text-cream'
            : 'border-sage/40 bg-cream-soft/60 text-moss hover:bg-sage/10 dark:border-sage-dark/40 dark:bg-charcoal-soft dark:text-cream'}"
        >
          Default
        </button>
        {#each plant.varieties as v (v.slug)}
          <button
            type="button"
            onclick={() => (selectedVariety = v.slug)}
            aria-pressed={selectedVariety === v.slug}
            class="rounded-full border px-2.5 py-1 text-xs transition
              {selectedVariety === v.slug
              ? 'border-terracotta bg-terracotta text-cream'
              : 'border-sage/40 bg-cream-soft/60 text-moss hover:bg-sage/10 dark:border-sage-dark/40 dark:bg-charcoal-soft dark:text-cream'}"
          >
            {v.name}
          </button>
        {/each}
      </div>
      <ul class="mt-3 grid gap-3 sm:grid-cols-2">
        {#each plant.varieties as v (v.slug)}
          <li
            class="rounded-card border border-sage/20 bg-cream-soft/60 p-3 dark:border-sage-dark/40 dark:bg-charcoal-soft
              {selectedVariety === v.slug ? 'ring-2 ring-terracotta' : ''}"
          >
            <h3 class="font-display font-medium">{v.name}</h3>
            {#if v.daysToMaturity}
              <p class="text-xs text-moss-light dark:text-cream-soft">
                {v.daysToMaturity[0]}–{v.daysToMaturity[1]} days
                {#if v.growthHabit}
                  · {v.growthHabit}
                {/if}
              </p>
            {/if}
            {#if v.notes}
              <p class="mt-1 text-sm">{v.notes}</p>
            {/if}
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if plant.harvest}
    <section class="sm:col-span-2">
      <h2 class="font-display text-lg font-semibold">Harvest</h2>
      <p class="mt-1 text-sm text-moss-light dark:text-cream-soft">{plant.harvest.cues}</p>
      {#if plant.harvest.storageNotes}
        <p class="mt-1 text-xs text-moss-light dark:text-cream-soft">
          <span class="font-medium text-moss dark:text-cream">Storage:</span>
          {plant.harvest.storageNotes}
        </p>
      {/if}
    </section>
  {/if}

  {#if plant.companions}
    <section class="sm:col-span-2">
      <h2 class="font-display text-lg font-semibold">Companions</h2>
      <div class="mt-1 grid gap-2 text-sm sm:grid-cols-2">
        {#if plant.companions.good.length > 0}
          <p>
            <span class="font-medium text-moss dark:text-cream">Good:</span>
            <span class="text-moss-light dark:text-cream-soft"
              >{plant.companions.good.join(', ')}</span
            >
          </p>
        {/if}
        {#if plant.companions.bad.length > 0}
          <p>
            <span class="font-medium text-moss dark:text-cream">Avoid:</span>
            <span class="text-moss-light dark:text-cream-soft"
              >{plant.companions.bad.join(', ')}</span
            >
          </p>
        {/if}
      </div>
    </section>
  {/if}

  {#if plant.pests.length > 0}
    <section class="sm:col-span-2">
      <h2 class="font-display text-lg font-semibold">Common pests &amp; issues</h2>
      <p class="mt-1 text-sm text-moss-light dark:text-cream-soft">{plant.pests.join(', ')}</p>
    </section>
  {/if}

  {#if plant.notes}
    <section class="sm:col-span-2">
      <h2 class="font-display text-lg font-semibold">Notes</h2>
      <p class="mt-2 text-sm text-moss-light dark:text-cream-soft">{plant.notes}</p>
    </section>
  {/if}
</main>
