// src/app/feed.xml/route.ts
import { sanityFetch } from '@/lib/sanity/lib/live';
import { queryRSSFeed, queryRSSLiveEvents } from '@/lib/sanity/lib/queries';
import { generateRSSXML, type RSSArticle, type RSSLiveEvent } from '@/lib/rssUtils';

export const revalidate = 3600;

export async function GET() {
  try {
    // Fetch articles and live events in parallel
    // ! TODO: update queryRSSLiveEvents → queryRSSBreakingEvents when rename ships
    const [{ data: articles }, { data: liveEvents }] = await Promise.all([
      sanityFetch({ query: queryRSSFeed, tags: ['article'] }) as Promise<{ data: RSSArticle[] }>,
      sanityFetch({ query: queryRSSLiveEvents, tags: ['liveEvent'] }) as Promise<{
        data: RSSLiveEvent[];
      }>,
    ]);

    const xml = generateRSSXML(articles ?? [], liveEvents ?? []);

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
