import { error } from '@sveltejs/kit';
import { allPlants, plantBySlug } from '$lib/data/plants';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => allPlants.map((p) => ({ slug: p.slug }));

export const load: PageLoad = ({ params }) => {
  const plant = plantBySlug(params.slug);
  if (!plant) error(404, `Unknown plant: ${params.slug}`);
  return { plant };
};
