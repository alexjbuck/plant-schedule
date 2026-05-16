<script lang="ts">
  import { resolve } from '$app/paths';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const plant = $derived(data.plant);
</script>

<header class="flex items-center justify-between gap-4">
  <a href={resolve('/')} class="text-sm text-moss-light hover:text-moss dark:text-cream-soft">
    ← Home
  </a>
  <h1 class="font-display text-2xl font-semibold tracking-tight text-moss dark:text-cream">
    {plant.name}
  </h1>
  <span></span>
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
          {plant.growth.daysToMaturity[0]}–{plant.growth.daysToMaturity[1]}
        </dd>
      </div>
      <div>
        <dt class="inline font-medium">Spacing:</dt>
        <dd class="inline">
          {plant.growth.spacing.in}" / {plant.growth.spacing.cm} cm
        </dd>
      </div>
      <div>
        <dt class="inline font-medium">Frost tolerance:</dt>
        <dd class="inline">{plant.climate.frostTolerance}</dd>
      </div>
    </dl>
  </section>

  <section>
    <h2 class="font-display text-lg font-semibold">Schedule</h2>
    <ul class="mt-2 space-y-1 text-sm text-moss-light dark:text-cream-soft">
      {#each plant.schedule as entry (entry.phase + entry.from)}
        <li>
          <span class="font-medium">{entry.phase}</span>: {entry.from} → {entry.to}
        </li>
      {/each}
    </ul>
  </section>

  {#if plant.varieties && plant.varieties.length > 0}
    <section class="sm:col-span-2">
      <h2 class="font-display text-lg font-semibold">Varieties</h2>
      <ul class="mt-2 grid gap-3 sm:grid-cols-2">
        {#each plant.varieties as v (v.slug)}
          <li
            class="rounded-card border border-sage/20 bg-cream-soft/60 p-3 dark:border-sage-dark/40 dark:bg-charcoal-soft"
          >
            <h3 class="font-display font-medium">{v.name}</h3>
            {#if v.daysToMaturity}
              <p class="text-xs text-moss-light dark:text-cream-soft">
                {v.daysToMaturity[0]}–{v.daysToMaturity[1]} days
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

  {#if plant.notes}
    <section class="sm:col-span-2">
      <h2 class="font-display text-lg font-semibold">Notes</h2>
      <p class="mt-2 text-sm text-moss-light dark:text-cream-soft">{plant.notes}</p>
    </section>
  {/if}
</main>
