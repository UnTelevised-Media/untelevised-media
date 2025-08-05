/* eslint-disable react/function-component-definition */
// src/app/(user)/articles/[slug]/page.tsx
import Image from 'next/image';
import { groq } from 'next-sanity';
import { PortableText } from '@portabletext/react';
import { RichTextComponents } from '@/components/providers/RichTextComponents';
import SocialShare from '@/components/global/SocialShare';

import urlForImage from '@/u/urlForImage';
import ClientSideRoute from '@/components/providers/ClientSideRoute';
import formatDate from '@/util/formatDate';
import resolveHref from '@/util/resolveHref';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryArticleBySlug } from '@/lib/sanity/lib/queries';
import sanityClient from '@/lib/sanity/lib/client';

// import Comments from '@/c/post/Comments';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function Article({ params }: Props) {
  const { slug } = await params;
  const article: Article = (await getArticleBySlug(slug)) as Article;

  if (!article) {
    return (
      <div className='mx-auto max-w-4xl p-8 text-center'>
        <h1 className='text-3xl font-bold text-slate-900 dark:text-slate-100'>
          Article Not Found
        </h1>
        <p className='mt-4 text-slate-600 dark:text-slate-400'>
          The requested article could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      {/* Hero Section */}
      <section className='relative overflow-hidden'>
        {/* Background Image with Overlay */}
        <div className='relative h-[60vh] min-h-[400px]'>
          <Image
            src={urlForImage(article.mainImage as any)?.url() ?? ''}
            alt={article.mainImage?.alt ?? 'Article image'}
            fill
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/20' />
        </div>

        {/* Article Header Content */}
        <div className='absolute inset-0 flex items-end'>
          <div className='mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6 lg:px-8'>
            <div className='space-y-6'>
              {/* Categories */}
              {article.categories && article.categories.length > 0 && (
                <div className='flex flex-wrap gap-2'>
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

              {/* Title */}
              <h1 className='text-4xl font-bold text-white sm:text-5xl lg:text-6xl'>
                {article.title}
              </h1>

              {/* Description */}
              {article.description && (
                <p className='max-w-3xl text-lg text-slate-200 sm:text-xl'>
                  {article.description}
                </p>
              )}

              {/* Meta Information */}
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center space-x-4'>
                  {/* Author */}
                  <ClientSideRoute
                    route={resolveHref('author', article.author.slug?.current) ?? ''}
                  >
                    <div className='flex items-center space-x-3 rounded-lg bg-slate-900/50 p-3 backdrop-blur-sm transition-colors hover:bg-slate-900/70'>
                      <Image
                        src={urlForImage(article.author.image as any)?.url() ?? ''}
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
                </div>

                <div className='flex items-center space-x-4 text-slate-300'>
                  {article.location && (
                    <span className='flex items-center text-sm'>📍 {article.location}</span>
                  )}
                  <time className='text-sm'>
                    {formatDate(article.eventDate ?? article._createdAt)}
                  </time>
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

        {/* Article Content */}
        <article className='prose prose-lg prose-slate dark:prose-invert max-w-none'>
          {/* Featured Image (if different from hero) */}
          <div className='not-prose mb-8'>
            <div className='overflow-hidden rounded-xl border border-slate-200 shadow-lg dark:border-slate-700'>
              <Image
                src={urlForImage(article.mainImage as any)?.url() ?? ''}
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

          {/* Article Body */}
          <div className='rounded-xl border border-slate-200 bg-white/50 p-8 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/50'>
            <PortableText value={article.body} components={RichTextComponents} />
          </div>
        </article>

        {/* Comments Section Placeholder */}
        <div className='mt-12'>{/* <Comments article={article}/> */}</div>
      </main>
    </div>
  );
}

// Call the Sanity Fetch Function for the Article by Slug
async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    // Fetch article data from Sanity
    const article = await sanityFetch<Article>({
      query: queryArticleBySlug,
      params: { slug },
      tags: ['article'],
    });
    return article;
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
}

// Generate the static params for the article list
export async function generateStaticParams() {
  const query = groq`*[_type=='article'] { slug }`;
  const slugs: Article[] = await sanityClient.fetch(query);
  const slugRoutes = slugs ? slugs.map((slug) => slug.slug.current) : [];
  return slugRoutes.map((slug) => ({
    slug,
  }));
}
