<script lang="ts">
  import { geocode, type Geocoded } from '$lib/weather/openMeteo';
  import { debounce } from '$lib/util/debounce';

  type Props = {
    onSelect: (g: Geocoded) => void;
    placeholder?: string;
  };

  let { onSelect, placeholder = 'City, state or country' }: Props = $props();

  let query = $state('');
  let results: Geocoded[] = $state([]);
  let loading = $state(false);
  let error: string | null = $state(null);

  const runQuery = debounce(async (term: string) => {
    if (term.trim().length < 2) {
      results = [];
      loading = false;
      return;
    }
    loading = true;
    error = null;
    try {
      results = await geocode(term, 6);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      results = [];
    } finally {
      loading = false;
    }
  }, 280);

  function onInput(event: Event) {
    query = (event.target as HTMLInputElement).value;
    runQuery(query);
  }

  function pick(g: Geocoded) {
    onSelect(g);
    query = '';
    results = [];
  }
</script>

<div class="space-y-2">
  <label class="block text-sm font-medium text-moss dark:text-cream">
    Search for a city
    <input
      type="search"
      autocomplete="off"
      {placeholder}
      value={query}
      oninput={onInput}
      class="mt-1 block w-full rounded-card border border-sage/30 bg-cream-soft/40 px-3 py-2 text-moss
        placeholder:text-moss-light/60 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30
        dark:border-sage-dark/40 dark:bg-charcoal-soft dark:text-cream dark:placeholder:text-cream-soft/40"
    />
  </label>

  {#if loading}
    <p class="text-xs text-moss-light dark:text-cream-soft">Searching…</p>
  {:else if error}
    <p class="text-xs text-terracotta">Couldn’t search: {error}</p>
  {:else if results.length > 0}
    <ul
      role="listbox"
      class="divide-y divide-sage/15 overflow-hidden rounded-card border border-sage/20 bg-cream-soft/60
        dark:divide-sage-dark/30 dark:border-sage-dark/40 dark:bg-charcoal-soft"
    >
      {#each results as g (g.label + g.lat + g.lon)}
        <li>
          <button
            type="button"
            class="block w-full px-3 py-2 text-left text-sm text-moss hover:bg-sage/10
              dark:text-cream dark:hover:bg-sage-dark/30"
            onclick={() => pick(g)}
          >
            {g.label}
          </button>
        </li>
      {/each}
    </ul>
  {:else if query.trim().length >= 2}
    <p class="text-xs text-moss-light dark:text-cream-soft">No matches.</p>
  {/if}
</div>
