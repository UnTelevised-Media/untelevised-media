import { sanityFetch } from '@/lib/sanity/lib/fetch';
import type { FieldReportArticle } from '@/models/types/feeds';
import FieldReportsPaginated from './FieldReportsPaginated';

const REPORTS_PER_PAGE = 6;

export default async function FieldReportsServer() {
  // Fetch initial set of field reports
  const { data: initialArticles } = await sanityFetch<FieldReportArticle[]>({
    query: `*[_type == "article" && isFieldReport == true && defined(slug.current)]
      | order(publishedAt desc)
      [0...${REPORTS_PER_PAGE}] {
      _id,
      title,
      slug,
      description,
      publishedAt,
      location,
      mainImage,
      "author": author->{ name },
      "categories": categories[]->{ title }
    }`,
    tags: ['article'],
  });

  const hasMore = (initialArticles?.length ?? 0) === REPORTS_PER_PAGE;

  return (
    <FieldReportsPaginated
      initialArticles={initialArticles ?? []}
      hasMore={hasMore}
    />
  );
}
