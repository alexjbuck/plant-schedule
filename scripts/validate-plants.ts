// Validates every plant JSON file against the Zod schema.
// Run via `pnpm validate:plants` and from CI on PRs that touch plant data.

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { plantSchema } from '../src/lib/schema/plant.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLANTS_DIR = join(__dirname, '..', 'src', 'lib', 'data', 'plants');

type Result = { file: string; ok: boolean; issues?: z.core.$ZodIssue[] };

function validateOne(file: string): Result {
  const raw = readFileSync(join(PLANTS_DIR, file), 'utf8');
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    return {
      file,
      ok: false,
      issues: [
        {
          code: 'custom',
          path: [],
          message: `Invalid JSON: ${(error as Error).message}`
        } as z.core.$ZodIssue
      ]
    };
  }
  const result = plantSchema.safeParse(json);
  if (result.success) return { file, ok: true };
  return { file, ok: false, issues: result.error.issues };
}

const files = readdirSync(PLANTS_DIR).filter((f) => f.endsWith('.json'));
if (files.length === 0) {
  console.error(`No plant JSON files found in ${PLANTS_DIR}`);
  process.exit(1);
}

const results = files.map(validateOne);
const failed = results.filter((r) => !r.ok);

for (const r of results) {
  if (r.ok) {
    console.log(`  ok  ${r.file}`);
  } else {
    console.log(`  FAIL ${r.file}`);
    for (const issue of r.issues ?? []) {
      const path = issue.path.length > 0 ? issue.path.join('.') : '<root>';
      console.log(`       ${path}: ${issue.message}`);
    }
  }
}

const slugs = new Set<string>();
const dupes: string[] = [];
for (const file of files) {
  const slug = file.replace(/\.json$/, '');
  if (slugs.has(slug)) dupes.push(slug);
  slugs.add(slug);
}
if (dupes.length > 0) {
  console.log(`  FAIL duplicate slugs: ${dupes.join(', ')}`);
}

console.log(
  `\n${results.length - failed.length}/${results.length} plant files valid${
    dupes.length > 0 ? `, ${dupes.length} duplicate slugs` : ''
  }.`
);

if (failed.length > 0 || dupes.length > 0) process.exit(1);
