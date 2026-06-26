import { sanityFetch } from '@/lib/sanity/lib/fetch';
import LatestAlerts from './LatestAlerts';

async function getLatestAlerts() {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const cutoffDate = fourteenDaysAgo.toISOString().split('T')[0];

  const { data: articles } = await sanityFetch<Array<{ title: string; slug: { current: string } }>>({
    query: `
      *[_type == "article" && featured == true && publishedAt >= "${cutoffDate}"]
      | order(publishedAt desc)
      [0...8]
      {
        title,
        slug
      }
    `,
    tags: ['article'],
  });

  return articles || [];
}

export default async function LatestAlertsServer() {
  const articles = await getLatestAlerts();

  if (articles.length === 0) {
    return null;
  }

  return <LatestAlerts articles={articles} />;
}
