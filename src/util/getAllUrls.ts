// src/util/getAllUrls.ts
import sanityClient from '@/lib/sanity/lib/client';
import { groq } from 'next-sanity';

export default async function getAllURLs() {
  const queryAllArticleUrls = groq`
    *[_type == "article"] {
      ...,
      title,
      slug,
    }`;
  const queryAllLiveEventUrls = groq`
    *[_type == "liveEvent"] {
      ...,
      title,
      slug,
    }`;

  const queryAuthors = groq`
    *[_type == "author"] {
      ...,
      slug,
    }`;

  const queryAllCategoryUrls = groq`
    *[_type == "category"] {
      ...,
      slug,
    }`;

  const queryPolicies = groq`
    *[_type == "policies"] {
      ...,
      slug,
    }`;

  const querySongs = groq`
    *[_type == "song"] {
      ...,
      title,
      slug,
    }`;

  const queryMusicArtists = groq`
    *[_type == "musicArtist"] {
      ...,
      name,
      slug,
    }`;

  const queryAlbums = groq`
    *[_type == "album"] {
      ...,
      title,
      slug,
    }`;

  const queryTimelines = groq`
    *[_type == "timeline"] {
      ...,
      title,
      slug,
    }`;

  try {
    const articles = await sanityClient.fetch(queryAllArticleUrls);
    const liveEvents = await sanityClient.fetch(queryAllLiveEventUrls);
    const authors = await sanityClient.fetch(queryAuthors);
    const categories = await sanityClient.fetch(queryAllCategoryUrls);
    const policies = await sanityClient.fetch(queryPolicies);
    const songs = await sanityClient.fetch(querySongs);
    const musicArtists = await sanityClient.fetch(queryMusicArtists);
    const albums = await sanityClient.fetch(queryAlbums);
    const timelines = await sanityClient.fetch(queryTimelines);

    const allNews = [
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

    return allNews;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error; // You can handle the error according to your needs
  }
}
