import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryMostReadArticles } from '@/lib/sanity/lib/queries';
import formatDate from '@/util/formatDate';

interface TrendingArticle {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  viewCount: number;
  author: { name: string; slug: { current: string } } | null;
}

export default async function TrendingSection() {
  const articles = await sanityFetch<TrendingArticle[]>({
    query: queryMostReadArticles,
    tags: ['article'],
  });

  if (!articles || articles.length === 0) return null;

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
