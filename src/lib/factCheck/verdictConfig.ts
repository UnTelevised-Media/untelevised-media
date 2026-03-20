// src/lib/factCheck/verdictConfig.ts

export type FactCheckRating =
  | 'true'
  | 'mostly-true'
  | 'misleading'
  | 'mostly-false'
  | 'false'
  | 'unverifiable';

export interface VerdictConfig {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  ratingValue: number; // schema.org 1-5 scale
  bestRating: number;
  worstRating: number;
}

export const VERDICT_CONFIG: Record<FactCheckRating, VerdictConfig> = {
  true: {
    label: 'TRUE',
    bgClass: 'bg-green-600',
    textClass: 'text-white',
    borderClass: 'border-green-600',
    ratingValue: 5,
    bestRating: 5,
    worstRating: 1,
  },
  'mostly-true': {
    label: 'MOSTLY TRUE',
    bgClass: 'bg-green-400',
    textClass: 'text-black',
    borderClass: 'border-green-400',
    ratingValue: 4,
    bestRating: 5,
    worstRating: 1,
  },
  misleading: {
    label: 'MISLEADING',
    bgClass: 'bg-amber-400',
    textClass: 'text-black',
    borderClass: 'border-amber-400',
    ratingValue: 3,
    bestRating: 5,
    worstRating: 1,
  },
  'mostly-false': {
    label: 'MOSTLY FALSE',
    bgClass: 'bg-orange-500',
    textClass: 'text-white',
    borderClass: 'border-orange-500',
    ratingValue: 2,
    bestRating: 5,
    worstRating: 1,
  },
  false: {
    label: 'FALSE',
    bgClass: 'bg-[#D70606]',
    textClass: 'text-white',
    borderClass: 'border-[#D70606]',
    ratingValue: 1,
    bestRating: 5,
    worstRating: 1,
  },
  unverifiable: {
    label: 'UNVERIFIABLE',
    bgClass: 'bg-neutral-500',
    textClass: 'text-white',
    borderClass: 'border-neutral-500',
    ratingValue: 0,
    bestRating: 5,
    worstRating: 1,
  },
};
