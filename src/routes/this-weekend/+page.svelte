<script lang="ts">
  import { resolve } from '$app/paths';
</script>

<header class="flex items-center justify-between">
  <a href={resolve('/')} class="text-sm text-moss-light hover:text-moss dark:text-cream-soft">
    ← Home
  </a>
  <h1 class="font-display text-2xl font-semibold tracking-tight text-moss dark:text-cream">
    This weekend
  </h1>
  <span></span>
</header>

<main class="mt-8">
  <p class="text-moss-light dark:text-cream-soft">
    Actionable next-7-days list coming soon. Will cross-check each phase against the 14-day forecast
    to flag frost risk, heat stress, and cold soil.
  </p>
</main>
