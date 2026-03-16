/* eslint-disable react/function-component-definition */
// src/app/(user)/articles/[slug]/page.tsx
import { cache } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { groq } from 'next-sanity';
import { PortableText } from '@portabletext/react';
import { RichTextComponents } from '@/components/providers/RichTextComponents';
import SocialShare from '@/components/global/SocialShare';
import { RectangleAd, BannerAd } from '@/components/ads';
import { AD_CONFIG } from '@/lib/ads/adConfig';

import urlForImage from '@/u/urlForImage';
import ClientSideRoute from '@/components/providers/ClientSideRoute';
import formatDate from '@/util/formatDate';
import getArticleDate from '@/util/getArticleDate';
import resolveHref from '@/util/resolveHref';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanityFetch } from '@/lib/sanity/lib/live';
import { queryArticleBySlug } from '@/lib/sanity/lib/queries';
import sanityClient from '@/lib/sanity/lib/client';
import { buildArticleMetadata } from '@/util/metadata';
import { NewsArticleStructuredData } from '@/components/seo/NewsArticleStructuredData';
import { getReadingTime } from '@/lib/readingTime';
import { CorrectionNotice } from '@/components/post/CorrectionNotice';

// import Comments from '@/c/post/Comments';

/**
 * Guard against Sanity fields that may be stored as a block object instead of a plain
 * string (e.g. from old schema versions or programmatic inserts). Returns the string
 * value if it is a string, or extracts the `content` field if present, otherwise null.
 */
function safeText(value: unknown): string | null {
  if (typeof value === 'string') return value || null;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const v = value as Record<string, unknown>;
    if (typeof v.content === 'string') return v.content || null;
    if (typeof v.text === 'string') return v.text || null;
  }
  return null;
}

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Article Not Found' };
  return buildArticleMetadata(article, slug);
}

export default async function Article({ params }: Props) {
  const { slug } = await params;
  const article: Article = (await getArticleBySlug(slug)) as Article;

  if (!article) notFound();

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      <NewsArticleStructuredData article={article} slug={slug} />
      {/* Hero Section */}
      <section className='relative overflow-hidden'>
        {/* Background Image with Overlay */}
        <div className='relative h-[60vh] min-h-[400px]'>
          <Image
            src={
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              urlForImage(article.mainImage as any)?.url() ?? ''
            }
            alt={article.mainImage?.alt ?? 'Article image'}
            fill
            className='object-cover'
            priority
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...(urlForImage(article.mainImage as any)
              ? {
                  placeholder: 'blur' as const,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  blurDataURL: urlForImage(article.mainImage as any)!.width(20).blur(10).url(),
                }
              : {})}
          />
          <div className='absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/20' />
        </div>

        {/* Article Header Content */}
        <div className='absolute inset-0 flex items-end'>
          <div className='mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6 lg:px-8'>
            <div className='space-y-6'>
              {/* Title */}
              <h1
                className={`text-4xl font-bold text-white sm:text-5xl lg:text-6xl${article.correction?.type === 'retraction' ? ' line-through opacity-60' : ''}`}
              >
                {article.title}
              </h1>

              {/* Description */}
              {safeText(article.description) && (
                <p className='max-w-3xl text-lg text-slate-200 sm:text-xl'>
                  {safeText(article.description)}
                </p>
              )}

              {/* Meta Information */}
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                {/* Author + Reviewed By */}
                <div className='flex flex-wrap items-center gap-3'>
                  <ClientSideRoute
                    route={resolveHref('author', article.author.slug?.current) ?? ''}
                  >
                    <div className='flex items-center space-x-3 rounded-lg bg-slate-900/50 p-3 backdrop-blur-sm transition-colors hover:bg-slate-900/70'>
                      <Image
                        src={
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          urlForImage(article.author.image as any)?.url() ?? ''
                        }
                        alt={article.author.image?.alt ?? 'Author image'}
                        width={48}
                        height={48}
                        className='rounded-full border-2 border-white/20 object-cover'
                      />
                      <div>
                        <p className='font-semibold text-white'>{article.author.name}</p>
                        <p className='text-sm text-slate-300'>Author</p>
                      </div>
                    </div>
                  </ClientSideRoute>

                  {article.reviewedBy && (
                    <span className='text-sm text-slate-400'>
                      Reviewed by{' '}
                      <Link
                        href={`/author/${article.reviewedBy.slug?.current}`}
                        className='font-medium text-slate-300 underline hover:text-white'
                      >
                        {article.reviewedBy.name}
                      </Link>
                    </span>
                  )}
                </div>

                <div className='flex flex-col items-end gap-2'>
                  <div className='flex flex-wrap items-center gap-3 text-slate-300'>
                    {article.location && (
                      <span className='flex items-center text-sm'>📍 {article.location}</span>
                    )}
                    <time className='text-sm'>{formatDate(getArticleDate(article))}</time>
                    <span className='text-sm' aria-label='Estimated reading time'>
                      · {getReadingTime(article.body)}
                    </span>
                    {article.updatedAt && article.updatedAt !== article.publishedAt && (
                      <span className='text-sm text-slate-400'>
                        Updated: {formatDate(article.updatedAt)}
                      </span>
                    )}
                  </div>
                  {/* Categories */}
                  {article.categories && article.categories.length > 0 && (
                    <div className='flex flex-wrap justify-end gap-2'>
                      {article.categories.map((category) => (
                        <span
                          key={category._id}
                          className='inline-flex items-center rounded-full bg-untele/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm'
                        >
                          {category.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className='mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8'>
        {/* Social Share */}
        <div className='mb-8'>
          <SocialShare url={`https://untelevised.media/articles/${slug}`} title={article.title} />
        </div>

        {/* Rectangle Ad after social share */}
        <div className='mb-8 flex justify-center'>
          <RectangleAd
            slot={AD_CONFIG.AD_SLOTS.ARTICLE_RECTANGLE}
            className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
          />
        </div>

        {/* Article Content */}
        <article className='prose prose-lg prose-slate dark:prose-invert max-w-none'>
          {/* Featured Image (if different from hero) */}
          <div className='not-prose mb-8'>
            <div className='overflow-hidden rounded-xl border border-slate-200 shadow-lg dark:border-slate-700'>
              <Image
                src={
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  urlForImage(article.mainImage as any)?.url() ?? ''
                }
                alt={article.mainImage?.alt ?? 'Article image'}
                width={800}
                height={450}
                className='h-auto w-full object-cover'
              />
            </div>
          </div>

          {/* Embedded Video */}
          {article.hasEmbeddedVideo && (
            <div className='not-prose mb-8'>
              <div className='aspect-video overflow-hidden rounded-xl border border-slate-200 shadow-lg dark:border-slate-700'>
                <iframe
                  src={article.videoLink}
                  title='Article video'
                  className='h-full w-full'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen'
                />
              </div>
            </div>
          )}

          {/* Correction / Retraction Notice */}
          {article.correction?.detail && (
            <div className='not-prose'>
              <CorrectionNotice correction={article.correction} />
            </div>
          )}

          {/* Article Body */}
          <div className='rounded-xl border border-slate-200 bg-white/50 p-8 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/50'>
            <PortableText value={article.body} components={RichTextComponents} />
          </div>

          {/* Sources */}
          {article.sources && article.sources.length > 0 && (
            <div className='not-prose mt-8 rounded-xl border border-slate-200 bg-white/50 p-6 dark:border-slate-700 dark:bg-slate-900/50'>
              <h3 className='mb-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                Sources
              </h3>
              <ul className='space-y-1'>
                {article.sources.map((source, i) => (
                  <li key={i} className='flex items-start gap-2 text-sm'>
                    <span className='mt-0.5 text-untele'>↗</span>
                    {source.url ? (
                      <a
                        href={source.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-slate-700 underline hover:text-untele dark:text-slate-300'
                      >
                        {source.label || source.url}
                      </a>
                    ) : (
                      <span className='text-slate-700 dark:text-slate-300'>{source.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* FAQs */}
          {article.faqs && article.faqs.length > 0 && (
            <div className='not-prose mt-8 rounded-xl border border-slate-200 bg-white/50 p-6 dark:border-slate-700 dark:bg-slate-900/50'>
              <h3 className='mb-4 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                Frequently Asked Questions
              </h3>
              <dl className='space-y-4'>
                {article.faqs.map((faq, i) => (
                  <div key={i} className='border-b border-slate-200 pb-4 last:border-0 last:pb-0 dark:border-slate-700'>
                    <dt className='mb-1 font-semibold text-slate-900 dark:text-white'>
                      {safeText(faq.question)}
                    </dt>
                    <dd className='text-sm text-slate-600 dark:text-slate-400'>{safeText(faq.answer)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </article>

        {/* Banner Ad after article content */}
        <div className='mb-8 mt-12'>
          <BannerAd
            slot={AD_CONFIG.AD_SLOTS.ARTICLE_BANNER_BOTTOM}
            className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
          />
        </div>

        {/* Related Articles */}
        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <section className='mt-12'>
            <h2 className='mb-6 text-2xl font-bold text-slate-900 dark:text-white'>
              Related Articles
            </h2>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {article.relatedArticles.map((related) => (
                <Link
                  key={related._id}
                  href={`/articles/${related.slug}`}
                  className='group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow transition-all hover:border-untele dark:border-slate-700 dark:bg-slate-800'
                >
                  {related.mainImage && (
                    <div className='aspect-video overflow-hidden'>
                      <Image
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        src={urlForImage(related.mainImage as any)?.url() ?? ''}
                        alt={related.mainImage.alt ?? related.title}
                        width={400}
                        height={225}
                        className='h-full w-full object-cover transition-transform group-hover:scale-105'
                      />
                    </div>
                  )}
                  <div className='flex flex-1 flex-col p-4'>
                    <h3 className='mb-2 line-clamp-2 font-semibold text-slate-900 group-hover:text-untele dark:text-white'>
                      {related.title}
                    </h3>
                    {safeText(related.description) && (
                      <p className='mb-3 line-clamp-2 flex-1 text-sm text-slate-600 dark:text-slate-400'>
                        {safeText(related.description)}
                      </p>
                    )}
                    <div className='mt-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400'>
                      {related.author?.name && (
                        <span className='font-medium'>{related.author.name}</span>
                      )}
                      {related.publishedAt && (
                        <time>{formatDate(related.publishedAt)}</time>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Comments Section Placeholder */}
        <div className='mt-12'>{/* <Comments article={article}/> */}</div>
      </main>
    </div>
  );
}

// React.cache deduplicates this fetch when called from both generateMetadata and the page component
const getArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  try {
    const { data: article } = await sanityFetch({
      query: queryArticleBySlug,
      params: { slug },
      tags: ['article'],
    });
    return article;
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
});

// Generate the static params for the article list
export async function generateStaticParams() {
  const query = groq`*[_type=='article'] { slug }`;
  // Use sanityClient directly to avoid draftMode() call during static generation
  const slugs: Article[] = await sanityClient.fetch(query);
  const slugRoutes = slugs ? slugs.map((slug) => slug.slug.current) : [];
  return slugRoutes.map((slug) => ({
    slug,
  }));
}
