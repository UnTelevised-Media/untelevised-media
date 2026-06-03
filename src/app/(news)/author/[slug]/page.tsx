/* eslint-disable react/function-component-definition */
// src/app/(news)/author/[slug]/page.tsx
import { cache } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
import type { SanityBook, SanityBookFormat } from '@/lib/bookstore/types';
import BookCardActions from '@/components/bookstore/BookCardActions';
import TipAuthorRow from '@/components/bookstore/TipAuthorRow';

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

// Minimal book card matching the bookstore grid pattern
function AuthorBookCard({ book }: { book: SanityBook }) {
  const slug = book.slug.current;
  const firstFormat = book.formats?.[0] as SanityBookFormat | undefined;
  const price = firstFormat?.price;
  const compareAtPrice = firstFormat?.compareAtPrice;
  const isOutOfStock = book.status === 'out-of-stock';
  const cover = book.coverImage?.asset
    ? urlForImage(book.coverImage).width(400).height(560).url()
    : (book.coverImageUrl ?? null);

  return (
    <div className='group flex flex-col border border-hp-sand-border bg-white transition-colors hover:border-untele dark:border-hp-dark-border dark:bg-hp-dark-card'>
      <Link href={`/bookstore/book/${slug}`} className='block flex-1'>
        <div className='relative aspect-[5/7] overflow-hidden bg-hp-sand dark:bg-hp-dark-border'>
          {cover ? (
            <Image
              src={cover}
              alt={book.coverImage?.alt ?? book.title}
              fill
              className='object-cover transition-transform duration-300 group-hover:scale-105'
              sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
            />
          ) : (
            <div className='flex h-full items-center justify-center p-4'>
              <span className='text-center text-xs font-bold uppercase tracking-widest text-hp-muted'>
                {book.title}
              </span>
            </div>
          )}
          {isOutOfStock && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/60'>
              <span className='bg-untele px-2 py-1 text-xs font-black uppercase tracking-widest text-white'>
                Out of Stock
              </span>
            </div>
          )}
        </div>
        <div className='p-3 pb-1'>
          <h3 className='text-sm font-black leading-tight text-slate-900 group-hover:text-untele dark:text-hp-cream'>
            {book.title}
          </h3>
          {price != null && (
            <div className='mt-1'>
              {compareAtPrice != null && (
                <p className='text-[10px] text-hp-muted line-through'>${compareAtPrice.toFixed(2)}</p>
              )}
              <p className='text-xs font-bold text-untele'>${price.toFixed(2)}</p>
            </div>
          )}
          {book.genre && book.genre.length > 0 && (
            <p className='mt-1 text-[10px] uppercase tracking-wider text-hp-muted'>
              {book.genre.map((g) => g.title).join(' · ')}
            </p>
          )}
        </div>
      </Link>

      {!isOutOfStock && firstFormat && (
        <div className='px-3 pb-3'>
          <BookCardActions book={book} format={firstFormat} />
        </div>
      )}
    </div>
  );
}

export default async function Author({ params }: Props) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) notFound();

  const hasBooks = author.isLiteraryAuthor && author.books && author.books.length > 0;
  const hasTip = !!(author.tipStripeProductId && author.tipAmount);

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
        <div className='absolute inset-0'>
          <div className='bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23dc2626" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] absolute inset-0 opacity-40' />
        </div>

        <div className='relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col items-center gap-8 lg:flex-row lg:gap-12'>
            {/* Author Image */}
            <div className='relative flex-shrink-0'>
              <div className='absolute -inset-4 rounded-full bg-gradient-to-r from-untele/50 to-red-400/50 opacity-75 blur transition-opacity hover:opacity-100' />
              <div className='relative overflow-hidden rounded-full border-4 border-white/20 shadow-2xl'>
                <Image
                  src={
                    author.image ? urlForImage(author.image).url() : '/placeholder-avatar.png'
                  }
                  width={240}
                  height={240}
                  alt={author.name}
                  className='h-60 w-60 object-cover'
                  priority
                  {...(author.image && urlForImage(author.image)
                    ? {
                        placeholder: 'blur' as const,
                        blurDataURL: urlForImage(author.image)!.width(20).blur(10).url(),
                      }
                    : {})}
                />
              </div>
            </div>

            {/* Author Info */}
            <div className='flex-1 text-center lg:text-left'>
              <div className='mb-1 flex flex-wrap items-center justify-center gap-2 lg:justify-start'>
                {author.isLiteraryAuthor && (
                  <span className='bg-untele px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white'>
                    Literary Author
                  </span>
                )}
                {author.location && (
                  <span className='text-sm text-slate-500 dark:text-slate-400'>
                    📍 {author.location}
                  </span>
                )}
              </div>

              <h1 className='mb-2 text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl lg:text-6xl'>
                {author.name}
              </h1>

              {author.title && (
                <p className='mb-4 text-xl text-slate-700 dark:text-slate-300 sm:text-2xl'>
                  {author.title}
                </p>
              )}

              {/* Social Links */}
              <div className='mb-4'>
                <AuthorLinks author={author} />
              </div>

              {/* Stats */}
              <div className='mb-6 flex justify-center gap-8 lg:justify-start'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-untele'>
                    {author.relatedArticles?.length || 0}
                  </div>
                  <div className='text-sm text-slate-600 dark:text-slate-400'>Articles</div>
                </div>
                {hasBooks && (
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-untele'>
                      {author.books?.length ?? 0}
                    </div>
                    <div className='text-sm text-slate-600 dark:text-slate-400'>Books</div>
                  </div>
                )}
              </div>

              {/* Tip Widget */}
              {hasTip && (
                <TipAuthorRow
                  author={{
                    _id: author._id,
                    name: author.name,
                    slug: author.slug,
                    tipStripeProductId: author.tipStripeProductId as string,
                    tipAmount: author.tipAmount as number,
                  }}
                  bookId={author._id}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Credentials & Expertise */}
      {((author.credentials && author.credentials.length > 0) ||
        (author.expertise && author.expertise.length > 0) ||
        (author.sameAs && author.sameAs.length > 0)) && (
        <section className='border-b border-slate-200 bg-white/70 px-4 py-6 dark:border-slate-700 dark:bg-slate-900/40'>
          <div className='mx-auto max-w-6xl space-y-4 sm:px-6 lg:px-8'>
            {author.credentials && author.credentials.length > 0 && (
              <div>
                <p className='mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                  Credentials
                </p>
                <div className='flex flex-wrap gap-2'>
                  {author.credentials.map((c: string, i: number) => (
                    <span
                      key={i}
                      className='border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {author.expertise && author.expertise.length > 0 && (
              <div>
                <p className='mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                  Areas of Expertise
                </p>
                <div className='flex flex-wrap gap-2'>
                  {author.expertise.map((e: string, i: number) => (
                    <span
                      key={i}
                      className='border border-untele/30 bg-untele/10 px-2 py-0.5 text-xs font-semibold text-untele dark:border-untele/40 dark:bg-untele/20'
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {author.sameAs && author.sameAs.length > 0 && (
              <div>
                <p className='mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                  Verified Profiles
                </p>
                <div className='flex flex-wrap gap-2'>
                  {author.sameAs.map((url: string, i: number) => {
                    let label = url;
                    try {
                      label = new URL(url).hostname.replace('www.', '');
                    } catch {}
                    return (
                      <a
                        key={i}
                        href={url}
                        target='_blank'
                        rel='noopener noreferrer nofollow'
                        className='border border-slate-300 px-2 py-0.5 text-xs text-slate-600 transition-colors hover:border-untele hover:text-untele dark:border-slate-600 dark:text-slate-400'
                      >
                        ↗ {label}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

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

      {/* Books Section — literary authors only, shown above articles */}
      {hasBooks && (
        <section className='mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8'>
          <div className='mb-8'>
            <div className='bg-untele px-4 py-2'>
              <h2 className='text-sm font-black uppercase tracking-widest text-white'>
                Books by {author.name}
              </h2>
            </div>
          </div>

          <div className='grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {(author.books as SanityBook[]).map((book) => (
              <AuthorBookCard key={book._id} book={book} />
            ))}
          </div>

          <div className='mt-6 text-center'>
            <Link
              href='/bookstore'
              className='inline-block border border-untele px-6 py-2 text-xs font-black uppercase tracking-widest text-untele transition-colors hover:bg-untele hover:text-white'
            >
              Browse Bookstore
            </Link>
          </div>
        </section>
      )}

      {/* Articles Section */}
      {author.relatedArticles && author.relatedArticles.length > 0 && (
        <section className='mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8'>
          <div className='mb-8'>
            <div className='bg-untele px-4 py-2'>
              <h2 className='text-sm font-black uppercase tracking-widest text-white'>
                Articles by {author.name}
              </h2>
            </div>
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {author.relatedArticles.map((article: {
              _id: string;
              title: string;
              slug: { current: string };
              description?: string;
              publishedAt?: string;
              mainImage?: { asset?: { _ref?: string }; alt?: string; _type?: string };
              categories?: { _id: string; title: string; slug: { current: string } }[];
            }) => (
              <ClientSideRoute
                key={article._id}
                route={resolveHref('article', article.slug?.current) ?? ''}
              >
                <article className='group overflow-hidden border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:border-untele/50 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800'>
                  {/* Article Image */}
                  <div className='relative aspect-video overflow-hidden'>
                    <Image
                      src={urlForImage(article.mainImage)?.url() ?? '/placeholder-image.jpg'}
                      alt={article.mainImage?.alt ?? article.title ?? ''}
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
                        <span className='bg-untele/10 px-2 py-1 text-untele'>
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

const getAuthorBySlug = cache(async (slug: string): Promise<Author | null> => {
  try {
    const { data: author } = await sanityFetch({
      query: queryAuthorBySlug,
      params: { slug },
      tags: ['author'],
    });
    return author as Author | null;
  } catch (error) {
    console.error('Failed to fetch author:', error);
    return null;
  }
});

export async function generateStaticParams() {
  const queryAuthorStaticParams = groq`*[_type=='author'] { slug }`;
  const slugs: { slug: { current: string } }[] = await sanityClient.fetch(queryAuthorStaticParams);
  const slugRoutes = slugs ? slugs.filter((item) => item?.slug?.current).map((item) => item.slug.current) : [];
  return slugRoutes.map((slug) => ({
    slug,
  }));
}
