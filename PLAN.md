# Roadmap

All initial phases are complete. This file is kept as a changelog of how
plant-schedule got from empty repo to shipping. New work tracks via
issues and PRs.

See `CLAUDE.md` for project layout, conventions, and the data model.

## Phase 1 — Scaffold (done, PR #1)

- SvelteKit + TS + Tailwind v4 + adapter-static
- Palette, dark mode, route stubs
- oxfmt / oxlint / prettier-svelte / eslint-svelte / svelte-check
- lefthook pre-commit and pre-push
- CI: format, lint, typecheck, test, validate-plants, build,
  Cloudflare preview, Lighthouse
- Production deploy on push to `main`

## Phase 2 — Schema + DSL + seed crop (done, PR #1)

- Zod plant schema with optional `varieties[]`
- LFD/FFD-relative date DSL (`LFD-6w`, `FFD+2w`, `Mar-15`)
- `tomato.json` exercising the full schema
- 9 unit tests

## Phase 3 — Data plumbing (done, PR #2)

- `lib/weather/openMeteo.ts` — typed geocoding + 14-day forecast
  client, in-memory + sessionStorage cache (24h / 6h TTLs)
- `lib/zone/lookup.ts` — USDA zone derivation from extreme min temp;
  approximate frost-date defaults per zone (N + S hemispheres)
- `lib/schedule/resolve.ts` — plant + ctx → dated phases, with
  window-filter and flatten-across-plants helpers
- `lib/weather/safety.ts` — forecast safety engine (frost risk for
  tender plants, sub-tolerance lows, multi-day heat stress,
  cold-soil-for-germination)
- 24 new unit tests; 33 total

## Phase 4 — Onboarding flow on `/` (done)

First visit collects location + zone + selected crops in under 30
seconds, all persisted to `prefs`.

- City-search input with debounced `geocode()` calls
- `navigator.geolocation` fast path with search fallback
- Zone confirm dropdown (USDA 1a–13b), pre-filled from lookup
- `lastFrostDate` / `firstFrostDate` resolved via `defaultFrostDates()`
- `ResolvedLocation` persisted in `prefs.svelte.ts`
- Plant picker chips wired to `prefs.toggleCrop()`
- "See my timeline" CTA, disabled until ≥1 crop selected

## Phase 5 — Year timeline view (done)

- Responsive layout: horizontal Gantt at `≥sm`, vertical month-list at
  `<sm`
- `resolveForPlants(plants, ctx)` driving the rows
- Colored phase segments, today-marker rule, sticky header
- Phase-color tokens centralized; chips elsewhere reuse them
- Hover/tap tooltip with date range + notes
- Click segment → `/plants/[slug]`
- Arrow-key navigation, per-segment ARIA labels

## Phase 6 — `/this-weekend` + `/upcoming` (done)

**`/this-weekend`:** today through today + 7. Each match runs
`plantWarnings(plant, forecast)` and renders severity-sorted, with a
7-day forecast high/low strip at the top.

**`/upcoming`:** today + 7 through today + 42, grouped by week. No
forecast warnings (out of forecast range).

## Phase 7 — Plant detail polish (done)

- Resolved dates surfaced on `/plants/[slug]` using `prefs.location`
- Variety chips when present; days-to-maturity updates with selection
- "Add to my plants" / "Remove" toggle wired to `prefs.toggleCrop()`

## Phase 8 — Catalog seed (done)

Initial curated crops landed: pepper, cucumber, summer-squash,
winter-squash, bush-bean, snap-pea, lettuce, spinach, kale, carrot,
beet, radish, onion, garlic, broccoli, cabbage, basil, cilantro,
potato.

## Phase 9 — PWA (done)

- `@vite-pwa/sveltekit` plugin
- Precache plant JSON + app shell (cache-first, build-hash versioned);
  SWR (6h) for forecast and geocoding
- Web manifest with sage/terracotta theme color and a maskable leaf icon
- Install-prompt UI ("install for offline garden notes")

## Phase 10 — CI polish (done)

- `knip` dead-code audit in CI
- `size-limit` budgets on app shell + JS chunks
- Coverage sticky comment, Lighthouse per-route scores, Cloudflare
  preview teardown on PR close

## Phase 11 — Catalog expansion (done)

Catalog grown to 100+ entries across multiple PRs:

- Major vegetables and core herbs
- Specialty veg, perennials, additional herbs
- Perennial veg, lesser-known beans, Italian greens
- Uncommon herbs and perennial edibles
- Exotics, microgreens, edible flowers
- Asian greens, heat-loving spinach substitutes, Victorian perennials

## Beyond

Future work — Playwright + axe e2e, custom domain (drops `BASE_PATH`),
variety-level scheduling, multi-location prefs — tracked as issues
rather than phases here.
