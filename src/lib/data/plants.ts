// Central registry of every plant JSON in the catalog. Single source of truth
// for route entry generation, the onboarding picker, and timeline/weekly views.

import { plantSchema, type Plant } from '$lib/schema/plant';

const plantModules = import.meta.glob<{ default: unknown }>('./plants/*.json', {
  eager: true
});

const bySlug = new Map<string, Plant>();
for (const path in plantModules) {
  const slug = path.split('/').pop()!.replace(/\.json$/, '');
  const parsed = plantSchema.safeParse(plantModules[path].default);
  if (!parsed.success) {
    throw new Error(
      `Plant ${slug} failed validation. Run pnpm validate:plants for details.`
    );
  }
  bySlug.set(slug, parsed.data);
}

export const allPlants: readonly Plant[] = [...bySlug.values()].toSorted((a, b) =>
  a.name.localeCompare(b.name)
);

export const plantSlugs: readonly string[] = allPlants.map((p) => p.slug);

export function plantBySlug(slug: string): Plant | undefined {
  return bySlug.get(slug);
}
