import { sanityFetch } from '@/lib/sanity/lib/fetch';
import type { FieldReportArticle } from '@/models/types/feeds';
import FieldReportsPaginated from './FieldReportsPaginated';

export default async function FieldReportsServer() {
  // Fetch all field reports at once for client-side pagination (single API call, instant UX)
  const { data: articles } = await sanityFetch<FieldReportArticle[]>({
    query: `*[_type == "article" && isFieldReport == true && defined(slug.current)]
      | order(publishedAt desc) {
      _id,
      title,
      slug,
      description,
      publishedAt,
      eventDate,
      location,
      mainImage,
      "author": author->{ name },
      "categories": categories[]->{ title }
    }`,
    tags: ['article'],
  });

  // Client-side pagination: all articles loaded once, sliced as user interacts
  return <FieldReportsPaginated articles={articles ?? []} />;
}
