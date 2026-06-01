// src/app/(user)/fact-checks/page.tsx
import type { Metadata } from 'next';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryAllFactChecks } from '@/lib/sanity/lib/queries';
import FactCheckList from '@/components/fact-check/FactCheckList';
import type { FactCheckSummary } from '@/components/fact-check/FactCheckList';

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

export default async function FactChecksPage() {
  const factChecks = await sanityFetch<FactCheckSummary[]>({
    query: queryAllFactChecks,
    tags: ['factCheck'],
  });

  return (
    <main className='mx-auto max-w-4xl px-4 py-8'>
      {/* Section header */}
      <div className='mb-6 flex items-center gap-4'>
        <div className='bg-[#D70606] px-4 py-3'>
          <h1 className='text-xs font-black uppercase tracking-widest text-white'>Fact Checks</h1>
        </div>
        <div className='h-px flex-1 bg-neutral-200 dark:bg-neutral-700' />
        {factChecks?.length ? (
          <span className='text-xs font-bold uppercase tracking-widest text-neutral-400'>
            {factChecks.length} checks
          </span>
        ) : null}
      </div>

      <p className='mb-8 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400'>
        UnTelevised Media independently verifies viral claims, political statements, and
        misinformation. Each fact-check includes our verdict, a plain-language explanation, and
        all primary sources used in the review.
      </p>

      <FactCheckList factChecks={factChecks ?? []} />
    </main>
  );
}
