// sitemap.ts
import getAllNews from '@/util/getAllNews';

export default async function sitemap(): Promise<
  {
    url: string;
    lastModified?: string | Date;
    changeFrequency?:
      | 'hourly'
      | 'always'
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'yearly'
      | 'never';
    priority?: number;
  }[]
> {
  const allNews = await getAllNews();

  const postURLs = allNews
    .filter((item) => item._type === 'post')
    .map((post) => ({
      url: `https://www.untelevised.media/post/${post.slug.current}`,
      lastModified: post._updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.5,
    }));

  const liveEventURLs = allNews
    .filter((item) => item._type === 'liveEvent')
    .map((liveEvent) => ({
      url: `https://www.untelevised.media/live-event/${liveEvent.slug.current}`,
      lastModified: liveEvent._updatedAt, 
      changeFrequency: 'daily' as const,
      priority: 0.5,
    }));

  return [
    ...postURLs,
    ...liveEventURLs,
    {
      url: 'https://www.untelevised.media/',
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.3,
    },
  ];
}