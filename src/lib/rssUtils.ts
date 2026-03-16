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

function buildItem(article: RSSArticle): string {
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

export function generateRSSXML(articles: RSSArticle[]): string {
  const lastBuildDate = new Date().toUTCString();
  const items = articles.map(buildItem).join('\n');

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
    ${items}
  </channel>
</rss>`;
}
