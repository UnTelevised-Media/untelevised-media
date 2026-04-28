// src/app/(user)/shop/book/[slug]/page.tsx
// Book detail / buy page — cover, description, format selector, buy CTA, author bio.

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PortableText } from '@portabletext/react';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryBookBySlug, queryAllBooks } from '@/lib/sanity/lib/queries';
import type { SanityBook } from '@/lib/shop/types';
import urlForImage from '@/util/urlForImage';
import AddToCartButton from '@/components/shop/AddToCartButton';

// JSON-LD structured data
function buildProductJsonLd(book: SanityBook): string {
  const lowestPrice = book.formats?.reduce(
    (min, f) => (f.price < min ? f.price : min),
    Infinity,
  );
  const cover = book.coverImage?.asset
    ? urlForImage(book.coverImage).width(600).url()
    : undefined;

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
      url: `${process.env.NEXT_PUBLIC_PRODUCTION_URL ?? ''}/shop/book/${book.slug.current}`,
    })),
  });
}

export async function generateStaticParams() {
  const books = await sanityFetch<SanityBook[]>({ query: queryAllBooks, tags: ['book'] });
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
    : undefined;

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
    <div className='flex gap-3 border-b border-slate-100 py-2 dark:border-slate-800'>
      <span className='w-24 shrink-0 text-[10px] font-black uppercase tracking-widest text-slate-400'>
        {label}
      </span>
      <span className='text-sm text-slate-700 dark:text-slate-300'>{value}</span>
    </div>
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
    : null;

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
        <nav className='mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
          <Link href='/shop' className='hover:text-untele'>
            Bookstore
          </Link>
          <span>/</span>
          <span className='text-slate-600 dark:text-slate-300'>{book.title}</span>
        </nav>

        <div className='flex flex-col gap-8 lg:flex-row lg:gap-12'>
          {/* Cover image */}
          <div className='shrink-0 lg:w-72 xl:w-80'>
            <div className='relative aspect-[5/7] overflow-hidden bg-slate-100 shadow-xl dark:bg-slate-800'>
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
                className='mt-3 flex items-center justify-center border border-slate-300 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-untele hover:text-untele dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              >
                Free Sample ↓
              </a>
            )}
          </div>

          {/* Book info */}
          <div className='flex-1'>
            <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
              {book.author?.name ?? 'Unknown Author'}
            </p>
            <h1 className='mb-2 text-3xl font-black uppercase leading-none tracking-tight text-slate-900 dark:text-white lg:text-5xl'>
              {book.title}
            </h1>

            {/* Genre tags */}
            {book.genre && book.genre.length > 0 && (
              <div className='mb-4 flex flex-wrap gap-2'>
                {book.genre.map((g) => (
                  <span
                    key={g._id}
                    className='border border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:border-slate-700'
                  >
                    {g.title}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {book.description && (
              <div className='prose prose-sm mb-6 max-w-none text-slate-700 dark:prose-invert dark:text-slate-300'>
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
                <div className='border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900'>
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
                        className='flex flex-col gap-2 border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between'
                      >
                        <div>
                          <p className='text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white'>
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
                        <div className='flex items-center gap-4'>
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
                          {!outOfStock && format.stripePriceId && (
                            <AddToCartButton
                              book={book}
                              format={format}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
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

            {/* Author bio */}
            {book.author && (
              <div className='border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900'>
                <div className='mb-2 flex items-center gap-3'>
                  {authorCover && (
                    <div className='relative h-10 w-10 shrink-0 overflow-hidden'>
                      <Image src={authorCover} alt={book.author.name ?? ''} fill className='object-cover' sizes='40px' />
                    </div>
                  )}
                  <div>
                    <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                      About the Author
                    </p>
                    <p className='text-sm font-black text-slate-900 dark:text-white'>
                      {book.author.name}
                    </p>
                  </div>
                </div>
                {book.author.bio && (
                  <div className='prose prose-sm max-w-none text-slate-600 dark:prose-invert dark:text-slate-400'>
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
