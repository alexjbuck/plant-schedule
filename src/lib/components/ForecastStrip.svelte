<script lang="ts">
  import type { DailyForecast } from '$lib/weather/openMeteo';
  import { formatShortDate } from '$lib/util/format';

  type Props = {
    forecast: DailyForecast[];
  };

  let { forecast }: Props = $props();

  const stats = $derived.by(() => {
    if (forecast.length === 0) return null;
    const highs = forecast.map((d) => d.tempMaxF);
    const lows = forecast.map((d) => d.tempMinF);
    const top = Math.max(...highs);
    const bot = Math.min(...lows);
    return { top, bot, range: top - bot || 1 };
  });

  function frac(temp: number) {
    if (!stats) return 0;
    return (temp - stats.bot) / stats.range;
  }
</script>

{#if forecast.length > 0 && stats}
  <div
    class="rounded-card border border-sage/20 bg-cream-soft/40 p-3 dark:border-sage-dark/40 dark:bg-charcoal-soft"
  >
    <div class="mb-2 flex items-baseline justify-between text-xs">
      <span class="font-medium text-moss dark:text-cream">Next {forecast.length}-day forecast</span>
      <span class="text-moss-light dark:text-cream-soft">
        {stats.bot.toFixed(0)}° – {stats.top.toFixed(0)}°F
      </span>
    </div>
    <div
      class="grid gap-1"
      style="grid-template-columns: repeat({forecast.length}, minmax(0, 1fr));"
    >
      {#each forecast as d (d.date)}
        {@const isoDate = new Date(d.date + 'T00:00:00')}
        {@const lowFrac = frac(d.tempMinF)}
        {@const highFrac = frac(d.tempMaxF)}
        <div class="flex flex-col items-center gap-1">
          <span class="text-[10px] text-moss-light dark:text-cream-soft">
            {formatShortDate(isoDate)}
          </span>
          <div
            class="relative h-14 w-1.5 rounded-full bg-sage/15 dark:bg-sage-dark/30"
            title="Low {d.tempMinF.toFixed(0)}°F / High {d.tempMaxF.toFixed(0)}°F"
          >
            <span
              class="absolute left-0 right-0 rounded-full bg-terracotta"
              style="bottom: {lowFrac * 100}%; top: {(1 - highFrac) * 100}%;"
            ></span>
          </div>
          <span class="text-[10px] font-medium text-moss dark:text-cream"
            >{d.tempMaxF.toFixed(0)}°</span
          >
          <span class="text-[10px] text-moss-light dark:text-cream-soft"
            >{d.tempMinF.toFixed(0)}°</span
          >
        </div>
      {/each}
    </div>
  </div>
{/if}
