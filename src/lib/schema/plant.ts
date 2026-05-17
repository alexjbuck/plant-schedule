import { z } from 'zod';

// Schedule expressions are resolved relative to last/first frost date at runtime.
// Forms:
//   "LFD"          last frost date
//   "FFD"          first frost date
//   "LFD-42d"      LFD minus 42 days
//   "LFD+6w"       LFD plus 6 weeks
//   "Mar-15"       absolute (rare; use for crops that ignore frost dates, e.g. garlic)
const dateExpr = z
  .string()
  .regex(
    /^((LFD|FFD)([+-]\d+[dw])?|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-([1-9]|[12]\d|3[01]))$/,
    'Expected an LFD/FFD-relative expression or absolute "Mon-DD"'
  );

export const phase = z.enum([
  'indoor-start',
  'direct-sow',
  'transplant',
  'thin',
  'side-dress',
  'harvest'
]);
export type Phase = z.infer<typeof phase>;

const scheduleEntry = z.object({
  phase,
  from: dateExpr,
  to: dateExpr,
  notes: z.string().optional()
});

const measurement = z.object({
  in: z.number().positive(),
  cm: z.number().positive()
});

const variety = z.object({
  slug: z
    .string()
    .regex(/^[a-z][a-z0-9-]*$/, 'lowercase, kebab-case'),
  name: z.string(),
  growthHabit: z.string().optional(),
  subCategory: z.string().optional(),
  daysToMaturity: z.tuple([z.number().int(), z.number().int()]).optional(),
  notes: z.string().optional()
});

export const category = z.enum([
  'fruiting-vegetable',
  'leafy-green',
  'root-vegetable',
  'legume',
  'allium',
  'brassica',
  'herb',
  'tuber',
  'cucurbit',
  'flower',
  'other'
]);

export const plantSchema = z.object({
  slug: z.string().regex(/^[a-z][a-z0-9-]*$/),
  name: z.string(),
  scientificName: z.string().optional(),
  category,
  tags: z.array(z.string()).default([]),
  growth: z.object({
    daysToGermination: z.tuple([z.number().int(), z.number().int()]),
    daysToMaturity: z.tuple([z.number().int(), z.number().int()]),
    spacing: measurement,
    rowSpacing: measurement,
    depth: measurement,
    sun: z.enum(['full', 'partial', 'shade']),
    water: z.enum(['low', 'regular', 'regular-deep', 'high'])
  }),
  climate: z.object({
    frostTolerance: z.enum(['hardy', 'semi-hardy', 'tender', 'very-tender']),
    minSoilTempF: z.number(),
    optimalSoilTempF: z.tuple([z.number(), z.number()]),
    minNightTempF: z.number(),
    maxDayTempF: z.number(),
    hardinessZones: z.tuple([z.number().int(), z.number().int()])
  }),
  schedule: z.array(scheduleEntry).min(1),
  companions: z
    .object({
      good: z.array(z.string()).default([]),
      bad: z.array(z.string()).default([])
    })
    .optional(),
  pests: z.array(z.string()).default([]),
  harvest: z
    .object({
      cues: z.string(),
      storageNotes: z.string().optional()
    })
    .optional(),
  varieties: z.array(variety).optional(),
  notes: z.string().optional()
});

export type Plant = z.infer<typeof plantSchema>;
export type ScheduleEntry = z.infer<typeof scheduleEntry>;
export type Variety = z.infer<typeof variety>;
