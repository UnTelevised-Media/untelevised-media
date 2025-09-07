// src/app/(user)/sitemap.ts

import getAllURLs from '@/util/getAllUrls';

export default async function sitemap(): Promise<
  {
    url: string;
    lastModified?: string | Date;
    changeFrequency?: 'hourly' | 'always' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  }[]
> {
  const allNews = await getAllURLs();

  const articleURLs = allNews
    .filter((item) => item._type === 'article')
    .map((article) => ({
      url: `https://www.untelevised.media/articles/${article.slug.current}`,
      lastModified: article._updatedAt,
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

  const songURLs = allNews
    .filter((item) => item._type === 'song')
    .map((song) => ({
      url: `https://www.untelevised.media/lyrics/${song.slug.current}`,
      lastModified: song._updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  const musicArtistURLs = allNews
    .filter((item) => item._type === 'musicArtist')
    .map((artist) => ({
      url: `https://www.untelevised.media/music-artists/${artist.slug.current}`,
      lastModified: artist._updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const albumURLs = allNews
    .filter((item) => item._type === 'album')
    .map((album) => ({
      url: `https://www.untelevised.media/albums/${album.slug.current}`,
      lastModified: album._updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [
    ...articleURLs,
    ...liveEventURLs,
    ...authorURLs,
    ...categoryURLs,
    ...policyURLs,
    ...songURLs,
    ...musicArtistURLs,
    ...albumURLs,
    {
      url: 'https://www.untelevised.media/',
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.3,
    },
    {
      url: 'https://www.untelevised.media/lyrics',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: 'https://www.untelevised.media/music-artists',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];
}
