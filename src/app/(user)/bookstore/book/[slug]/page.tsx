// src/app/(user)/bookstore/book/[slug]/page.tsx
// Book detail / buy page — cover, description, format selector, buy CTA, author bio.

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PortableText } from '@portabletext/react';
import sanityFetch from '@/lib/sanity/lib/fetch';
import sanityClient from '@/lib/sanity/lib/client';
import { queryBookBySlug, queryAllBooks } from '@/lib/sanity/lib/queries';
import type { SanityBook } from '@/lib/bookstore/types';
import urlForImage from '@/util/urlForImage';
import AddToCartButton from '@/components/bookstore/AddToCartButton';
import BuyNowButton from '@/components/bookstore/BuyNowButton';
import TipAuthorRow from '@/components/bookstore/TipAuthorRow';

// JSON-LD structured data
function buildProductJsonLd(book: SanityBook): string {
  const lowestPrice = book.formats?.reduce(
    (min, f) => (f.price < min ? f.price : min),
    Infinity,
  );
  const cover = book.coverImage?.asset
    ? urlForImage(book.coverImage).width(600).url()
    : book.coverImageUrl;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: book.author?.name
      ? { '@type': 'Person', name: book.author.name }
      : undefined,
    isbn: book.isbn,
    numberOfPages: book.pages,
    inLanguage: book.language ?? 'en',
    datePublished: book.publishedAt,
    image: cover,
    offers: book.formats?.map((f) => ({
      '@type': 'Offer',
      price: f.price.toFixed(2),
      priceCurrency: 'USD',
      availability:
        f.inventory?.trackInventory && f.inventory.quantity === 0
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      url: `${process.env.NEXT_PUBLIC_PRODUCTION_URL ?? ''}/bookstore/book/${book.slug.current}`,
    })),
  });
}

export async function generateStaticParams() {
  // Use the raw client (no draftMode) — safe to call outside request scope
  const books = await sanityClient.fetch<SanityBook[]>(queryAllBooks);
  return (books ?? []).map((b) => ({ slug: b.slug.current }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await sanityFetch<SanityBook | null>({
    query: queryBookBySlug,
    params: { slug },
    tags: ['book'],
  });
  if (!book) return { title: 'Book Not Found' };

  const cover = book.coverImage?.asset
    ? urlForImage(book.coverImage).width(1200).height(630).url()
    : book.coverImageUrl;

  return {
    title: `${book.title} — UnTelevised Media Bookstore`,
    description: `By ${book.author?.name ?? 'Unknown'}. Available now in the UnTelevised Media Bookstore.`,
    openGraph: {
      title: book.title,
      images: cover ? [{ url: cover }] : [],
      type: 'website',
    },
  };
}

// Book details accordion row
function DetailRow({ label, value }: { label: string; value: string | number | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <div className='flex gap-3 border-b border-hp-sand-border py-2 dark:border-hp-dark-border'>
      <span className='w-24 shrink-0 text-[10px] font-black uppercase tracking-widest text-hp-muted'>
        {label}
      </span>
      <span className='text-sm text-slate-700 dark:text-hp-cream'>{value}</span>
    </div>
  );
}

// Revenue sharing breakdown section
function RevenueTermsCard({
  terms,
}: {
  terms: NonNullable<import('@/lib/bookstore/types').SanityBook['revenueTerms']>;
}) {
  const { authorPercentage, publisherPercentage, platformPercentage, description } = terms;
  const hasData = authorPercentage != null || publisherPercentage != null || platformPercentage != null;
  if (!hasData) return null;

  const slices = [
    { label: 'Author', pct: authorPercentage ?? 0, color: 'bg-untele' },
    { label: 'Publisher', pct: publisherPercentage ?? 0, color: 'bg-amber-500' },
    { label: 'Platform', pct: platformPercentage ?? 0, color: 'bg-slate-400 dark:bg-slate-600' },
  ].filter((s) => s.pct > 0);

  return (
    <details className='group mb-6 border border-hp-sand-border dark:border-hp-dark-border'>
      <summary className='flex cursor-pointer items-center justify-between p-4 hover:bg-hp-sand dark:hover:bg-hp-dark-card'>
        <div className='flex items-center gap-2'>
          <div className='bg-untele px-2 py-0.5'>
            <span className='text-[10px] font-black uppercase tracking-widest text-white'>
              How Revenue is Shared
            </span>
          </div>
        </div>
        <span className='text-xs font-bold text-hp-muted transition-transform group-open:rotate-180'>
          ▾
        </span>
      </summary>
      <div className='border-t border-hp-sand-border p-4 dark:border-hp-dark-border'>
        {/* Bar chart */}
        <div className='mb-3 flex h-4 overflow-hidden'>
          {slices.map((s) => (
            <div
              key={s.label}
              className={`${s.color} transition-all`}
              style={{ width: `${s.pct}%` }}
              title={`${s.label}: ${s.pct}%`}
            />
          ))}
        </div>
        {/* Labels */}
        <div className='mb-3 flex flex-wrap gap-4'>
          {slices.map((s) => (
            <div key={s.label} className='flex items-center gap-1.5'>
              <span className={`h-2.5 w-2.5 shrink-0 ${s.color}`} />
              <span className='text-[11px] font-bold text-slate-700 dark:text-hp-cream'>
                {s.pct}% to {s.label}
              </span>
            </div>
          ))}
        </div>
        {description && (
          <p className='text-xs text-hp-muted'>{description}</p>
        )}
      </div>
    </details>
  );
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await sanityFetch<SanityBook | null>({
    query: queryBookBySlug,
    params: { slug },
    tags: ['book'],
  });

  if (!book || book.status === 'discontinued') notFound();

  const cover = book.coverImage?.asset
    ? urlForImage(book.coverImage).width(600).height(840).url()
    : (book.coverImageUrl ?? null);

  const authorCover = book.author?.image?.asset
    ? urlForImage(book.author.image).width(80).height(80).url()
    : null;

  const isOutOfStock =
    book.status === 'out-of-stock' ||
    book.formats?.every(
      (f) => f.inventory?.trackInventory && f.inventory.quantity === 0 && !f.inventory.allowBackorder,
    );

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: buildProductJsonLd(book) }}
      />
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        {/* Breadcrumb */}
        <nav className='mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-hp-muted'>
          <Link href='/bookstore' className='hover:text-untele'>
            Bookstore
          </Link>
          <span>/</span>
          <span className='text-slate-600 dark:text-hp-cream'>{book.title}</span>
        </nav>

        <div className='flex flex-col gap-8 lg:flex-row lg:gap-12'>
          {/* Cover image */}
          <div className='shrink-0 lg:w-72 xl:w-80'>
            <div className='relative aspect-[5/7] overflow-hidden bg-hp-sand shadow-xl dark:bg-hp-dark-border'>
              {cover ? (
                <Image
                  src={cover}
                  alt={book.coverImage?.alt ?? book.title}
                  fill
                  priority
                  className='object-cover'
                  sizes='(max-width: 1024px) 90vw, 320px'
                />
              ) : (
                <div className='flex h-full items-center justify-center p-4'>
                  <span className='text-center text-sm font-black uppercase tracking-widest text-slate-400'>
                    {book.title}
                  </span>
                </div>
              )}
            </div>
            {book.samplePdfUrl && (
              <a
                href={book.samplePdfUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='mt-3 flex items-center justify-center border border-hp-sand-border bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-untele hover:text-untele dark:border-hp-dark-border dark:bg-hp-dark-card dark:text-hp-cream'
              >
                Free Sample ↓
              </a>
            )}
          </div>

          {/* Book info */}
          <div className='flex-1'>
            <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-hp-muted'>
              {book.author?.name ?? 'Unknown Author'}
            </p>
            <h1 className='mb-2 text-3xl font-black uppercase leading-none tracking-tight text-slate-900 dark:text-hp-cream lg:text-5xl'>
              {book.title}
            </h1>

            {/* Genre tags */}
            {book.genre && book.genre.length > 0 && (
              <div className='mb-4 flex flex-wrap gap-2'>
                {book.genre.map((g) => (
                  <span
                    key={g._id}
                    className='border border-hp-sand-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-hp-muted dark:border-hp-dark-border'
                  >
                    {g.title}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {book.description && (
              <div className='prose prose-sm mb-6 max-w-none text-slate-700 dark:prose-invert dark:text-hp-cream'>
                <PortableText value={book.description as Parameters<typeof PortableText>[0]['value']} />
              </div>
            )}

            {/* Format selector + buy CTAs */}
            <div className='mb-6'>
              <div className='mb-3 flex items-center gap-3'>
                <div className='bg-untele px-2 py-0.5'>
                  <span className='text-[10px] font-black uppercase tracking-widest text-white'>
                    Buy
                  </span>
                </div>
              </div>

              {isOutOfStock ? (
                <div className='border border-hp-sand-border bg-hp-sand px-4 py-3 dark:border-hp-dark-border dark:bg-hp-dark-card'>
                  <p className='text-xs font-bold uppercase tracking-widest text-slate-500'>
                    Currently Out of Stock
                  </p>
                </div>
              ) : (
                <div className='flex flex-col gap-3'>
                  {book.formats?.map((format) => {
                    const outOfStock =
                      format.inventory?.trackInventory &&
                      format.inventory.quantity === 0 &&
                      !format.inventory.allowBackorder;
                    const lowStock =
                      format.inventory?.trackInventory &&
                      format.inventory.quantity > 0 &&
                      format.inventory.quantity <= (format.inventory.lowStockThreshold ?? 5);

                    return (
                      <div
                        key={format._key}
                        className='flex flex-col gap-2 border border-hp-sand-border bg-white p-4 dark:border-hp-dark-border dark:bg-hp-dark-card sm:flex-row sm:items-center sm:justify-between'
                      >
                        <div>
                          <p className='text-sm font-black uppercase tracking-wide text-slate-900 dark:text-hp-cream'>
                            {format.formatType === 'physical' && 'Physical Book'}
                            {format.formatType === 'digital' && 'Digital Edition'}
                            {format.formatType === 'bundle' && 'Physical + Digital Bundle'}
                          </p>
                          {format.formatType === 'digital' && format.digitalAsset && (
                            <p className='text-[10px] text-slate-400'>
                              {format.digitalAsset.fileFormat}
                              {format.digitalAsset.fileSize ? ` · ${format.digitalAsset.fileSize}` : ''}
                            </p>
                          )}
                          {format.formatType !== 'digital' && format.dimensions && (
                            <p className='text-[10px] text-slate-400'>{format.dimensions}</p>
                          )}
                          {lowStock && (
                            <p className='text-[10px] font-bold text-amber-500'>
                              Only {format.inventory?.quantity} left
                            </p>
                          )}
                          {outOfStock && (
                            <p className='text-[10px] font-bold text-slate-400'>Out of stock</p>
                          )}
                        </div>
                        <div className='flex flex-wrap items-center gap-3'>
                          <div className='text-right'>
                            {format.compareAtPrice != null && (
                              <p className='text-xs text-slate-400 line-through'>
                                ${format.compareAtPrice.toFixed(2)}
                              </p>
                            )}
                            <p className='text-lg font-black text-untele'>
                              ${format.price.toFixed(2)}
                            </p>
                          </div>
                          {!outOfStock && (
                            <div className='flex flex-wrap gap-2'>
                              <AddToCartButton book={book} format={format} />
                              {format.stripePriceId && (
                                <BuyNowButton book={book} format={format} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tip the author */}
              {book.author?.tipStripeProductId && (
                <TipAuthorRow
                  author={
                    book.author as {
                      _id: string;
                      name: string;
                      slug?: { current: string };
                      tipStripeProductId: string;
                      tipAmount: number;
                    }
                  }
                  bookId={book._id}
                />
              )}
            </div>

            {/* Book details */}
            <div className='mb-6'>
              <div className='mb-2 flex items-center gap-3'>
                <div className='bg-untele px-2 py-0.5'>
                  <span className='text-[10px] font-black uppercase tracking-widest text-white'>
                    Details
                  </span>
                </div>
              </div>
              <DetailRow label='ISBN' value={book.isbn} />
              <DetailRow label='Pages' value={book.pages} />
              <DetailRow label='Language' value={book.language?.toUpperCase()} />
              <DetailRow label='Published' value={book.publishedAt} />
            </div>

            {/* Revenue sharing */}
            {book.revenueTerms && (
              <RevenueTermsCard terms={book.revenueTerms} />
            )}

            {/* Author bio */}
            {book.author && (
              <div className='border border-hp-sand-border bg-hp-sand p-4 dark:border-hp-dark-border dark:bg-hp-dark-card'>
                <div className='mb-2 flex items-center gap-3'>
                  {authorCover && (
                    <div className='relative h-10 w-10 shrink-0 overflow-hidden'>
                      <Image src={authorCover} alt={book.author.name ?? ''} fill className='object-cover' sizes='40px' />
                    </div>
                  )}
                  <div>
                    <p className='text-[10px] font-bold uppercase tracking-widest text-hp-muted'>
                      About the Author
                    </p>
                    <p className='text-sm font-black text-slate-900 dark:text-hp-cream'>
                      {book.author.name}
                    </p>
                  </div>
                </div>
                {book.author.bio && (
                  <div className='prose prose-sm max-w-none text-slate-600 dark:prose-invert dark:text-hp-muted'>
                    <PortableText value={book.author.bio as Parameters<typeof PortableText>[0]['value']} />
                  </div>
                )}
                {book.author.slug && (
                  <Link
                    href={`/author/${book.author.slug.current}`}
                    className='mt-2 inline-block text-[10px] font-black uppercase tracking-widest text-untele hover:underline'
                  >
                    View Author Profile →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
