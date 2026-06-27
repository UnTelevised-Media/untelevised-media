import { sanityFetch } from '@/lib/sanity/lib/fetch';
import type { RawFeedArticle } from '@/models/types/feeds';
import RawFeedPaginated from './RawFeedPaginated';

interface Props {
  excludedIds: string[];
}

export default async function RawFeedServer({ excludedIds }: Props) {
  // Build query with exclusion filter (exclude by both _id and slug.current)
  const excludeFilter =
    excludedIds.length > 0
      ? `&& !(_id in [${excludedIds.map((id) => `"${id}"`).join(', ')}]) && !(slug.current in [${excludedIds.map((id) => `"${id}"`).join(', ')}])`
      : '';

  // Fetch all articles at once for client-side pagination (single API call, instant UX)
  const { data: articles } = await sanityFetch<RawFeedArticle[]>({
    query: `*[_type == "article" && defined(slug.current) ${excludeFilter}]
      | order(publishedAt desc) {
      _id,
      title,
      slug,
      description,
      publishedAt,
      mainImage,
      "author": author->{ name },
      "categories": categories[]->{ title }
    }`,
    tags: ['article'],
  });

  // Client-side pagination: all articles loaded once, sliced as user interacts
  // Benefits: 1 API call, instant pagination, lower API quota usage
  // Trade-off: ~100-200KB in browser memory (acceptable for this scale)

  return (
    <>
      <div className='mb-8 border-b border-slate-300 pb-4 dark:border-slate-800'>
        <h2 className='text-2xl font-black uppercase tracking-widest text-untele'>RAW FEED</h2>
        <p className='mt-2 text-sm text-slate-600 dark:text-slate-400'>
          Unfiltered. Uncensored. Direct from our correspondents.
        </p>
      </div>

      <RawFeedPaginated articles={articles ?? []} />
    </>
  );
}
