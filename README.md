# plant-schedule

> **I have time this weekend — what should I plant?**
>
> A garden planting calendar that already knows your zone, watches your
> forecast, and tells you what to sow today. No login. No app store.
> No tab in Chrome titled _"frost date by zip code"._

[![CI](https://github.com/alexjbuck/plant-schedule/actions/workflows/ci.yml/badge.svg)](https://github.com/alexjbuck/plant-schedule/actions/workflows/ci.yml)
[![Deploy](https://github.com/alexjbuck/plant-schedule/actions/workflows/deploy.yml/badge.svg)](https://github.com/alexjbuck/plant-schedule/actions/workflows/deploy.yml)

---

## What it does

plant-schedule is a static SvelteKit SPA that turns your location into a
personal planting calendar:

- **Tell it where you are** (geolocation or city search, ~5 seconds).
- **Pick the crops you care about** from a hand-curated catalog of
  100+ vegetables, herbs, and edible flowers.
- **Get three views of your year:**
  - **This weekend** — what's actionable in the next 7 days, with live
    forecast warnings (frost risk, cold soil, heatwave stress).
  - **Upcoming** — the next six weeks, grouped by week.
  - **Timeline** — a full-year Gantt of every phase for every crop:
    start-indoors, harden-off, direct-sow, transplant, harvest.

Everything is computed from your last-frost and first-frost dates, so
the same JSON catalog works from Zone 3 to Zone 11.

## How it works

```
   You ───► location ───► zone & frost dates ───► resolved schedule
                                                       │
            Open-Meteo forecast ──────► safety check ──┴──► UI
```

- **Location → zone.** USDA hardiness zone is derived from the lowest
  expected temperature at your coordinates. Frost dates fall out of a
  zone-by-hemisphere lookup table.
- **Plants → dates.** Each crop's `schedule[]` is written in a tiny
  frost-relative DSL — `LFD-6w` ("six weeks before last frost"),
  `FFD+2w`, or absolute like `Mar-15` — that resolves to real dates
  against _your_ frost calendar.
- **Forecast → warnings.** A 14-day forecast from
  [Open-Meteo](https://open-meteo.com) is checked against each plant's
  tolerances. Tender crops earn frost warnings; lettuce earns heat
  warnings; seeds earn cold-soil-for-germination warnings.

Pure functions all the way down. The whole data layer is unit-tested
without a browser.

## The schedule DSL

Phase windows in plant JSON are written relative to local frost dates:

| Expression | Meaning                                |
| ---------- | -------------------------------------- |
| `LFD`      | Last frost date                        |
| `FFD`      | First frost date                       |
| `LFD-6w`   | Six weeks before last frost            |
| `LFD+10d`  | Ten days after last frost              |
| `FFD-2w`   | Two weeks before first frost           |
| `Mar-15`   | Absolute date (e.g. for garlic, which ignores frost) |

Example, from `tomato.json`:

```json
"schedule": [
  { "phase": "start-indoors", "from": "LFD-8w", "to": "LFD-6w" },
  { "phase": "harden-off",    "from": "LFD-2w", "to": "LFD-1w" },
  { "phase": "transplant",    "from": "LFD+1w", "to": "LFD+3w" },
  { "phase": "harvest",       "from": "LFD+10w", "to": "FFD" }
]
```

## Tech stack

- **SvelteKit 2** with Svelte 5 runes, prerendered as a static SPA via
  `@sveltejs/adapter-static`
- **TypeScript** end-to-end (strict, `verbatimModuleSyntax`)
- **Tailwind v4** with CSS-first config — sage / terracotta / cream
  palette, dark mode auto-detected from `prefers-color-scheme`
- **Zod 4** validates every plant JSON at build time and in CI
- **Vitest 3** for unit tests
- **Open-Meteo** for forecast + geocoding (no API key, CORS-friendly)
- **Oxc** (`oxlint` + `oxfmt`) on TS/JS, ESLint + Prettier scoped to
  `.svelte` only

## Getting started

```bash
pnpm install
pnpm dev
```

Open <http://localhost:5173>. That's it — no env vars, no API keys, no
backend.

### Common commands

| Script                   | Does                                            |
| ------------------------ | ----------------------------------------------- |
| `pnpm dev`               | Local dev server with HMR                       |
| `pnpm build`             | Static production build                         |
| `pnpm check`             | `svelte-check` + `tsc`                          |
| `pnpm test`              | Run the Vitest suite                            |
| `pnpm test:cov`          | Run with coverage (JSON summary)                |
| `pnpm lint`              | `oxlint` + ESLint (Svelte only)                 |
| `pnpm format`            | `oxfmt` + Prettier (Svelte only)                |
| `pnpm validate:plants`   | Zod-validate every plant JSON                   |

## Project layout

```
src/
  lib/
    data/plants/*.json     100+ hand-curated crops
    schema/plant.ts        Zod schema + types (source of truth)
    schedule/
      dsl.ts               LFD/FFD date expression parser
      resolve.ts           Plant + ctx → dated phases
    weather/
      openMeteo.ts         Forecast + geocoding client (cached)
      safety.ts            Forecast vs requirements → warnings
    zone/lookup.ts         USDA zone + frost-date defaults
    prefs.svelte.ts        $state-backed localStorage prefs
  routes/
    +page.svelte           Onboarding (location + zone + crops)
    timeline/              Full-year Gantt
    this-weekend/          7-day window with forecast
    upcoming/              42-day window, grouped by week
    plants/[slug]/         Per-crop detail (prerendered)
scripts/
  validate-plants.ts       Build-time + CI plant validator
```

## Adding a crop

1. Create `src/lib/data/plants/<slug>.json`.
2. Match the schema in `src/lib/schema/plant.ts` — at minimum: `slug`,
   `name`, `category`, `growth`, `climate`, `schedule`.
3. Run `pnpm validate:plants` to confirm Zod is happy.
4. Commit. The CI pipeline re-validates on every PR.

The seed catalog (`tomato.json`, etc.) is a good reference for the full
shape, including optional `varieties[]`, `companions`, `pests`, and
`notes`.

## Deployment

- **Production** ships to GitHub Pages on merge to `main`
  (`.github/workflows/deploy.yml`).
- **PR previews** ship to Cloudflare Pages with a sticky URL comment on
  the PR; preview environments are torn down on PR close.
- **Lighthouse CI** posts per-route scores back to the PR.

Required repo secrets for the preview pipeline: `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID`. GitHub Pages source must be set to "GitHub
Actions".

## Status

The data layer is done and tested; the UI is being built phase by phase.
See [`PLAN.md`](./PLAN.md) for the roadmap and
[`CLAUDE.md`](./CLAUDE.md) for conventions and the data model in detail.

## License

MIT.
