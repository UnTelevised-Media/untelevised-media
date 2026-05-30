import { cache } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp } from 'lucide-react';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryMostReadArticles } from '@/lib/sanity/lib/queries';
import formatDate from '@/util/formatDate';
import urlForImage from '@/util/urlForImage';

interface TrendingArticle {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  viewCount: number;
  description?: string;
  location?: string;
  tags?: string[];
  mainImage?: { asset: { _ref: string }; alt?: string };
  author: { name: string; slug: { current: string } } | null;
  categories?: { title: string; slug: { current: string } }[];
}

// Deduplicated within a single request — both 'card' and 'list' variants share one fetch
const getTrendingArticles = cache(async (): Promise<TrendingArticle[]> => {
  const articles = await sanityFetch<TrendingArticle[]>({
    query: queryMostReadArticles,
    tags: ['article'],
  });
  return articles ?? [];
});

interface Props {
  variant?: 'card' | 'list';
}

export default async function TrendingSection({ variant }: Props = {}) {
  const articles = await getTrendingArticles();

  if (articles.length === 0) return null;

  // --- #1 Featured Card ---
  if (variant === 'card') {
    const top = articles[0];
    const imageUrl = urlForImage(top.mainImage as any)?.width(600).height(340).url();

    return (
      <section aria-label='Most Read' className='flex h-full flex-col'>
        <div className='flex shrink-0 items-center gap-2 bg-untele px-4 py-2'>
          <TrendingUp className='h-4 w-4 text-white' aria-hidden='true' />
          <h2 className='text-xs font-black uppercase tracking-widest text-white'>Most Read</h2>
        </div>
        <Link href={`/articles/${top.slug.current}`} className='group flex flex-1 flex-col'>
          {/* Image */}
          <div className='relative aspect-video w-full shrink-0 overflow-hidden bg-slate-200 dark:bg-slate-800'>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={top.mainImage?.alt ?? top.title}
                fill
                sizes='(max-width: 1024px) 100vw, 33vw'
                className='object-cover transition-transform duration-300 group-hover:scale-105'
              />
            ) : null}
            <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
            <span className='absolute left-0 top-0 bg-untele px-3 py-1 text-xs font-black text-white'>
              #1
            </span>
          </div>
          {/* Text — grows to fill remaining column height */}
          <div className='flex flex-1 flex-col justify-between border border-t-0 border-slate-200 p-4 dark:border-slate-700'>
            <div>
              {/* Categories */}
              {top.categories && top.categories.length > 0 && (
                <div className='mb-2 flex flex-wrap gap-1'>
                  {top.categories.map((cat) => (
                    <span
                      key={cat.slug.current}
                      className='bg-untele px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white'
                    >
                      {cat.title}
                    </span>
                  ))}
                </div>
              )}
              <p className='text-sm font-black uppercase leading-snug tracking-wide transition-colors group-hover:text-untele'>
                {top.title}
              </p>
              {top.description && (
                <p className='mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400'>
                  {top.description}
                </p>
              )}
              {/* Tags / Topics */}
              {top.tags && top.tags.length > 0 && (
                <div className='mt-3 flex flex-wrap gap-1'>
                  {top.tags.map((tag) => (
                    <span
                      key={tag}
                      className='border border-slate-300 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:text-slate-400'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {/* Meta */}
            <div className='mt-4 space-y-1.5'>
              {top.location && (
                <p className='text-xs uppercase tracking-widest text-muted-foreground'>
                  📍 {top.location}
                </p>
              )}
              <div className='flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground'>
                {top.author?.name && <span>{top.author.name}</span>}
                {top.publishedAt && (
                  <>
                    {top.author?.name && <span aria-hidden='true'>·</span>}
                    <time dateTime={top.publishedAt}>{formatDate(top.publishedAt)}</time>
                  </>
                )}
              </div>
              {top.viewCount > 0 && (
                <p className='text-sm font-black uppercase tracking-widest text-untele'>
                  {top.viewCount.toLocaleString()} views
                </p>
              )}
            </div>
          </div>
        </Link>
      </section>
    );
  }

  // --- #2–10 Compact List ---
  if (variant === 'list') {
    const rest = articles.slice(1);
    if (rest.length === 0) return null;

    return (
      <section aria-label='More most-read articles'>
        <ol className='divide-y divide-border border border-border'>
          {rest.map((article, index) => (
            <li key={article._id} className='group'>
              <Link
                href={`/articles/${article.slug.current}`}
                className='flex items-start gap-3 p-3 transition-colors hover:bg-muted/50'
              >
                <span className='w-7 shrink-0 text-2xl font-black leading-none tabular-nums text-muted-foreground/30'>
                  {index + 2}
                </span>
                <div className='min-w-0 flex-1 space-y-1'>
                  {article.categories?.[0] && (
                    <span className='inline-block bg-untele px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white'>
                      {article.categories[0].title}
                    </span>
                  )}
                  <p className='line-clamp-2 text-sm font-black uppercase leading-tight tracking-wide transition-colors group-hover:text-untele'>
                    {article.title}
                  </p>
                  <div className='flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground'>
                    {article.author?.name && <span>{article.author.name}</span>}
                    {article.publishedAt && (
                      <>
                        {article.author?.name && <span aria-hidden='true'>·</span>}
                        <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  // --- Default: full numbered list (used in article page sidebar) ---
  return (
    <section aria-label='Trending articles'>
      <div className='flex items-center gap-2 bg-untele px-4 py-2'>
        <TrendingUp className='h-4 w-4 text-white' aria-hidden='true' />
        <h2 className='text-xs font-black uppercase tracking-widest text-white'>Most Read</h2>
      </div>
      <ol className='divide-y divide-border border border-border'>
        {articles.slice(0, 10).map((article, index) => (
          <li key={article._id} className='group'>
            <Link
              href={`/articles/${article.slug.current}`}
              className='flex items-start gap-3 p-3 transition-colors hover:bg-muted/50'
            >
              <span className='w-7 shrink-0 text-2xl font-black leading-none tabular-nums text-muted-foreground/30'>
                {index + 1}
              </span>
              <div className='min-w-0 flex-1 space-y-0.5'>
                <p className='line-clamp-3 text-sm font-black uppercase leading-tight tracking-wide transition-colors group-hover:text-untele'>
                  {article.title}
                </p>
                <div className='flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground'>
                  {article.author?.name && <span>{article.author.name}</span>}
                  {article.publishedAt && (
                    <>
                      {article.author?.name && <span aria-hidden='true'>·</span>}
                      <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                    </>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
