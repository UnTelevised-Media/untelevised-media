// src/app/feed.xml/route.ts
import { sanityFetch } from '@/lib/sanity/lib/live';
import { queryRSSFeed } from '@/lib/sanity/lib/queries';
import { generateRSSXML } from '@/lib/rssUtils';

export const revalidate = 3600;

export async function GET() {
  try {
    const { data: articles } = await sanityFetch({
      query: queryRSSFeed,
      tags: ['article'],
    });

    const xml = generateRSSXML(articles ?? []);

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[RSS] Failed to generate feed:', error);
    return new Response('Failed to generate RSS feed', { status: 500 });
  }
}
