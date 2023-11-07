/* eslint-disable react/function-component-definition */
import { draftMode } from 'next/headers';
import Link from 'next/link';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import BlogItem from '@/components/BlogItem';
import LiveWidget from '@/components/LiveWidget';

const queryPost = groq`
  *[_type=='post'] {
    ...,
    author->,
    categories[]->,
    description,
    publistedAt,
  } 
  | order(_createdAt desc)
`;
const queryLiveEvent = groq`
  *[_type=='liveEvent'] {
    ...,
    description,
    title,
    slug,
    eventDate,
    keyEvent[]->,
      relatedArticles[]-> {
        slug,
        _id,
        title,
        _createdAt,
        description,
        eventDate,
      // Add other fields you want to retrieve from relatedArticles
    }
  } 
`;

export const revalidate = 180;

export default async function HomePage() {
  if (draftMode().isEnabled) {
    return (
      <div>
        <h1>This is Draft Mode</h1>
        <Link href='/api/exit-draft'>Exit Draft Mode</Link>
      </div>
    );
  }

  const posts = await client.fetch(queryPost);
  const liveEvents = await client.fetch(queryLiveEvent);
  const currentLiveEvents = liveEvents.filter((event) => event.isCurrentEvent);

  return (
    <div className='mx-auto max-w-[95wv] md:max-w-[85vw]'>
      <LiveWidget liveEvents={currentLiveEvents} />{' '}
      <BlogItem posts={posts} />
    </div>
  );
}
