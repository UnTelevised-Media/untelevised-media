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
    <aside className='my-6 border border-neutral-200 dark:border-neutral-700 hover:border-[#D70606] transition-colors'>
      {/* Header bar */}
      <div className='bg-[#D70606] px-4 py-2 flex items-center gap-3'>
        <span className='text-xs font-black uppercase tracking-widest text-white'>
          Fact Check
        </span>
        <VerdictBadge rating={rating} size='sm' />
      </div>

      <div className='p-4'>
        {/* The claim */}
        <blockquote className='border-l-4 border-neutral-300 dark:border-neutral-600 pl-3 italic text-sm text-neutral-600 dark:text-neutral-300 mb-3'>
          <p className='text-xs font-black uppercase tracking-widest not-italic text-neutral-400 mb-1'>
            The Claim
          </p>
          {claim}
          {claimSource && (
            <footer className='mt-1 text-xs not-italic text-neutral-500'>— {claimSource}</footer>
          )}
        </blockquote>

        {/* Verdict explanation */}
        <p className='text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3'>
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
      <div className='border-t border-neutral-200 dark:border-neutral-700 px-4 py-2'>
        <p className='text-xs text-neutral-500 dark:text-neutral-400 font-medium'>{title}</p>
      </div>
    </aside>
  );
}
