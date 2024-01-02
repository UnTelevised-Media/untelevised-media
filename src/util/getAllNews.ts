// getAllNews.ts
import { groq } from 'next-sanity';
import { client } from '@/l/sanity.client';

export default async function getAllNews() {
  const postQuery = groq`
    *[_type == "post"] {
      ...,
      title,
      slug,
    }`;
  const liveEventQuery = groq`
    *[_type == "liveEvent"] {
      ...,
      title->,
      slug,
    }`;

  try {
    const posts = await client.fetch(postQuery);
    const liveEvents = await client.fetch(liveEventQuery);

    const allNews = [...posts, ...liveEvents];

    return allNews;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error; // You can handle the error according to your needs
  }
}
