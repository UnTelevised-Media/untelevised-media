import { client } from '@/lib/sanity/lib/client';
import LatestAlerts from './LatestAlerts';

async function getLatestAlerts() {
  const fourtyFiveDaysAgo = new Date();
  fourtyFiveDaysAgo.setDate(fourtyFiveDaysAgo.getDate() - 45);
  const cutoffDate = fourtyFiveDaysAgo.toISOString().split('T')[0];

  const query = `
    *[_type == "article" && featured == true && publishedAt >= "${cutoffDate}"]
    | order(publishedAt desc)
    [0...20]
    {
      title,
      slug
    }
  `;

  try {
    const articles = await client.fetch(query);
    return articles || [];
  } catch (error) {
    console.error('Failed to fetch latest alerts:', error);
    return [];
  }
}

export default async function LatestAlertsServer() {
  const articles = await getLatestAlerts();

  if (articles.length === 0) {
    return null;
  }

  return <LatestAlerts articles={articles} />;
}
