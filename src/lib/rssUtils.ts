// src/lib/rssUtils.ts
import urlForImage from '@/util/urlForImage';

const BASE_URL = 'https://www.untelevised.media';

interface RSSArticle {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  publishedAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mainImage?: any;
  author?: { name: string };
  category?: { title: string };
}

// ! TODO: When live events are renamed to "breaking" (upcoming issue),
// ! update the following:
// !   - queryRSSLiveEvents → queryRSSBreakingEvents (in queries.ts)
// !   - URL path: '/live-event/' → '/breaking/'
// !   - Category label: 'Live Coverage' → 'Breaking News'
// !   - Sanity _type filter: 'liveEvent' → 'breaking'
interface RSSLiveEvent {
  _id: string;
  title: string;
  slug: string;
  // Live events use description (summary) and subtitle instead of article body
  description?: string;
  subtitle?: string;
  // Live events use eventDate, not publishedAt
  eventDate: string;
  _updatedAt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mainImage?: any;
  // Live events have no author field — coverage is by the newsroom
  eventStatus?: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRFC2822(dateStr: string): string {
  return new Date(dateStr).toUTCString();
}

function buildArticleItem(article: RSSArticle): string {
  const url = `${BASE_URL}/articles/${article.slug}`;
  const imageUrl = article.mainImage?.asset
    ? urlForImage(article.mainImage)?.width(1200).url()
    : null;

  return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${toRFC2822(article.publishedAt)}</pubDate>
      <description><![CDATA[${article.description ?? ''}]]></description>
      ${article.author ? `<author>${escapeXml(article.author.name)}</author>` : ''}
      ${article.category ? `<category><![CDATA[${article.category.title}]]></category>` : ''}
      ${imageUrl ? `<media:content url="${escapeXml(imageUrl)}" medium="image" />` : ''}
    </item>`;
}

// ! TODO: rename path '/live-event/' → '/breaking/' when breaking-events rename ships
function buildLiveEventItem(event: RSSLiveEvent): string {
  const url = `${BASE_URL}/live-event/${event.slug}`;
  const imageUrl = event.mainImage?.asset ? urlForImage(event.mainImage)?.width(1200).url() : null;
  // Use subtitle as a secondary description if description is missing
  const description = event.description ?? event.subtitle ?? '';
  // Live events fall back to _updatedAt when no eventDate
  const pubDate = event.eventDate ?? event._updatedAt ?? new Date().toISOString();

  return `
    <item>
      <title><![CDATA[🔴 LIVE: ${event.title}]]></title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${toRFC2822(pubDate)}</pubDate>
      <description><![CDATA[${description}]]></description>
      <author>newsroom@untelevised.media (UnTelevised Media Newsroom)</author>
      <category><![CDATA[Live Coverage]]></category>
      ${imageUrl ? `<media:content url="${escapeXml(imageUrl)}" medium="image" />` : ''}
    </item>`;
}

export function generateRSSXML(articles: RSSArticle[], liveEvents: RSSLiveEvent[] = []): string {
  const lastBuildDate = new Date().toUTCString();

  // Merge and sort all items by date, newest first
  const articleItems = articles.map((a) => ({
    date: new Date(a.publishedAt),
    xml: buildArticleItem(a),
  }));
  const liveItems = liveEvents.map((e) => ({
    date: new Date(e.eventDate ?? e._updatedAt ?? 0),
    xml: buildLiveEventItem(e),
  }));

  const allItems = [...articleItems, ...liveItems]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map((item) => item.xml)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
>
  <channel>
    <title>UnTelevised Media</title>
    <link>${BASE_URL}</link>
    <description>Unfiltered. Uncensored. Uncompromising. Independent journalism from UnTelevised Media.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <managingEditor>news@untelevised.media (UnTelevised Media)</managingEditor>
    <ttl>60</ttl>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE_URL}/og-default.png</url>
      <title>UnTelevised Media</title>
      <link>${BASE_URL}</link>
    </image>
    ${allItems}
  </channel>
</rss>`;
}
