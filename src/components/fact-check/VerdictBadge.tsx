// src/components/fact-check/VerdictBadge.tsx
import { VERDICT_CONFIG, type FactCheckRating } from '@/lib/factCheck/verdictConfig';

interface VerdictBadgeProps {
  rating: FactCheckRating;
  size?: 'sm' | 'lg';
}

export function VerdictBadge({ rating, size = 'sm' }: VerdictBadgeProps) {
  const config = VERDICT_CONFIG[rating];
  if (!config) return null;

  const sizeClass =
    size === 'lg' ? 'px-4 py-2 text-sm font-black' : 'px-2 py-0.5 text-xs font-black';

  return (
    <span
      className={`inline-block uppercase tracking-widest ${sizeClass} ${config.bgClass} ${config.textClass}`}
    >
      {config.label}
    </span>
  );
}
