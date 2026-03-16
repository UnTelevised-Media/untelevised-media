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

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const articleURLs = allNews
    .filter((item) => item._type === 'article')
    .map((article) => {
      const updatedAt = new Date(article._updatedAt);
      const priority = updatedAt >= thirtyDaysAgo ? 0.8 : updatedAt >= ninetyDaysAgo ? 0.6 : 0.4;
      return {
        url: `https://www.untelevised.media/articles/${article.slug.current}/`,
        lastModified: article._updatedAt,
        changeFrequency: 'daily' as const,
        priority,
      };
    });

  const liveEventURLs = allNews
    .filter((item) => item._type === 'liveEvent')
    .map((liveEvent) => ({
      url: `https://www.untelevised.media/live-event/${liveEvent.slug.current}/`,
      lastModified: liveEvent._updatedAt,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    }));

  const authorURLs = allNews
    .filter((item) => item._type === 'author')
    .map((author) => ({
      url: `https://www.untelevised.media/author/${author.slug.current}/`,
      lastModified: author._updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  const categoryURLs = allNews
    .filter((item) => item._type === 'category')
    .map((category) => ({
      url: `https://www.untelevised.media/category/${category.slug.current}/`,
      lastModified: category._updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

  const policyURLs = allNews
    .filter((item) => item._type === 'policies')
    .map((policy) => ({
      url: `https://www.untelevised.media/policies/${policy.slug.current}/`,
      lastModified: policy._updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    }));

  const songURLs = allNews
    .filter((item) => item._type === 'song')
    .map((song) => ({
      url: `https://www.untelevised.media/lyrics/${song.slug.current}/`,
      lastModified: song._updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  const musicArtistURLs = allNews
    .filter((item) => item._type === 'musicArtist')
    .map((artist) => ({
      url: `https://www.untelevised.media/music-artists/${artist.slug.current}/`,
      lastModified: artist._updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const albumURLs = allNews
    .filter((item) => item._type === 'album')
    .map((album) => ({
      url: `https://www.untelevised.media/albums/${album.slug.current}/`,
      lastModified: album._updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const timelineURLs = allNews
    .filter((item) => item._type === 'timeline')
    .map((timeline) => ({
      url: `https://www.untelevised.media/timeline/${timeline.slug.current}/`,
      lastModified: timeline._updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [
    // Homepage — highest priority
    {
      url: 'https://www.untelevised.media/',
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 1.0,
    },
    // Dynamic content
    ...articleURLs,
    ...liveEventURLs,
    ...authorURLs,
    ...categoryURLs,
    ...policyURLs,
    ...songURLs,
    ...musicArtistURLs,
    ...albumURLs,
    ...timelineURLs,
    // Static section pages — music
    {
      url: 'https://www.untelevised.media/lyrics/',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: 'https://www.untelevised.media/music-artists/',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    // Static section pages — editorial & info
    {
      url: 'https://www.untelevised.media/about/',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: 'https://www.untelevised.media/staff/',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: 'https://www.untelevised.media/past-events/',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: 'https://www.untelevised.media/timelines/',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    // Static section pages — engagement & conversion
    {
      url: 'https://www.untelevised.media/join/',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: 'https://www.untelevised.media/donate/',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: 'https://www.untelevised.media/support/',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    // Static section pages — source protection
    {
      url: 'https://www.untelevised.media/secure-contact/',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: 'https://www.untelevised.media/whistleblower/',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];
}
