'use server';

import { sanityFetch } from '@/lib/sanity/lib/fetch';
import type { RawFeedArticle, FieldReportArticle } from '@/models/types/feeds';

const ARTICLES_PER_PAGE = 12;
const REPORTS_PER_PAGE = 6;

function buildArticleExclusionFilter(excludedIds: string[]): string {
  if (excludedIds.length === 0) return '';
  return `&& !(_id in [${excludedIds.map((id) => `"${id}"`).join(', ')}]) && !(slug.current in [${excludedIds.map((id) => `"${id}"`).join(', ')}])`;
}

export async function getRawFeedArticles(
  page: number,
  excludedIds: string[]
): Promise<{ data: RawFeedArticle[]; hasMore: boolean }> {
  const startIdx = page * ARTICLES_PER_PAGE;
  const endIdx = startIdx + ARTICLES_PER_PAGE;
  const excludeFilter = buildArticleExclusionFilter(excludedIds);

  const result = await sanityFetch<RawFeedArticle[]>({
    query: `*[_type == "article" && defined(slug.current) ${excludeFilter}]
      | order(publishedAt desc)
      [${startIdx}...${endIdx}] {
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

  const articles = result.data ?? [];
  return {
    data: articles,
    hasMore: articles.length === ARTICLES_PER_PAGE,
  };
}

export async function getFieldReports(
  page: number
): Promise<{ data: FieldReportArticle[]; hasMore: boolean }> {
  const startIdx = page * REPORTS_PER_PAGE;
  const endIdx = startIdx + REPORTS_PER_PAGE;

  const result = await sanityFetch<FieldReportArticle[]>({
    query: `*[_type == "article" && isFieldReport == true && defined(slug.current)]
      | order(publishedAt desc)
      [${startIdx}...${endIdx}] {
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

  const articles = result.data ?? [];
  return {
    data: articles,
    hasMore: articles.length === REPORTS_PER_PAGE,
  };
}
