<script lang="ts">
  import { ZONES, type Zone } from '$lib/zone/lookup';

  type Props = {
    value: Zone;
    onChange: (zone: Zone) => void;
  };

  let { value, onChange }: Props = $props();
</script>

<label class="block text-sm font-medium text-moss dark:text-cream">
  USDA hardiness zone
  <select
    {value}
    onchange={(e) => onChange((e.currentTarget as HTMLSelectElement).value as Zone)}
    class="mt-1 block w-full rounded-card border border-sage/30 bg-cream-soft/40 px-3 py-2 text-moss
      focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30
      dark:border-sage-dark/40 dark:bg-charcoal-soft dark:text-cream"
  >
    {#each ZONES as z (z)}
      <option value={z}>{z}</option>
    {/each}
  </select>
</label>
