// src/app/(user)/fact-checks/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryAllFactChecks } from '@/lib/sanity/lib/queries';
import { VerdictBadge } from '@/components/fact-check/VerdictBadge';
import type { FactCheckRating } from '@/lib/factCheck/verdictConfig';
import formatDate from '@/util/formatDate';

export const metadata: Metadata = {
  title: 'Fact Checks | UnTelevised Media',
  description:
    'UnTelevised Media fact-checks viral claims, political statements, and misinformation with original reporting.',
  openGraph: {
    title: 'Fact Checks | UnTelevised Media',
    description:
      'UnTelevised Media fact-checks viral claims, political statements, and misinformation with original reporting.',
  },
};

interface FactCheckSummary {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  claim: string;
  claimSource?: string;
  rating: FactCheckRating;
  ratingExplanation: string;
  author?: { name: string; slug: { current: string } };
}

export default async function FactChecksPage() {
  const factChecks = await sanityFetch<FactCheckSummary[]>({
    query: queryAllFactChecks,
    tags: ['factCheck'],
  });

  return (
    <main className='mx-auto max-w-4xl px-4 py-8'>
      {/* Section header */}
      <div className='mb-6 bg-[#D70606] px-4 py-3'>
        <h1 className='text-xs font-black uppercase tracking-widest text-white'>Fact Checks</h1>
      </div>

      <p className='mb-8 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed'>
        UnTelevised Media independently verifies viral claims, political statements, and
        misinformation. Each fact-check includes our verdict, a plain-language explanation, and
        all primary sources used in the review.
      </p>

      {!factChecks || factChecks.length === 0 ? (
        <p className='text-sm text-neutral-500'>No fact-checks published yet.</p>
      ) : (
        <div className='space-y-px'>
          {factChecks.map((fc) => (
            <Link
              key={fc._id}
              href={`/fact-check/${fc.slug.current}`}
              className='flex items-start gap-4 border border-neutral-200 dark:border-neutral-700 p-4 hover:border-[#D70606] transition-colors group'
            >
              {/* Verdict badge — fixed width column */}
              <div className='shrink-0 mt-0.5 w-28'>
                <VerdictBadge rating={fc.rating} />
              </div>

              {/* Content */}
              <div className='flex-1 min-w-0'>
                <h2 className='font-bold text-slate-900 dark:text-neutral-100 leading-snug group-hover:text-[#D70606] transition-colors'>
                  {fc.title}
                </h2>
                <p className='mt-1 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 italic'>
                  "{fc.claim}"
                </p>
                {fc.claimSource && (
                  <p className='mt-0.5 text-xs text-neutral-400'>— {fc.claimSource}</p>
                )}
                <div className='mt-2 flex items-center gap-3 text-xs text-neutral-400 uppercase tracking-widest'>
                  {fc.author && <span>{fc.author.name}</span>}
                  {fc.author && fc.publishedAt && <span>·</span>}
                  {fc.publishedAt && <time>{formatDate(fc.publishedAt)}</time>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
