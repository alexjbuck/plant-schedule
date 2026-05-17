<script lang="ts">
  import { resolve as resolvePath } from '$app/paths';
  import { browser } from '$app/environment';
  import CitySearch from '$lib/components/CitySearch.svelte';
  import PlantPicker from '$lib/components/PlantPicker.svelte';
  import ZonePicker from '$lib/components/ZonePicker.svelte';
  import { prefs } from '$lib/prefs.svelte';
  import { defaultZoneForLat, buildResolvedLocation, isZone } from '$lib/zone/resolve';
  import type { Zone } from '$lib/zone/lookup';
  import type { Geocoded } from '$lib/weather/openMeteo';

  let geoBusy = $state(false);
  let geoError: string | null = $state(null);

  const location = $derived(prefs.location);
  const selectedZone = $derived<Zone>(
    location?.zone && isZone(location.zone)
      ? location.zone
      : location
        ? defaultZoneForLat(location.lat)
        : '6a'
  );

  function applyLocation(input: {
    lat: number;
    lon: number;
    label: string;
    countryCode: string;
    zone?: Zone;
  }) {
    const zone = input.zone ?? defaultZoneForLat(input.lat);
    prefs.location = buildResolvedLocation({
      lat: input.lat,
      lon: input.lon,
      label: input.label,
      countryCode: input.countryCode,
      zone
    });
  }

  function onCityPick(g: Geocoded) {
    applyLocation({
      lat: g.lat,
      lon: g.lon,
      label: g.label,
      countryCode: g.countryCode
    });
  }

  function onZoneChange(z: Zone) {
    if (!location) return;
    applyLocation({
      lat: location.lat,
      lon: location.lon,
      label: location.label,
      countryCode: location.countryCode,
      zone: z
    });
  }

  function useMyLocation() {
    if (!browser || !navigator.geolocation) {
      geoError = 'Geolocation isn’t available — try searching for a city.';
      return;
    }
    geoBusy = true;
    geoError = null;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        geoBusy = false;
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        applyLocation({
          lat,
          lon,
          label: `Near ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
          countryCode: ''
        });
      },
      (err) => {
        geoBusy = false;
        geoError =
          err.code === err.PERMISSION_DENIED
            ? 'Permission denied — search for a city instead.'
            : 'Couldn’t read your location. Try the search box.';
      },
      { timeout: 8000, maximumAge: 60_000 }
    );
  }

  function clearLocation() {
    prefs.location = null;
  }

  const cropCount = $derived(prefs.selectedCrops.length);
  const canSeeTimeline = $derived(!!location && cropCount > 0);
</script>

<header class="flex items-center justify-between">
  <h1 class="font-display text-2xl font-semibold tracking-tight text-moss dark:text-cream">
    Plant Schedule
  </h1>
</header>

<main class="mt-10 flex flex-1 flex-col gap-10">
  <section>
    <h2 class="font-display text-4xl font-semibold leading-tight text-moss dark:text-cream">
      A garden timeline tailored to <span class="text-terracotta">where you are</span>.
    </h2>
    <p class="mt-3 max-w-prose text-moss-light dark:text-cream-soft">
      Tell us your location and what you grow. We’ll cross-reference your hardiness zone and the
      14-day forecast to tell you exactly what to seed, transplant, and harvest this weekend and
      across the whole season.
    </p>
  </section>

  <section
    class="rounded-card border border-sage/20 bg-cream-soft/40 p-5
      dark:border-sage-dark/40 dark:bg-charcoal-soft"
  >
    <h2 class="font-display text-xl font-semibold">1. Where are you gardening?</h2>

    {#if location}
      <p class="mt-2 text-sm text-moss-light dark:text-cream-soft">
        Set to <strong class="text-moss dark:text-cream">{location.label}</strong>
        ({location.lat.toFixed(2)}, {location.lon.toFixed(2)})
      </p>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <ZonePicker value={selectedZone} onChange={onZoneChange} />
        <div class="self-end text-sm text-moss-light dark:text-cream-soft">
          {#if location.lastFrostDate && location.firstFrostDate}
            <p>
              <span class="font-medium text-moss dark:text-cream">Last frost</span>:
              {location.lastFrostDate}
            </p>
            <p>
              <span class="font-medium text-moss dark:text-cream">First frost</span>:
              {location.firstFrostDate}
            </p>
          {/if}
        </div>
      </div>
      <button
        type="button"
        onclick={clearLocation}
        class="mt-3 text-sm text-terracotta underline hover:text-terracotta-soft"
      >
        Change location
      </button>
    {:else}
      <div class="mt-3 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
        <CitySearch onSelect={onCityPick} />
        <div class="flex flex-col gap-2 sm:items-end">
          <button
            type="button"
            disabled={geoBusy}
            onclick={useMyLocation}
            class="rounded-card border border-sage/40 bg-cream-soft px-3 py-2 text-sm font-medium text-moss
              hover:border-sage hover:bg-sage/10 disabled:opacity-50
              dark:border-sage-dark/40 dark:bg-charcoal-soft dark:text-cream"
          >
            {geoBusy ? 'Locating…' : 'Use my location'}
          </button>
          {#if geoError}
            <p class="max-w-xs text-xs text-terracotta">{geoError}</p>
          {/if}
        </div>
      </div>
    {/if}
  </section>

  <section
    class="rounded-card border border-sage/20 bg-cream-soft/40 p-5
      dark:border-sage-dark/40 dark:bg-charcoal-soft"
  >
    <div class="flex items-baseline justify-between gap-3">
      <h2 class="font-display text-xl font-semibold">2. What do you grow?</h2>
      <p class="text-xs text-moss-light dark:text-cream-soft">
        {cropCount} selected
      </p>
    </div>
    <p class="mt-1 text-sm text-moss-light dark:text-cream-soft">
      Tap a chip to add or remove a crop. You can change this at any time.
    </p>
    <div class="mt-4">
      <PlantPicker />
    </div>
  </section>

  <section class="flex flex-wrap items-center gap-3">
    <a
      href={resolvePath('/timeline')}
      aria-disabled={!canSeeTimeline}
      tabindex={canSeeTimeline ? 0 : -1}
      class="inline-flex items-center rounded-card bg-terracotta px-4 py-2 font-medium text-cream
        shadow-sm transition hover:bg-terracotta-soft
        aria-disabled:pointer-events-none aria-disabled:opacity-50"
    >
      See my timeline →
    </a>
    <a
      href={resolvePath('/this-weekend')}
      class="text-sm text-moss-light underline hover:text-moss dark:text-cream-soft"
    >
      What about this weekend?
    </a>
    {#if !canSeeTimeline}
      <p class="text-xs text-moss-light dark:text-cream-soft">
        {!location ? 'Pick a location' : 'Select at least one crop'} to continue.
      </p>
    {/if}
  </section>
</main>
