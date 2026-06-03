/* eslint-disable react/function-component-definition */
// src/app/(user)/tag/[slug]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import ArticleCardLg from '@/components/cards/ArticleCardLg';
import ClientSideRoute from '@/components/providers/ClientSideRoute';
import resolveHref from '@/util/resolveHref';
import { sanityFetch } from '@/lib/sanity/lib/fetch';
import sanityClient from '@/lib/sanity/lib/client';
import { queryAllTags, queryArticlesByTag } from '@/lib/sanity/lib/queries';
import { tagToSlug, slugToTagLabel } from '@/lib/tagUtils';
import { getCanonicalUrl, DEFAULT_OG_IMAGE, TWITTER_HANDLE } from '@/util/metadata';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = slugToTagLabel(slug);
  const canonicalUrl = getCanonicalUrl('tag', slug);
  return {
    title: `${label} | UnTelevised Media`,
    description: `Browse all UnTelevised Media articles filed under the tag "${label}".`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      title: `${label} | UnTelevised Media`,
      description: `Browse all UnTelevised Media articles filed under the tag "${label}".`,
      url: canonicalUrl,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${label} — UnTelevised Media` }],
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      title: `${label} | UnTelevised Media`,
    },
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;

  // Fetch all known tags to find the canonical raw tag string
  const { data: _allTags } = await sanityFetch({
    query: queryAllTags,
    tags: ['article'],
  });
  const allTags = (_allTags as string[]) ?? [];

  const matchedTag = allTags.find((tag: string) => tagToSlug(tag) === slug);

  if (!matchedTag) notFound();

  const { data: _articles } = await sanityFetch({
    query: queryArticlesByTag,
    params: { tag: matchedTag } as unknown as Record<string, string>,
    tags: ['article'],
  });
  const articles = _articles as Article[];

  const label = slugToTagLabel(slug);
  const articleCount = articles?.length ?? 0;

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${label} — UnTelevised Media`,
    description: `Browse all articles tagged "${label}" on UnTelevised Media.`,
    url: `https://www.untelevised.media/tag/${slug}`,
    publisher: {
      '@type': 'NewsMediaOrganization',
      '@id': 'https://www.untelevised.media/#organization',
      name: 'UnTelevised Media',
    },
  };

  return (
    <div className='mx-auto max-w-[95vw] md:max-w-[85vw]'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />

      <hr className='mb-8 border-untele' />

      {/* Breadcrumb */}
      <nav
        aria-label='Breadcrumb'
        className='mb-6 px-10 text-xs font-medium uppercase tracking-widest text-muted-foreground'
      >
        <ol className='flex items-center gap-2'>
          <li>
            <Link href='/' className='hover:text-untele transition-colors'>
              Home
            </Link>
          </li>
          <li aria-hidden='true'>/</li>
          <li>
            <span className='text-slate-500'>Tags</span>
          </li>
          <li aria-hidden='true'>/</li>
          <li className='text-slate-900 dark:text-white'>{label}</li>
        </ol>
      </nav>

      {/* Header bar */}
      <div className='mb-10 px-10'>
        <div className='mb-4 inline-flex items-center gap-3'>
          <span className='bg-untele px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white'>
            TAG
          </span>
          <h1 className='text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-white'>
            {label}
          </h1>
          <span className='text-sm font-medium text-slate-500 dark:text-slate-400'>
            {articleCount} {articleCount === 1 ? 'article' : 'articles'}
          </span>
        </div>
        <p className='max-w-2xl text-slate-600 dark:text-slate-400'>
          Browse all stories filed under{' '}
          <span className='font-semibold text-slate-800 dark:text-slate-200'>{label}</span>.
        </p>
      </div>

      {/* Articles grid */}
      {articleCount > 0 ? (
        <div className='grid grid-cols-1 gap-x-10 gap-y-12 px-10 pb-24 md:grid-cols-2 xl:grid-cols-3'>
          {articles.map((article: Article) => (
            <ClientSideRoute
              route={resolveHref('article', article.slug?.current) ?? ''}
              key={article._id}
            >
              <ArticleCardLg post={article} />
            </ClientSideRoute>
          ))}
        </div>
      ) : (
        <div className='px-10 pb-24'>
          <p className='text-slate-500 dark:text-slate-400'>
            No articles found for this tag yet.
          </p>
        </div>
      )}
    </div>
  );
}

export async function generateStaticParams() {
  const tags: string[] = await sanityClient.fetch(queryAllTags);
  if (!tags || tags.length === 0) return [];
  return tags.map((tag) => ({ slug: tagToSlug(tag) }));
}
