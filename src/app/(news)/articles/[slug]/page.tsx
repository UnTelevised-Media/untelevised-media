import type { Article } from '@/models/types/sanity';
// src/app/(user)/articles/[slug]/page.tsx
import { cache } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { groq } from 'next-sanity';
import { PortableText } from '@portabletext/react';
import RichTextComponents from '@/components/providers/RichTextComponents';
import SocialShare from '@/components/global/SocialShare';
import { InFeedAd, BannerAd, SidebarAd } from '@/components/googleAdSense';
import { AD_CONFIG } from '@/lib/googleAdSense/adConfig';
import RecentBreakingNews from '@/components/article/RecentBreakingNews';

import urlForImage from '@/util/url/urlForImage';
import ClientSideRoute from '@/components/providers/ClientSideRoute';
import formatDate from '@/util/date/formatDate';
import getArticleDate from '@/util/date/getArticleDate';
import resolveHref from '@/util/url/resolveHref';
import { tagToSlug } from '@/util/content/tagUtils';
import formatTitleForURL from '@/util/url/formatTitleForURL';
import safeText from '@/util/text/safeText';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanityFetch } from '@/lib/sanity/lib/fetch';
import { queryArticleBySlug } from '@/lib/sanity/lib/queries';
import sanityClient from '@/lib/sanity/lib/client';
import { buildArticleMetadata } from '@/util/metadata/metadata';
import NewsArticleStructuredData from '@/components/seo/NewsArticleStructuredData';
import { getReadingTime } from '@/util/date/readingTime';
import YouTubeEmbed from '@/components/post/YouTubeEmbed';
import CorrectionNotice from '@/components/post/CorrectionNotice';
import SourcesPanel from '@/components/post/SourcesPanel';
import BookmarkButton from '@/components/bookmarks/BookmarkButton';
import CommentsSection from '@/components/post/CommentsSection';
import ImageGalleryCarousel from '@/components/post/ImageGalleryCarousel';
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup';
import ViewPing from '@/components/post/ViewPing';
import TrendingSection from '@/components/homepage/TrendingSection';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return { title: 'Article Not Found' };
  }
  return buildArticleMetadata(article, slug);
}


export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      {/* Social media embed SDKs — loaded only on article pages */}
      <Script
        src='https://www.tiktok.com/embed.js'
        strategy='lazyOnload'
      />
      <Script
        src='https://www.instagram.com/embed.js'
        strategy='lazyOnload'
      />
      <Script
        src='https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0'
        async
        defer
        crossOrigin='anonymous'
        strategy='lazyOnload'
      />

      <NewsArticleStructuredData article={article} slug={slug} />

      {/* BreadcrumbList JSON-LD */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://untelevised.media',
              },
              // GROQ query dereferences categories[]->, but TypeScript only sees CategoryReference[]
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...((article.categories as any)?.slice(0, 1).map((cat: any) => ({
                '@type': 'ListItem',
                position: 2,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                name: (cat as any)?.title ?? 'Category',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                item: `https://untelevised.media/category/${formatTitleForURL((cat as any)?.title ?? '')}`,
              })) ?? []),
              {
                '@type': 'ListItem',
                position: article.categories?.length ? 3 : 2,
                name: article.title,
                item: `https://untelevised.media/articles/${slug}`,
              },
            ],
          }),
        }}
      />
      {/* Hero Section */}
      <section className='relative overflow-hidden'>
        {/* Background Image with Overlay */}
        <div className='relative h-[60vh] min-h-[400px]'>
          <Image
            src={urlForImage(article.mainImage)?.url() ?? ''}
            alt={article.mainImage?.alt ?? 'Article image'}
            fill
            sizes='(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 100vw'
            className='object-cover'
            priority
            fetchPriority='high'
            {...(urlForImage(article.mainImage)
              ? {
                  placeholder: 'blur' as const,
                  blurDataURL: urlForImage(article.mainImage)!.width(20).blur(10).url(),
                }
              : {})}
          />
          <div className='absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/20' />
        </div>

        {/* Article Header Content */}
        <div className='absolute inset-0 flex items-end'>
          <div className='mx-auto w-full px-4 pb-12 sm:px-6 lg:px-8 md:max-w-2xl lg:max-w-4xl xl:max-w-5xl dxl:max-w-5xl hlg:max-w-5xl lxl:max-w-5xl xxl:max-w-5xl wide:max-w-6xl mxl:max-w-6xl 4k:max-w-7xl'>
            <div className='space-y-6'>
              {/* Title */}
              <h1
                // GROQ query dereferences corrections->, TypeScript sees it as reference only
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                className={`text-4xl font-bold text-white sm:text-5xl lg:text-6xl${(article?.corrections as any)?.type === 'retraction' ? 'line-through opacity-60' : ''}`}
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
                  {/* GROQ query dereferences author-> and reviewedBy->, TypeScript sees only references */}
                  {/* eslint-disable @typescript-eslint/no-explicit-any */}
                  {(article.author as any)?.slug?.current && (
                    <ClientSideRoute
                      route={resolveHref('author', (article.author as any)?.slug?.current) ?? ''}
                    >
                      <div className='flex items-center space-x-3 rounded-lg bg-slate-900/50 p-3 backdrop-blur-sm transition-colors hover:bg-slate-900/70'>
                        <Image
                          src={urlForImage((article.author as any)?.image)?.url() ?? ''}
                          alt={(article.author as any)?.image?.alt ?? 'Author image'}
                          width={48}
                          height={48}
                          className='rounded-full border-2 border-white/20 object-cover'
                        />
                        <div>
                          <p className='font-semibold text-white'>
                            {(article.author as any)?.name ?? 'Unknown Author'}
                          </p>
                          <p className='text-sm text-slate-300'>Author</p>
                        </div>
                      </div>
                    </ClientSideRoute>
                  )}

                  {(article.reviewedBy as any)?.slug?.current && (
                    <span className='text-sm text-slate-400'>
                      Reviewed by{' '}
                      <Link
                        href={`/author/${(article.reviewedBy as any)?.slug?.current}`}
                        className='font-medium text-slate-300 underline hover:text-white'
                      >
                        {(article.reviewedBy as any)?.name ?? 'Unknown'}
                      </Link>
                    </span>
                  )}
                  {/* eslint-enable @typescript-eslint/no-explicit-any */}
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
                  {/* Categories + Tags */}
                  {/* GROQ dereferences categories[]-> and tags, TypeScript sees limited types */}
                  {/* eslint-disable @typescript-eslint/no-explicit-any */}
                  <div className='flex flex-wrap justify-end gap-2'>
                    {(article.categories as any) &&
                      (article.categories as any).length > 0 &&
                      (article.categories as any).map(
                        (category: any) =>
                          (category as any)?.title && (
                            <Link
                              key={(category as any)?._id ?? Math.random()}
                              href={`/category/${formatTitleForURL((category as any).title)}`}
                              className='inline-flex items-center rounded-full bg-untele/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-untele'
                            >
                              {(category as any).title}
                            </Link>
                          )
                      )}
                    {((article as any)?.tags) &&
                      ((article as any)?.tags)?.length > 0 &&
                      ((article as any)?.tags)?.map((tag: string) => (
                        <Link
                          key={tag}
                          href={`/tag/${tagToSlug(tag)}`}
                          className='inline-flex items-center rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:border-white/70 hover:text-white'
                        >
                          #{tag}
                        </Link>
                      ))}
                  </div>
                  {/* eslint-enable @typescript-eslint/no-explicit-any */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* View ping — fires once per session, renders nothing */}
      {article.slug?.current && <ViewPing slug={article.slug.current} />}

      {/* Main wrapper — centers everything */}
      <div className='mx-auto w-full flex flex-auto justify-center mt-6'>
        {/* LEFT SIDEBAR — outside flex container */}
        <aside className='hidden w-72 shrink-0 xl:block xl:sticky xl:top-[120px]'>
          <div className='space-y-6'>
            <SidebarAd
              slot={AD_CONFIG.AD_SLOTS.ARTICLE_LEFT_SIDEBAR}
              className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
            />
            <RecentBreakingNews />
          </div>
        </aside>

        {/* Flex container — handles sizing and spacing */}
        <div className='flex gap-8 px-4 sm:px-6 lg:px-8'>
          {/* Article container — centered with responsive max-width */}
          <div className='mx-auto w-full py-12 md:max-w-2xl xxl:max-w-3xl wide:max-w-4xl mxl:max-w-5xl 4k:max-w-6xl'>
          <div className='w-full bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 rounded-lg p-4 sm:p-6 lg:p-8'>
            {/* Article content column */}
            <main className='w-full'>
            {/* Breadcrumb + Bookmark */}
            <div className='mb-6 flex items-start justify-between gap-4'>
              <nav
                aria-label='Breadcrumb'
                className='min-w-0 text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400'
              >
                <ol className='flex flex-wrap items-center gap-2'>
                  <li>
                    <Link href='/' className='transition-colors hover:text-untele'>
                      Home
                    </Link>
                  </li>
                  {/* GROQ dereferences categories[]-, TypeScript sees limited types */}
                  {/* eslint-disable @typescript-eslint/no-explicit-any */}
                  {(article.categories as any) && (article.categories as any).length > 0 && (
                    <>
                      <li aria-hidden='true' className='text-slate-400 dark:text-slate-600'>
                        /
                      </li>
                      <li>
                        {(article.categories as any)?.[0]?.title && (
                          <Link
                            href={`/category/${formatTitleForURL((article.categories as any)[0].title)}`}
                            className='transition-colors hover:text-untele'
                          >
                            {(article.categories as any)[0].title}
                          </Link>
                        )}
                      </li>
                    </>
                  )}
                  {/* eslint-enable @typescript-eslint/no-explicit-any */}
                  <li aria-hidden='true' className='text-slate-400 dark:text-slate-600'>
                    /
                  </li>
                  <li
                    className='max-w-xs truncate text-slate-900 dark:text-white'
                    aria-current='page'
                  >
                    {article.title}
                  </li>
                </ol>
              </nav>
              {/* GROQ dereferences author->, TypeScript sees only reference */}
              {/* eslint-disable @typescript-eslint/no-explicit-any */}
              <BookmarkButton
                slug={slug}
                title={article.title ?? 'Untitled Article'}
                description={
                  typeof article.description === 'string' ? article.description : undefined
                }
                imageUrl={urlForImage(article.mainImage)?.width(400).url() ?? undefined}
                authorName={(article.author as any)?.name ?? undefined}
                publishedAt={article.publishedAt}
                readingTime={getReadingTime(article.body)}
                variant='full'
              />
              {/* eslint-enable @typescript-eslint/no-explicit-any */}
            </div>

            {/* Social Share — full width */}
            <div className='mb-8'>
              <SocialShare
                url={`https://untelevised.media/articles/${article.slug?.current ?? slug}`}
                title={article.title ?? 'Untitled Article'}
              />
            </div>

            {/* Article Content */}
            <article className='prose prose-lg prose-slate dark:prose-invert max-w-none'>
              {/* Featured Image */}
              <div className='not-prose mb-0'>
                <div className='overflow-hidden rounded-xl border border-slate-200 shadow-lg dark:border-slate-700'>
                  {(() => {
                    const ref: string = article.mainImage?.asset?._ref ?? '';
                    const m = ref.match(/-(\d+)x(\d+)-/);
                    const imgW = m ? parseInt(m[1]) : 1200;
                    const imgH = m ? parseInt(m[2]) : 630;
                    return (
                      <Image
                        src={urlForImage(article.mainImage)?.url() ?? ''}
                        alt={article.mainImage?.alt ?? 'Article image'}
                        width={imgW}
                        height={imgH}
                        style={{ width: '100%', height: 'auto' }}
                        className='block'
                        priority
                      />
                    );
                  })()}
                </div>
              </div>

              {/* In-feed ad directly below the image */}
              <div className='not-prose mb-8'>
                <InFeedAd
                  slot={AD_CONFIG.AD_SLOTS.IN_FEED}
                  className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
                />
              </div>

              {/* Embedded Video */}
              {article.hasEmbeddedVideo && article.videoLink && (
                <div className='not-prose mb-8 overflow-hidden rounded-xl border border-slate-200 shadow-lg dark:border-slate-700'>
                  <YouTubeEmbed videoUrl={article.videoLink} title='Article video' />
                </div>
              )}

              {/* Image Gallery */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(article as any)?.imageGallery && <ImageGalleryCarousel gallery={(article as any).imageGallery} />}

              {/* Correction / Retraction Notice */}
              {/* GROQ dereferences corrections->, TypeScript sees only reference */}
              {/* eslint-disable @typescript-eslint/no-explicit-any */}
              {(article.corrections as any)?.detail && (
                <div className='not-prose'>
                  <CorrectionNotice correction={article.corrections as any} />
                </div>
              )}

              {/* Article Body */}
              <div className='rounded-xl border border-slate-200 bg-white/50 p-8 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/50'>
                {/* @portabletext/react expects optional children; our RichTextComponents have required children */}
                <PortableText value={article.body} components={RichTextComponents as any} />
              </div>

              {/* Sources & Methodology */}
              <div className='not-prose'>
                <SourcesPanel sources={article.sources} methodology={(article as any)?.methodology} />
              </div>
              {/* eslint-enable @typescript-eslint/no-explicit-any */}

              {/* Tags */}
              {/* TypeScript doesn't see tags property without as any cast */}
              {/* eslint-disable @typescript-eslint/no-explicit-any */}
              {((article as any)?.tags as any) && ((article as any)?.tags as any).length > 0 && (
                <div className='not-prose mt-8'>
                  <p className='mb-3 text-xs font-black uppercase tracking-widest text-muted-foreground'>
                    Filed Under
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {((article as any)?.tags as any).map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/tag/${tagToSlug(tag)}`}
                        className='border border-zinc-600 px-3 py-1 text-xs uppercase tracking-wide text-zinc-400 transition-colors hover:border-untele hover:text-white'
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {/* eslint-enable @typescript-eslint/no-explicit-any */}

              {/* FAQs */}
              {article.faqs && article.faqs.length > 0 && (
                <div className='not-prose mt-8 rounded-xl border border-slate-200 bg-white/50 p-6 dark:border-slate-700 dark:bg-slate-900/50'>
                  <h3 className='mb-4 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                    Frequently Asked Questions
                  </h3>
                  <dl className='space-y-4'>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {article.faqs?.map((faq: any, i: number) => (
                      <div
                        key={i}
                        className='border-b border-slate-200 pb-4 last:border-0 last:pb-0 dark:border-slate-700'
                      >
                        <dt className='mb-1 font-semibold text-slate-900 dark:text-white'>
                          {safeText(faq.question)}
                        </dt>
                        <dd className='text-sm text-slate-600 dark:text-slate-400'>
                          {safeText(faq.answer)}
                        </dd>
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
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {article.relatedArticles?.map((related: any) => (
                    <Link
                      key={related._id}
                      href={`/articles/${related.slug}`}
                      className='group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow transition-all hover:border-untele dark:border-slate-700 dark:bg-slate-800'
                    >
                      {related.mainImage && (
                        <div className='aspect-video overflow-hidden'>
                          <Image
                            src={urlForImage(related.mainImage)?.url() ?? ''}
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
                          {/* GROQ dereferences author->, TypeScript sees only reference */}
                          {/* eslint-disable @typescript-eslint/no-explicit-any */}
                          {(related.author as any)?.name && (
                            <span className='font-medium'>{(related.author as any)?.name}</span>
                          )}
                          {/* eslint-enable @typescript-eslint/no-explicit-any */}
                          {related.publishedAt && <time>{formatDate(related.publishedAt)}</time>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Newsletter Signup */}
            <div className='mt-12'>
              <NewsletterSignup list='news' source='article' />
            </div>

            {/* Comments Section */}
            {/* TypeScript doesn't recognize allowComments property */}
            {/* eslint-disable @typescript-eslint/no-explicit-any */}
            <div className='mt-12'>
              <CommentsSection
                articleId={article._id}
                articleUrl={`${process.env.NEXT_PUBLIC_PRODUCTION_URL}/articles/${article.slug?.current ?? slug}`}
                allowComments={(article as any)?.allowComments ?? true}
              />
            </div>
            {/* eslint-enable @typescript-eslint/no-explicit-any */}
            </main>

            {/* Mobile/Tablet: Sidebars below content */}
            <div className='mt-10 space-y-6 xl:hidden'>
              <RecentBreakingNews />
              <TrendingSection />
            </div>
          </div>
          </div>
        </div>
        {/* end flex container */}

        {/* RIGHT SIDEBAR — outside flex container */}
        <aside className='hidden w-72 shrink-0 xl:block xl:sticky xl:top-[120px]'>
          <div className='space-y-6'>
            <TrendingSection />
            <SidebarAd
              slot={AD_CONFIG.AD_SLOTS.ARTICLE_RIGHT_SIDEBAR_BOTTOM}
              className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
            />
          </div>
        </aside>
      </div>
      {/* end main wrapper */}
    </div>
  );
}

// React.cache deduplicates this fetch when called from both generateMetadata and the page component
const getArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  try {
    const { data: article } = await sanityFetch({
      query: queryArticleBySlug,
      params: { slug },
      tags: [`article:${slug}`],
    });
    return article as Article | null;
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
  const slugRoutes = slugs
    ? slugs.filter((item) => item?.slug?.current).map((item) => item.slug?.current ?? '')
    : [];
  return slugRoutes.map((slug) => ({
    slug,
  }));
}
