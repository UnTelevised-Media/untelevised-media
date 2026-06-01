import Link from 'next/link';
import { Flame } from 'lucide-react';
import { groq } from 'next-sanity';
import sanityFetch from '@/lib/sanity/lib/fetch';
import formatDate from '@/util/formatDate';

interface BreakingArticle {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt?: string;
  _createdAt: string;
}

const query = groq`
  *[_type == 'article' && breakingNews == true]
  | order(publishedAt desc, _createdAt desc)
  [0...10] {
    _id,
    title,
    slug,
    publishedAt,
    _createdAt,
  }
`;

export default async function RecentBreakingNews() {
  let articles: BreakingArticle[] = [];
  try {
    const data = await sanityFetch<BreakingArticle[]>({
      query,
      tags: ['article'],
    });
    articles = data ?? [];
  } catch {
    return null;
  }

  if (articles.length === 0) return null;

  return (
    <section aria-label='Recent breaking news'>
      <div className='flex items-center gap-2 bg-untele px-4 py-2'>
        <Flame className='h-4 w-4 animate-pulse text-white' aria-hidden='true' />
        <h2 className='text-xs font-black uppercase tracking-widest text-white'>Breaking News</h2>
      </div>
      <ol className='divide-y divide-border border border-t-0 border-border'>
        {articles.map((article) => (
          <li key={article._id} className='group'>
            <Link
              href={`/articles/${article.slug.current}`}
              className='flex items-start gap-3 p-3 transition-colors hover:bg-muted/50'
            >
              <div className='min-w-0 flex-1 space-y-1'>
                <p className='line-clamp-3 text-sm font-black uppercase leading-tight tracking-wide transition-colors group-hover:text-untele'>
                  {article.title}
                </p>
                <time
                  dateTime={article.publishedAt ?? article._createdAt}
                  className='block text-xs uppercase tracking-widest text-muted-foreground'
                >
                  {formatDate(article.publishedAt ?? article._createdAt)}
                </time>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
