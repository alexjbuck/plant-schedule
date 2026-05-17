<script lang="ts">
  import { resolve } from '$app/paths';
</script>

<header class="flex items-center justify-between">
  <a href={resolve('/')} class="text-sm text-moss-light hover:text-moss dark:text-cream-soft">
    ← Home
  </a>
  <h1 class="font-display text-2xl font-semibold tracking-tight text-moss dark:text-cream">
    Year timeline
  </h1>
  <span></span>
</header>

<main class="mt-8">
  <p class="text-moss-light dark:text-cream-soft">
    Gantt-style timeline coming soon. Will render one row per selected crop, segments per phase,
    today-marker, and responsive vertical layout on mobile.
  </p>
</main>
