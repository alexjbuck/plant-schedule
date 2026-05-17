# Plant Schedule

A static SvelteKit SPA that shows a garden planting timeline tailored to
the visitor's location and live weather forecast. Deployed to GitHub
Pages on merge to `main`; PRs get Cloudflare Pages previews.

The goal: answer "I have time this weekend, what should I plant?" without
opening Google.

## Stack

- SvelteKit 2 (Svelte 5 runes), `@sveltejs/adapter-static`, prerendered SPA
- TypeScript throughout (`verbatimModuleSyntax`, strict)
- Tailwind v4 (CSS-first config in `src/app.css`)
- Zod 4 for plant-data validation
- Vitest 3 for unit tests
- Open-Meteo for forecast + geocoding (no API key, CORS-friendly)

## Project layout

```
src/
  app.html, app.css, app.d.ts
  lib/
    data/plants/*.json        Hand-curated plant catalog
    schema/plant.ts           Zod schema + types
    schedule/
      dsl.ts                  LFD/FFD-relative date DSL parser/resolver
      resolve.ts              Plant + ctx -> dated phases, window/flatten helpers
    weather/
      openMeteo.ts            Forecast + geocoding client with cache
      safety.ts               Forecast vs plant requirements -> warnings
    zone/lookup.ts            USDA zone derivation + frost-date defaults
    prefs.svelte.ts           $state-backed localStorage prefs
  routes/
    +layout.svelte, +layout.ts
    +page.svelte              Landing (onboarding TODO -- Phase 4)
    timeline/+page.svelte     Stub -- Phase 5
    this-weekend/+page.svelte Stub -- Phase 6
    upcoming/+page.svelte     Stub -- Phase 6
    plants/[slug]/+page.svelte Detail page, prerenders all plants
scripts/
  validate-plants.ts          Zod-validates every plant JSON
.github/workflows/
  ci.yml                      PR pipeline
  deploy.yml                  Production GH Pages deploy
  preview-teardown.yml        Deletes Cloudflare previews on PR close
```

## The schedule DSL

Phases in plant JSON use expressions relative to local frost dates:

- `LFD` last frost; `FFD` first frost
- `LFD-42d`, `LFD+6w`, `FFD-2w` -- signed offsets (`d` days or `w` weeks)
- `Mar-15` -- absolute date (for crops like garlic that ignore frost)

Resolution is pure: `resolve(expr, { lastFrost, firstFrost, year })` in
`src/lib/schedule/dsl.ts`. Build full plant schedules with
`resolveSchedule()` or `resolveForPlants()` in
`src/lib/schedule/resolve.ts`.

## Plant data model

`src/lib/schema/plant.ts` is the source of truth. Each crop has `growth`
(spacing/depth/days/sun/water), `climate` (frost tolerance, soil and air
temp bounds, hardiness zone range), `schedule[]` (phase + from/to DSL),
optional `companions`, `pests`, `harvest`, `notes`, and optional
`varieties[]` for sub-cultivars.

Validate locally: `pnpm validate:plants`.

## Commands

```bash
pnpm dev                local dev
pnpm build              production build (BASE_PATH=/plant-schedule for GH Pages)
pnpm check              svelte-check + tsc
pnpm test               vitest run
pnpm test:cov           with coverage (json-summary required for PR comment)
pnpm lint               oxlint (TS/JS) + eslint (.svelte only)
pnpm format             oxfmt + prettier (.svelte only)
pnpm format:check       check, don't write
pnpm validate:plants    Zod-validate every plant JSON
```

## Conventions

- **Formatting:** oxfmt owns `.ts/.js/.json`, prettier-plugin-svelte owns
  `.svelte`. Same style (100 width, single quotes, no trailing comma,
  semi, lf). Never run prettier on TS files.
- **Linting:** oxlint for TS/JS (fast), eslint-plugin-svelte only on
  `.svelte`. Add oxlint rules in `.oxlintrc.json`, not ESLint.
- **Navigation:** use `resolve()` from `$app/paths`, not `base + '/foo'`.
  `eslint-plugin-svelte` enforces this.
- **Reactivity:** Svelte 5 runes only. Don't destructure props (loses
  reactivity) -- use `const x = $derived(data.x)`.
- **Routes:** prerender via `+layout.ts`. Trailing slashes always.
- **Dynamic routes:** define `entries()` in `+page.ts` so adapter-static
  can prerender. See `routes/plants/[slug]/+page.ts` for the pattern.
- **Storage:** `localStorage` via the typed `prefs` store; sessionStorage
  for weather cache. Guard with `browser` so SSR/prerender doesn't break.
- **Tests:** unit-test pure functions. UI is exercised by Lighthouse a11y
  audits in CI; Playwright is queued for a later phase.
- **Commits:** one logical change each. Messages explain _why_, not
  _what_. lefthook installs pre-commit/pre-push hooks via the `prepare`
  script.

## CI

`.github/workflows/ci.yml` runs in parallel on every PR: format, lint,
typecheck, test (with coverage sticky comment), validate-plants, build ->
Cloudflare Pages preview (sticky URL comment) -> Lighthouse CI (sticky
per-route scores table).

Required repo secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
GitHub Pages site source must be "GitHub Actions".

## Aesthetic

Sage / terracotta / cream palette. Tokens in `src/app.css`:
`--color-sage`, `--color-terracotta`, `--color-cream`, `--color-moss`,
`--color-charcoal`, plus semantic `--color-act-now` and
`--color-plan-ahead`. Dark mode via `.dark` on `<html>`, auto from
`prefers-color-scheme` and overridable via `prefs.theme`. Fonts: Inter
(sans), Fraunces (display headings).

## Status

**Done:**

- Project scaffold, palette, dark mode, route stubs (PR #1)
- Pure-function data layer: Open-Meteo client, zone derivation, schedule
  resolver, forecast safety engine (PR #2)
- 33 unit tests passing

**Next (Phase 4):** onboarding flow on `/` -- geolocation + city search +
zone confirm + plant picker, all persisted to `prefs`. See `PLAN.md` for
the full remaining roadmap.
