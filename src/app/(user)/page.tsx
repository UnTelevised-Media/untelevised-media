/* eslint-disable react/function-component-definition */
import { draftMode } from 'next/headers';
import Link from 'next/link';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import ArticleCardLg from '@/components/cards/ArticleCardLg';
import LiveWidget from '@/components/cards/LiveWidget';

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
    }
  } 
  | order(_createdAt desc)
`;

export const revalidate = 120;

export default async function HomePage() {
  if (draftMode().isEnabled) {
    return (
      <div>
        <h1>This is Draft Mode</h1>
        <Link href='/api/exit-draft'>Exit Draft Mode</Link>
      </div>
    );
  }

  // Fetch post & liveEvents from Database
  const posts = await client.fetch(queryPost);
  const liveEvents = await client.fetch(queryLiveEvent);
  const currentLiveEvents = liveEvents.filter(
    (event: { isCurrentEvent: boolean }) => event.isCurrentEvent,
  );

  return (
    <div className='mx-auto max-w-[95wv] md:max-w-[85vw]'>
      <LiveWidget liveEvents={currentLiveEvents} />{' '}
      <ArticleCardLg posts={posts} />
    </div>
  );
}
