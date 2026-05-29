// src/util/getAllUrls.ts
// Fetches the minimal fields needed for sitemap.ts — slug, _updatedAt, _type.
// Each query filters by defined(slug.current) to skip draft/incomplete docs
// that have no slug, preventing "Cannot read properties of null" errors.
import sanityClient from '@/lib/sanity/lib/client';
import { groq } from 'next-sanity';

// Re-usable minimal type returned by every query
type SlugDoc = {
  _type: string;
  _updatedAt: string;
  slug: { current: string };
};

const queryAllArticleUrls = groq`
  *[_type == "article" && defined(slug.current)] {
    _type,
    _updatedAt,
    slug,
  }`;

const queryAllLiveEventUrls = groq`
  *[_type == "liveEvent" && defined(slug.current)] {
    _type,
    _updatedAt,
    slug,
  }`;

const queryAuthors = groq`
  *[_type == "author" && defined(slug.current)] {
    _type,
    _updatedAt,
    slug,
  }`;

const queryAllCategoryUrls = groq`
  *[_type == "category" && defined(slug.current)] {
    _type,
    _updatedAt,
    slug,
  }`;

const queryPolicies = groq`
  *[_type == "policies" && defined(slug.current)] {
    _type,
    _updatedAt,
    slug,
  }`;

const querySongs = groq`
  *[_type == "song" && defined(slug.current)] {
    _type,
    _updatedAt,
    slug,
  }`;

const queryMusicArtists = groq`
  *[_type == "musicArtist" && defined(slug.current)] {
    _type,
    _updatedAt,
    slug,
  }`;

const queryAlbums = groq`
  *[_type == "album" && defined(slug.current)] {
    _type,
    _updatedAt,
    slug,
  }`;

const queryTimelines = groq`
  *[_type == "timeline" && defined(slug.current)] {
    _type,
    _updatedAt,
    slug,
  }`;

export default async function getAllURLs(): Promise<SlugDoc[]> {
  try {
    const [
      articles,
      liveEvents,
      authors,
      categories,
      policies,
      songs,
      musicArtists,
      albums,
      timelines,
    ] = await Promise.all([
      sanityClient.fetch<SlugDoc[]>(queryAllArticleUrls),
      sanityClient.fetch<SlugDoc[]>(queryAllLiveEventUrls),
      sanityClient.fetch<SlugDoc[]>(queryAuthors),
      sanityClient.fetch<SlugDoc[]>(queryAllCategoryUrls),
      sanityClient.fetch<SlugDoc[]>(queryPolicies),
      sanityClient.fetch<SlugDoc[]>(querySongs),
      sanityClient.fetch<SlugDoc[]>(queryMusicArtists),
      sanityClient.fetch<SlugDoc[]>(queryAlbums),
      sanityClient.fetch<SlugDoc[]>(queryTimelines),
    ]);

    return [
      ...articles,
      ...liveEvents,
      ...authors,
      ...categories,
      ...policies,
      ...songs,
      ...musicArtists,
      ...albums,
      ...timelines,
    ];
  } catch (error) {
    console.error('Error fetching URLs for sitemap:', error);
    throw error;
  }
}
