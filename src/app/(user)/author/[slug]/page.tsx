/* eslint-disable react/function-component-definition */
// src/app/(user)/author/[slug]/page.tsx
import { cache } from 'react';
import Image from 'next/image';
import { groq } from 'next-sanity';
import { PortableText } from '@portabletext/react';
import { RichTextComponents } from '@/components/providers/RichTextComponents';

import urlForImage from '@/u/urlForImage';

import AuthorLinks from '@/components/global/AuthorLinks';
import ClientSideRoute from '@/components/providers/ClientSideRoute';
import resolveHref from '@/util/resolveHref';
import formatDate from '@/util/formatDate';
import getArticleDate from '@/util/getArticleDate';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanityFetch } from '@/lib/sanity/lib/live';
import sanityClient from '@/lib/sanity/lib/client';
import { queryAuthorBySlug } from '@/lib/sanity/lib/queries';
import { buildAuthorMetadata } from '@/util/metadata';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: 'Author Not Found' };
  return buildAuthorMetadata(author, slug);
}

export default async function Author({ params }: Props) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) notFound();

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `https://www.untelevised.media/author/${slug}/#person`,
    name: author.name,
    url: `https://www.untelevised.media/author/${slug}/`,
    jobTitle: author.title ?? undefined,
    worksFor: {
      '@type': 'NewsMediaOrganization',
      '@id': 'https://www.untelevised.media/#organization',
      name: 'UnTelevised Media',
    },
    sameAs: author.sameAs ?? [],
    knowsAbout: author.expertise ?? [],
    hasCredential: author.credentials ?? [],
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 py-16 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'>
        {/* Background Pattern */}
        <div className='absolute inset-0'>
          <div className='bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23dc2626" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] absolute inset-0 opacity-40' />
        </div>

        <div className='relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col items-center gap-8 lg:flex-row lg:gap-12'>
            {/* Author Image */}
            <div className='relative'>
              <div className='absolute -inset-4 rounded-full bg-gradient-to-r from-untele/50 to-red-400/50 opacity-75 blur transition-opacity hover:opacity-100' />
              <div className='relative overflow-hidden rounded-full border-4 border-white/20 shadow-2xl'>
                <Image
                  src={
                    author.image
                      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        urlForImage(author.image as any).url()
                      : '/placeholder-avatar.png'
                  }
                  width={240}
                  height={240}
                  alt={author.name}
                  className='h-60 w-60 object-cover'
                  priority
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...(author.image && urlForImage(author.image as any)
                    ? {
                        placeholder: 'blur' as const,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        blurDataURL: urlForImage(author.image as any)!.width(20).blur(10).url(),
                      }
                    : {})}
                />
              </div>
            </div>

            {/* Author Info */}
            <div className='flex-1 text-center lg:text-left'>
              <h1 className='mb-4 text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl lg:text-6xl'>
                {author.name}
              </h1>

              {author.title && (
                <p className='mb-6 text-xl text-slate-700 dark:text-slate-300 sm:text-2xl'>
                  {author.title}
                </p>
              )}

              {/* Social Links */}
              <div className='mb-6'>
                <AuthorLinks author={author} />
              </div>

              {/* Stats */}
              <div className='flex justify-center gap-8 lg:justify-start'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-untele'>
                    {author.relatedArticles?.length || 0}
                  </div>
                  <div className='text-sm text-slate-600 dark:text-slate-400'>Articles</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Author Bio */}
      {author.bio && (
        <section className='mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8'>
          <div className='rounded-xl border border-slate-200 bg-white/50 p-8 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/50'>
            <h2 className='mb-6 text-2xl font-bold text-slate-900 dark:text-white'>
              About {author.name}
            </h2>
            <div className='prose prose-lg prose-slate dark:prose-invert max-w-none'>
              <PortableText value={author.bio} components={RichTextComponents} />
            </div>
          </div>
        </section>
      )}

      {/* Articles Section */}
      {author.relatedArticles && author.relatedArticles.length > 0 && (
        <section className='mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8'>
          <div className='mb-8'>
            <h2 className='text-3xl font-bold text-slate-900 dark:text-white'>
              Latest Articles by {author.name}
            </h2>
            <div className='mt-2 h-1 w-20 bg-gradient-to-r from-untele to-red-400' />
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {author.relatedArticles.map((article) => (
              <ClientSideRoute
                key={article._id}
                route={resolveHref('article', article.slug?.current) ?? ''}
              >
                <article className='group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:border-untele/50 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800'>
                  {/* Article Image */}
                  <div className='relative aspect-video overflow-hidden'>
                    <Image
                      src={
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        urlForImage(article.mainImage as any)?.url() ?? '/placeholder-image.jpg'
                      }
                      alt={article.mainImage?.alt ?? article.title}
                      fill
                      className='object-cover transition-transform duration-300 group-hover:scale-105'
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent' />
                  </div>

                  {/* Article Content */}
                  <div className='p-6'>
                    <h3 className='mb-2 line-clamp-2 text-lg font-semibold text-slate-900 dark:text-white'>
                      {article.title}
                    </h3>

                    {article.description && (
                      <p className='mb-4 line-clamp-3 text-sm text-slate-600 dark:text-slate-400'>
                        {article.description}
                      </p>
                    )}

                    <div className='flex items-center justify-between text-xs text-slate-500 dark:text-slate-400'>
                      <time>{formatDate(getArticleDate(article))}</time>
                      {article.categories?.[0] && (
                        <span className='rounded-full bg-untele/10 px-2 py-1 text-untele'>
                          {article.categories[0].title}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </ClientSideRoute>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// React.cache deduplicates this fetch across generateMetadata and the page component
const getAuthorBySlug = cache(async (slug: string): Promise<Author | null> => {
  try {
    const { data: author } = await sanityFetch({
      query: queryAuthorBySlug,
      params: { slug },
      tags: ['author'],
    });
    return author;
  } catch (error) {
    console.error('Failed to fetch author:', error);
    return null;
  }
});

// Generate the static params for the author list
export async function generateStaticParams() {
  const queryAuthorStaticParams = groq`*[_type=='author'] { slug }`;
  // Use sanityClient directly to avoid draftMode() call during static generation
  const slugs: { slug: { current: string } }[] = await sanityClient.fetch(queryAuthorStaticParams);
  const slugRoutes = slugs ? slugs.map((item) => item.slug.current) : [];
  return slugRoutes.map((slug) => ({
    slug,
  }));
}
