import { sanityFetch } from '@/lib/sanity/lib/fetch';
import { NextRequest, NextResponse } from 'next/server';

const ARTICLES_PER_PAGE = 12;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '0', 10);
  const excludedIdsParam = searchParams.get('excludedIds');
  const excludedIds = excludedIdsParam ? excludedIdsParam.split(',').filter(Boolean) : [];

  const startIdx = page * ARTICLES_PER_PAGE;
  const endIdx = startIdx + ARTICLES_PER_PAGE;

  console.log(
    `[raw-feed API] page=${page}, range=[${startIdx}...${endIdx}], excluding ${excludedIds.length} articles`
  );

  try {
    // Build query with exclusion filter (exclude by both _id and slug.current)
    const excludeFilter =
      excludedIds.length > 0
        ? `&& !(_id in [${excludedIds.map((id) => `"${id}"`).join(', ')}]) && !(slug.current in [${excludedIds.map((id) => `"${id}"`).join(', ')}])`
        : '';

    // Fetch all non-excluded articles (no range - we'll slice in JS)
    const articles = await sanityFetch({
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

    const articlesArray = Array.isArray(articles) ? articles : [];

    // Slice for pagination in JS after exclusion filter is applied
    const paginatedArticles = articlesArray.slice(startIdx, endIdx);

    console.log(
      `[raw-feed API] page=${page}, Got ${paginatedArticles.length} articles (total available: ${articlesArray.length})`
    );

    return NextResponse.json({
      data: paginatedArticles,
      hasMore: articlesArray.length > endIdx,
    });
  } catch (error) {
    console.error('Failed to fetch raw feed articles:', error);
    return NextResponse.json({
      data: [],
      hasMore: false,
    });
  }
}
