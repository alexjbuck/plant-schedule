<script lang="ts">
  import { allPlants } from '$lib/data/plants';
  import { prefs } from '$lib/prefs.svelte';

  const selected = $derived(new Set(prefs.selectedCrops));
</script>

<ul class="flex flex-wrap gap-2" role="list" aria-label="Crops">
  {#each allPlants as plant (plant.slug)}
    {@const isOn = selected.has(plant.slug)}
    <li>
      <button
        type="button"
        aria-pressed={isOn}
        onclick={() => prefs.toggleCrop(plant.slug)}
        class="rounded-full border px-3 py-1.5 text-sm transition
          {isOn
          ? 'border-terracotta bg-terracotta text-cream shadow-sm hover:bg-terracotta-soft'
          : 'border-sage/40 bg-cream-soft/60 text-moss hover:border-sage hover:bg-sage/10 dark:border-sage-dark/40 dark:bg-charcoal-soft dark:text-cream dark:hover:bg-sage-dark/30'}"
      >
        {plant.name}
      </button>
    </li>
  {/each}
</ul>
