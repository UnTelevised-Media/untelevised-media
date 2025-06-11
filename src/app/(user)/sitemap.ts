// sitemap.ts

import getAllURLs from "@/util/getAllUrls";


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
  const allNews = await getAllURLs();

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
      changeFrequency: 'hourly' as const,
      priority: 0.5,
    }));

  const authorURLs = allNews
    .filter((item) => item._type === 'author')
    .map((author) => ({
      url: `https://www.untelevised.media/author/${author.slug.current}`,
      lastModified: author._updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

  const categoryURLs = allNews
    .filter((item) => item._type === 'category')
    .map((category) => ({
      url: `https://www.untelevised.media/category/${category.slug.current}`,
      lastModified: category._updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

  const policyURLs = allNews
    .filter((item) => item._type === 'policies')
    .map((policy) => ({
      url: `https://www.untelevised.media/policies/${policy.slug.current}`,
      lastModified: policy._updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

  return [
    ...postURLs,
    ...liveEventURLs,
    ...authorURLs,
    ...categoryURLs,
    ...policyURLs,
    {
      url: 'https://www.untelevised.media/',
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.3,
    },
  ];
}
