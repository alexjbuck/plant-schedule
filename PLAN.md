# Roadmap

This is a working document. Phases 1-3 are complete; the rest are
queued. Each phase should ship as its own PR.

See `CLAUDE.md` for project layout, conventions, and the data model.

## Phase 1 -- Scaffold (done, PR #1)

- SvelteKit + TS + Tailwind v4 + adapter-static
- Palette, dark mode, route stubs
- oxfmt / oxlint / prettier-svelte / eslint-svelte / svelte-check
- lefthook pre-commit and pre-push
- CI: format, lint, typecheck, test, validate-plants, build,
  Cloudflare preview, Lighthouse
- Production deploy on push to `main`

## Phase 2 -- Schema + DSL + seed crop (done, PR #1)

- Zod plant schema with optional `varieties[]`
- LFD/FFD-relative date DSL (`LFD-6w`, `FFD+2w`, `Mar-15`)
- `tomato.json` exercising the full schema
- 9 unit tests

## Phase 3 -- Data plumbing (done, PR #2)

- `lib/weather/openMeteo.ts` -- typed geocoding + 14-day forecast
  client, in-memory + sessionStorage cache (24h / 6h TTLs)
- `lib/zone/lookup.ts` -- USDA zone derivation from extreme min temp;
  approximate frost-date defaults per zone (N + S hemispheres)
- `lib/schedule/resolve.ts` -- plant + ctx -> dated phases, with
  window-filter and flatten-across-plants helpers
- `lib/weather/safety.ts` -- forecast safety engine (frost risk for
  tender plants, sub-tolerance lows, multi-day heat stress,
  cold-soil-for-germination)
- 24 new unit tests; 33 total

## Phase 4 -- Onboarding flow on `/` (next)

First visit collects location + zone + selected crops in under 30
seconds, all persisted to `prefs`.

- City-search input with debounced calls to `geocode()`
- `navigator.geolocation` as the fast path; on permission deny or
  timeout fall back to search
- Zone confirm dropdown (USDA 1a-13b) -- pre-fill from a sensible
  default if we can, let the user override
- Compute `lastFrostDate` / `firstFrostDate` via
  `defaultFrostDates(zone, year, hemisphereFor(lat))`
- Persist resolved `ResolvedLocation` (type already in
  `src/lib/prefs.svelte.ts`)
- Plant picker -- chip per crop in `src/lib/data/plants/`, toggled via
  `prefs.toggleCrop()`
- "See my timeline" CTA -> `resolve('/timeline')`, disabled until at
  least one crop is selected
- Tests: zone-default frost dates, location persistence round-trip,
  plant toggle

## Phase 5 -- Year timeline view (the headline)

- Responsive layout: horizontal Gantt at `>=sm`, vertical month-list at
  `<sm`
- Pull selected plants -> `resolveForPlants(plants, ctx)`
- One row per plant, colored segments per phase, today-marker vertical
  rule, sticky header
- Phase-color map in one source-of-truth file (chips elsewhere reuse it)
- Hover or tap segment -> tooltip with date range + entry notes
- Click segment -> `/plants/[slug]`
- A11y: arrow-key navigation, ARIA labels per segment

## Phase 6 -- `/this-weekend` + `/upcoming`

**`/this-weekend`:**

- Window = today through today + 7
- For each selected crop: `phasesInWindow(resolved, today, today+7)`
- Run `plantWarnings(plant, forecast)` per match; show severity-sorted
- Each row: date pill, plant, phase verb, warnings, link to detail page
- Top strip: 7-day forecast high/low chart (small reusable component)

**`/upcoming`:**

- Window = today + 7 through today + 42
- Group by week ("Week of May 24", "Week of May 31", ...)
- Same row pattern, no forecast warnings (forecast doesn't extend that
  far)

## Phase 7 -- Plant detail polish

- Surface _resolved_ dates on `/plants/[slug]` using current
  `prefs.location`
- Variety chips when `plant.varieties.length > 0`; selection updates
  displayed days-to-maturity
- "Add to my plants" / "Remove" toggle wired to `prefs.toggleCrop()`

## Phase 8 -- Curate the catalog

Add these 19 crops as `src/lib/data/plants/<slug>.json` (lint via
`pnpm validate:plants`):

pepper, cucumber, summer-squash, winter-squash, bush-bean, snap-pea,
lettuce, spinach, kale, carrot, beet, radish, onion, garlic, broccoli,
cabbage, basil, cilantro, potato

## Phase 9 -- PWA

- `@vite-pwa/sveltekit` plugin
- Precache plant JSON + app shell (cache-first, build-hash versioned);
  SWR (6h) for forecast and geocoding
- Web manifest with sage/terracotta theme color and a maskable leaf icon
- Light install-prompt UI ("install for offline garden notes")

## Phase 10 -- Optional polish

- Wire `typos` and `knip` into CI (designed earlier, not yet landed)
- `size-limit` budgets in CI
- Playwright + `@axe-core/playwright` e2e + a11y audit
- Custom domain on GitHub Pages (drops the `BASE_PATH` config)
