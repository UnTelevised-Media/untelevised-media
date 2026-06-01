/* eslint-disable react/function-component-definition */
import { Fragment } from 'react';
import { groq } from 'next-sanity';
import Image from 'next/image';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { queryArticleByCategory, queryCategoryBySlug, queryMostReadByCategory } from '@/lib/sanity/lib/queries';
import { sanityFetch } from '@/lib/sanity/lib/live';
import sanityClient from '@/lib/sanity/lib/client';
import { buildCategoryMetadata } from '@/util/metadata';
import urlForImage from '@/util/urlForImage';
import formatDate from '@/util/formatDate';
import getArticleDate from '@/util/getArticleDate';
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup';
import { InFeedAd, RectangleAd, AD_CONFIG } from '@/components/ads';

type Props = { params: Promise<{ slug: string }> };

interface CategoryArticle {
  _id: string;
  _type: string;
  _createdAt: string;
  title: string;
  slug: { current: string };
  description?: string;
  publishedAt?: string;
  eventDate?: string;
  location?: string;
  mainImage?: { asset: { _ref: string }; alt?: string };
  author?: { name: string; slug: { current: string } } | null;
  categories?: { _id: string; title: string; order?: string }[];
  readingTimeMinutes?: number;
}

interface MostReadArticle {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt?: string;
  viewCount?: number;
  author?: { name: string } | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: category } = await sanityFetch({ query: queryCategoryBySlug, params: { slug }, tags: ['category'] });
  if (!category) return { title: 'Category Not Found' };
  return buildCategoryMetadata(category, slug);
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [{ data: category }, { data: mostRead }, articles] = await Promise.all([
    sanityFetch({ query: queryCategoryBySlug, params: { slug }, tags: ['category'] }),
    sanityFetch({ query: queryMostReadByCategory, params: { categorySlug: slug }, tags: ['article'] }),
    getArticlesByCategory(slug),
  ]);

  if (!category) notFound();

  const accentColor = category.color?.hex ?? '#D70606';
  const heroImageUrl = category.image
    ? urlForImage(category.image)?.width(1400).height(500).url()
    : null;

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.title,
    description: category.description ?? undefined,
    url: `https://www.untelevised.media/category/${slug}/`,
    publisher: {
      '@type': 'NewsMediaOrganization',
      '@id': 'https://www.untelevised.media/#organization',
      name: 'UnTelevised Media',
    },
  };

  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />

      {/* CATEGORY HERO BANNER */}
      <section
        className='relative overflow-hidden border-b-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-black'
        style={{ borderBottomColor: accentColor }}
      >
        {heroImageUrl && (
          <Image
            src={heroImageUrl}
            alt={category.title}
            fill
            priority
            className='object-cover opacity-15 dark:opacity-10'
            sizes='100vw'
          />
        )}
        <div
          className='absolute inset-0'
          style={{ background: `linear-gradient(135deg, ${accentColor}25 0%, transparent 65%)` }}
        />
        <div className='relative mx-auto max-w-[1400px] px-4 py-16 md:py-20'>
          <div
            className='mb-4 inline-block px-3 py-1'
            style={{ backgroundColor: accentColor }}
          >
            <span className='text-xs font-black uppercase tracking-widest text-white'>Coverage</span>
          </div>
          <h1
            className='mb-4 border-l-4 pl-4 text-4xl font-black uppercase tracking-widest text-slate-900 dark:text-white md:text-6xl'
            style={{ borderLeftColor: accentColor }}
          >
            {category.title}
          </h1>
          {category.description && (
            <p className='max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400'>
              {category.description}
            </p>
          )}
          <p
            className='mt-5 text-sm font-bold uppercase tracking-widest'
            style={{ color: accentColor }}
          >
            {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className='mx-auto max-w-[1400px] px-4 py-12'>
        <div className='grid grid-cols-1 gap-12 lg:grid-cols-4'>

          {/* ARTICLE GRID — 3/4 width */}
          <div className='lg:col-span-3'>
            <div className='mb-8 flex items-center space-x-4'>
              <div className='px-4 py-2' style={{ backgroundColor: accentColor }}>
                <h2 className='text-lg font-black uppercase tracking-widest text-white'>
                  Latest Coverage
                </h2>
              </div>
              <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
            </div>

            {articles.length === 0 ? (
              <p className='text-slate-500 dark:text-slate-400'>
                No articles found in this category yet.
              </p>
            ) : (
              <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
                {articles.map((article, index) => (
                  <Fragment key={article._id}>
                    <Link
                      href={`/articles/${article.slug?.current}`}
                      className='group flex h-full flex-col border border-slate-300 bg-white transition-all hover:border-untele dark:border-slate-700 dark:bg-black'
                    >
                      <div className='aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900'>
                        {article.mainImage && (
                          <Image
                            src={urlForImage(article.mainImage)?.url() ?? ''}
                            alt={article.mainImage.alt ?? article.title}
                            width={800}
                            height={450}
                            sizes='(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw'
                            className='h-full w-full object-cover transition-transform group-hover:scale-105'
                            {...(urlForImage(article.mainImage)
                              ? {
                                  placeholder: 'blur' as const,
                                  blurDataURL: urlForImage(article.mainImage)!.width(20).blur(10).url(),
                                }
                              : {})}
                          />
                        )}
                      </div>
                      <div className='flex flex-1 flex-col p-4'>
                        <span
                          className='mb-2 inline-block self-start px-2 py-1 text-xs font-black uppercase tracking-widest text-white'
                          style={{ backgroundColor: accentColor }}
                        >
                          {category.title}
                        </span>
                        <h3 className='mb-2 line-clamp-2 font-bold text-slate-800 group-hover:text-untele dark:text-slate-200'>
                          {article.title}
                        </h3>
                        {article.description && (
                          <p className='mb-3 line-clamp-2 flex-1 text-xs text-slate-600 dark:text-slate-400'>
                            {article.description}
                          </p>
                        )}
                        {article.location && (
                          <p className='mb-3 text-xs font-medium text-slate-500 dark:text-slate-400'>
                            📍 {article.location}
                          </p>
                        )}
                        <div className='mt-auto flex items-center justify-between text-xs text-slate-600 dark:text-slate-500'>
                          <span className='font-bold uppercase'>{article.author?.name}</span>
                          <div className='flex items-center gap-1'>
                            <span>{formatDate(getArticleDate(article))}</span>
                            {article.readingTimeMinutes && (
                              <span>· {article.readingTimeMinutes} min read</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>

                    {(index + 1) % 9 === 0 && index < articles.length - 1 && (
                      <div className='md:col-span-2 xl:col-span-3'>
                        <InFeedAd
                          slot={AD_CONFIG.AD_SLOTS.CATEGORY_IN_FEED}
                          className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
                        />
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR — 1/4 width */}
          <div className='space-y-8 lg:pt-[68px]'>

            {/* Most Read in this Category */}
            {mostRead && mostRead.length > 0 && (
              <div>
                <div
                  className='flex items-center gap-2 px-4 py-2'
                  style={{ backgroundColor: accentColor }}
                >
                  <TrendingUp className='h-4 w-4 text-white' aria-hidden='true' />
                  <h3 className='text-xs font-black uppercase tracking-widest text-white'>
                    Most Read
                  </h3>
                </div>
                <ol className='divide-y divide-slate-200 border border-t-0 border-slate-200 dark:divide-slate-800 dark:border-slate-800'>
                  {(mostRead as MostReadArticle[]).map((article, index) => (
                    <li key={article._id}>
                      <Link
                        href={`/articles/${article.slug?.current}`}
                        className='group flex items-start gap-3 p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900'
                      >
                        <span className='w-7 shrink-0 text-2xl font-black leading-none tabular-nums text-slate-200 dark:text-slate-700'>
                          {index + 1}
                        </span>
                        <div className='min-w-0 flex-1'>
                          <p className='line-clamp-3 text-sm font-black uppercase leading-tight tracking-wide text-slate-800 transition-colors group-hover:text-untele dark:text-slate-200'>
                            {article.title}
                          </p>
                          <div className='mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400'>
                            {article.author?.name && <span>{article.author.name}</span>}
                            {article.viewCount && article.viewCount > 0 && (
                              <>
                                {article.author?.name && <span aria-hidden='true'>·</span>}
                                <span style={{ color: accentColor }}>
                                  {article.viewCount.toLocaleString()} views
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Sidebar ad — same setup as article page rectangle */}
            <div className='flex justify-center'>
              <RectangleAd
                slot={AD_CONFIG.AD_SLOTS.ARTICLE_RECTANGLE}
                className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50'
              />
            </div>

            {/* Newsletter */}
            <div className='border border-slate-200 p-6 dark:border-slate-800'>
              <NewsletterSignup list='news' source='category' fieldsLayout='column' />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

async function getArticlesByCategory(slug: string): Promise<CategoryArticle[]> {
  try {
    const { data: articles } = await sanityFetch({
      query: queryArticleByCategory,
      params: { slug },
      tags: ['article'],
    });
    return (articles as CategoryArticle[]) ?? [];
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }
}

export async function generateStaticParams() {
  const queryCategoryStaticParams = groq`*[_type=='category'] { slug }`;
  const slugs: Category[] = await sanityClient.fetch(queryCategoryStaticParams);
  const slugRoutes = slugs ? slugs.filter((item) => item?.slug?.current).map((item) => item.slug.current) : [];
  return slugRoutes.map((slug) => ({ slug }));
}
