// Single source of truth for phase colors. Used by the timeline, the
// "this weekend" list, the upcoming view, and plant-detail chips.

import type { Phase } from '$lib/schema/plant';

export type PhaseStyle = {
  /** Tailwind utility classes for solid-fill segments (background). */
  fill: string;
  /** Tailwind utility classes for the text color when rendered on the fill. */
  text: string;
  /** Tailwind class for the chip outline (used in list views). */
  outline: string;
  /** Short human label, used in tooltips and chips. */
  label: string;
};

export const PHASE_STYLES: Record<Phase, PhaseStyle> = {
  'indoor-start': {
    fill: 'bg-sage-light/80',
    text: 'text-moss',
    outline: 'border-sage-light text-moss',
    label: 'Start indoors'
  },
  'direct-sow': {
    fill: 'bg-sage',
    text: 'text-cream',
    outline: 'border-sage text-sage-dark dark:text-sage-light',
    label: 'Direct sow'
  },
  transplant: {
    fill: 'bg-terracotta',
    text: 'text-cream',
    outline: 'border-terracotta text-terracotta',
    label: 'Transplant'
  },
  thin: {
    fill: 'bg-sage-dark/70',
    text: 'text-cream',
    outline: 'border-sage-dark/60 text-sage-dark dark:text-sage-light',
    label: 'Thin'
  },
  'side-dress': {
    fill: 'bg-moss-light',
    text: 'text-cream',
    outline: 'border-moss-light text-moss',
    label: 'Side-dress'
  },
  harvest: {
    fill: 'bg-terracotta-soft',
    text: 'text-moss',
    outline: 'border-terracotta-soft text-terracotta',
    label: 'Harvest'
  }
};

