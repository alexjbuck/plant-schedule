<script lang="ts">
  import { resolve } from '$app/paths';

  const cardClass =
    'rounded-card border border-sage/20 bg-cream-soft/60 p-4 text-moss transition ' +
    'hover:border-sage/50 hover:bg-cream-soft ' +
    'dark:border-sage-dark/40 dark:bg-charcoal-soft dark:text-cream dark:hover:border-sage-light/50';
</script>

<header class="flex items-center justify-between">
  <h1 class="font-display text-2xl font-semibold tracking-tight text-moss dark:text-cream">
    Plant Schedule
  </h1>
</header>

<main class="mt-10 flex flex-1 flex-col gap-8">
  <section>
    <h2 class="font-display text-4xl font-semibold leading-tight text-moss dark:text-cream">
      A garden timeline tailored to <span class="text-terracotta">where you are</span>.
    </h2>
    <p class="mt-3 max-w-prose text-moss-light dark:text-cream-soft">
      Pick the crops you grow. Plant Schedule cross-references your hardiness zone and the 14-day
      forecast to tell you what to seed, transplant, and harvest — this weekend and across the whole
      season.
    </p>
  </section>

  <nav aria-label="Primary views" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <a href={resolve('/timeline')} class={cardClass}>
      <h3 class="font-display text-lg font-semibold">Year timeline</h3>
      <p class="text-sm text-moss-light dark:text-cream-soft">
        Gantt-style view of every selected crop across the whole season.
      </p>
    </a>
    <a href={resolve('/this-weekend')} class={cardClass}>
      <h3 class="font-display text-lg font-semibold">This weekend</h3>
      <p class="text-sm text-moss-light dark:text-cream-soft">
        Actionable list for the next seven days, sanity-checked against the forecast.
      </p>
    </a>
    <a href={resolve('/upcoming')} class={cardClass}>
      <h3 class="font-display text-lg font-semibold">Start preparing for</h3>
      <p class="text-sm text-moss-light dark:text-cream-soft">
        What's coming up two to six weeks out.
      </p>
    </a>
    <a href={resolve('/plants/[slug]', { slug: 'tomato' })} class={cardClass}>
      <h3 class="font-display text-lg font-semibold">Plant details</h3>
      <p class="text-sm text-moss-light dark:text-cream-soft">
        Spacing, depth, time to maturity, and harvest cues per crop.
      </p>
    </a>
  </nav>
</main>
