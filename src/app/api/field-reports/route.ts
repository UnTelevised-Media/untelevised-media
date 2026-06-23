import { sanityFetch } from '@/lib/sanity/lib/fetch';
import { NextRequest, NextResponse } from 'next/server';

const REPORTS_PER_PAGE = 6;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '0', 10);

  const startIdx = page * REPORTS_PER_PAGE;
  const endIdx = startIdx + REPORTS_PER_PAGE;

  try {
    const articles = await sanityFetch({
      query: `*[_type == "article" && isFieldReport == true && defined(slug.current)]
        | order(eventDate desc)
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

    return NextResponse.json({
      data: articles || [],
      hasMore: (articles?.length || 0) === REPORTS_PER_PAGE,
    });
  } catch (error) {
    console.error('Failed to fetch field reports:', error);
    return NextResponse.json({ error: 'Failed to fetch field reports' }, { status: 500 });
  }
}
