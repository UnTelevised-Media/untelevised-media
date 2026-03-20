// src/app/(user)/fact-check/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import type { Metadata } from 'next';
import sanityFetch from '@/lib/sanity/lib/fetch';
import sanityClient from '@/lib/sanity/lib/client';
import { queryFactCheckBySlug } from '@/lib/sanity/lib/queries';
import { groq } from 'next-sanity';
import { VerdictBadge } from '@/components/fact-check/VerdictBadge';
import { RichTextComponents } from '@/components/providers/RichTextComponents';
import { buildClaimReviewJsonLd } from '@/lib/factCheck/claimReviewJsonLd';
import type { FactCheckRating } from '@/lib/factCheck/verdictConfig';
import formatDate from '@/util/formatDate';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // Use sanityClient directly — sanityFetch calls draftMode() which requires
  // a request context that does not exist during static param generation.
  const slugs = await sanityClient.fetch<{ slug: { current: string } }[]>(
    groq`*[_type == 'factCheck'] { slug }`,
  );
  return (slugs ?? []).map((fc) => ({ slug: fc.slug.current }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fc = await sanityFetch<{
    title: string;
    ratingExplanation: string;
  } | null>({
    query: queryFactCheckBySlug,
    params: { slug },
    tags: ['factCheck'],
  });
  if (!fc) return {};
  return {
    title: `Fact Check: ${fc.title} | UnTelevised Media`,
    description: fc.ratingExplanation,
    openGraph: {
      title: `Fact Check: ${fc.title}`,
      description: fc.ratingExplanation,
    },
  };
}

export default async function FactCheckPage({ params }: Props) {
  const { slug } = await params;

  const fc = await sanityFetch<{
    _id: string;
    title: string;
    slug: { current: string };
    publishedAt: string;
    claim: string;
    claimSource?: string;
    claimUrl?: string;
    claimDate?: string;
    rating: FactCheckRating;
    ratingExplanation: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any[];
    sources?: { label: string; url?: string }[];
    author?: { name: string; slug: { current: string } };
    relatedArticles?: {
      _id: string;
      title: string;
      slug: { current: string };
      publishedAt: string;
      description?: string;
    }[];
  } | null>({
    query: queryFactCheckBySlug,
    params: { slug },
    tags: ['factCheck'],
  });

  if (!fc) notFound();

  const jsonLd = buildClaimReviewJsonLd(fc);

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className='mx-auto max-w-3xl px-4 py-8'>
        {/* Breadcrumb */}
        <nav className='mb-6 text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-bold'>
          <Link href='/fact-checks' className='hover:text-[#D70606]'>
            Fact Checks
          </Link>
          <span className='mx-2'>›</span>
          <span className='text-neutral-400'>{fc.title}</span>
        </nav>

        {/* Verdict badge + title */}
        <div className='mb-2'>
          <VerdictBadge rating={fc.rating} size='lg' />
        </div>
        <h1 className='mt-4 text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white'>
          {fc.title}
        </h1>

        {/* Meta — author + date */}
        {(fc.author || fc.publishedAt) && (
          <div className='mt-3 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest'>
            {fc.author && (
              <Link
                href={`/author/${fc.author.slug.current}`}
                className='hover:text-[#D70606] font-bold'
              >
                {fc.author.name}
              </Link>
            )}
            {fc.author && fc.publishedAt && <span>·</span>}
            {fc.publishedAt && <time>{formatDate(fc.publishedAt)}</time>}
          </div>
        )}

        {/* The Claim blockquote */}
        <blockquote className='my-6 border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 italic text-neutral-600 dark:text-neutral-300'>
          <p className='text-xs font-black uppercase tracking-widest not-italic text-neutral-400 mb-1'>
            The Claim
          </p>
          {fc.claim}
          {fc.claimSource && (
            <footer className='mt-2 text-xs not-italic text-neutral-500'>
              — {fc.claimSource}
              {fc.claimUrl && (
                <a
                  href={fc.claimUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='ml-1 text-[#D70606] hover:underline'
                >
                  [source]
                </a>
              )}
            </footer>
          )}
        </blockquote>

        {/* Verdict explanation box */}
        <div className='my-4 border border-neutral-200 dark:border-neutral-700 p-4'>
          <p className='text-xs font-black uppercase tracking-widest text-neutral-500 mb-1'>
            Verdict
          </p>
          <p className='text-sm leading-relaxed text-slate-800 dark:text-slate-200'>
            {fc.ratingExplanation}
          </p>
        </div>

        {/* Full analysis body */}
        {fc.body && Array.isArray(fc.body) && fc.body.length > 0 && (
          <div className='mt-6'>
            <PortableText value={fc.body} components={RichTextComponents} />
          </div>
        )}

        {/* Sources */}
        {fc.sources && fc.sources.length > 0 && (
          <section className='mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-4'>
            <h2 className='text-xs font-black uppercase tracking-widest mb-3'>Sources</h2>
            <ul className='space-y-1'>
              {fc.sources.map((s, i) => (
                <li key={i} className='text-sm'>
                  {s.url ? (
                    <a
                      href={s.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-[#D70606] hover:underline'
                    >
                      {s.label}
                    </a>
                  ) : (
                    s.label
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Related articles */}
        {fc.relatedArticles && fc.relatedArticles.length > 0 && (
          <section className='mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-4'>
            <h2 className='text-xs font-black uppercase tracking-widest mb-3'>Related Articles</h2>
            <ul className='space-y-2'>
              {fc.relatedArticles.map((a) => (
                <li key={a._id}>
                  <Link
                    href={`/articles/${a.slug.current}`}
                    className='text-sm font-bold hover:text-[#D70606] transition-colors'
                  >
                    {a.title}
                  </Link>
                  {a.description && (
                    <p className='text-xs text-neutral-500 mt-0.5'>{a.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
