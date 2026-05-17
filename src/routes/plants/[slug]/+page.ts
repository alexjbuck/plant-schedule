import { error } from '@sveltejs/kit';
import type { Plant } from '$lib/schema/plant';
import type { EntryGenerator, PageLoad } from './$types';

const plantModules = import.meta.glob<{ default: Plant }>(
  '$lib/data/plants/*.json',
  { eager: true }
);

const plantsBySlug = new Map<string, Plant>();
for (const path in plantModules) {
  const slug = path.split('/').pop()!.replace(/\.json$/, '');
  plantsBySlug.set(slug, plantModules[path].default);
}

export const prerender = true;

export const entries: EntryGenerator = () =>
  [...plantsBySlug.keys()].map((slug) => ({ slug }));

export const load: PageLoad = ({ params }) => {
  const plant = plantsBySlug.get(params.slug);
  if (!plant) error(404, `Unknown plant: ${params.slug}`);
  return { plant };
};
