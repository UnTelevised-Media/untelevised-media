// getAllNews.ts
import { groq } from 'next-sanity';
import { client } from '@/l/sanity/client';

export default async function getAllURLs() {
  const queryArticles = groq`
    *[_type == "post"] {
      ...,
      title,
      slug,
    }`;
  const queryLiveEvents = groq`
    *[_type == "liveEvent"] {
      ...,
      title->,
      slug,
    }`;

  const queryAuthors = groq`
    *[_type == "author"] {
      ...,
      slug,
    }`;

  const queryCategories = groq`
    *[_type == "category"] {
      ...,
      slug,
    }`;

  const queryPolicies = groq`
    *[_type == "policies"] {
      ...,
      slug,
    }`;

  try {
    const posts = await client.fetch(queryArticles);
    const liveEvents = await client.fetch(queryLiveEvents);
    const authors = await client.fetch(queryAuthors);
    const categories = await client.fetch(queryCategories);
    const policies = await client.fetch(queryPolicies);

    const allNews = [
      ...posts,
      ...liveEvents,
      ...authors,
      ...categories,
      ...policies,
    ];

    return allNews;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error; // You can handle the error according to your needs
  }
}
