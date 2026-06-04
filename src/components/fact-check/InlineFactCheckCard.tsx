// src/components/fact-check/InlineFactCheckCard.tsx
// Rendered inside blockContent when a factCheckEmbed block is encountered.
import Link from 'next/link';
import { VerdictBadge } from './VerdictBadge';
import type { FactCheckRating } from '@/lib/factCheck/verdictConfig';

interface InlineFactCheckData {
  _id: string;
  title: string;
  slug: { current: string };
  claim: string;
  rating: FactCheckRating;
  ratingExplanation: string;
  claimSource?: string;
}

interface InlineFactCheckCardProps {
  factCheck: InlineFactCheckData;
}

export function InlineFactCheckCard({ factCheck }: InlineFactCheckCardProps) {
  const { title, slug, claim, rating, ratingExplanation, claimSource } = factCheck;

  return (
    <aside className='my-6 border border-neutral-200 transition-colors hover:border-[#D70606] dark:border-neutral-700'>
      {/* Header bar */}
      <div className='flex items-center gap-3 bg-[#D70606] px-4 py-2'>
        <span className='text-xs font-black uppercase tracking-widest text-white'>Fact Check</span>
        <VerdictBadge rating={rating} size='sm' />
      </div>

      <div className='p-4'>
        {/* The claim */}
        <blockquote className='mb-3 border-l-4 border-neutral-300 pl-3 text-sm italic text-neutral-600 dark:border-neutral-600 dark:text-neutral-300'>
          <p className='mb-1 text-xs font-black uppercase not-italic tracking-widest text-neutral-400'>
            The Claim
          </p>
          {claim}
          {claimSource && (
            <footer className='mt-1 text-xs not-italic text-neutral-500'>— {claimSource}</footer>
          )}
        </blockquote>

        {/* Verdict explanation */}
        <p className='mb-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300'>
          {ratingExplanation}
        </p>

        {/* Link to full fact-check */}
        <Link
          href={`/fact-check/${slug.current}`}
          className='inline-block text-xs font-black uppercase tracking-widest text-[#D70606] hover:underline'
        >
          Read Full Fact Check →
        </Link>
      </div>

      {/* Footer with title */}
      <div className='border-t border-neutral-200 px-4 py-2 dark:border-neutral-700'>
        <p className='text-xs font-medium text-neutral-500 dark:text-neutral-400'>{title}</p>
      </div>
    </aside>
  );
}
