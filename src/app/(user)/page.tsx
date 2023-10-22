/* eslint-disable react/function-component-definition */
import { draftMode } from 'next/headers';
import Link from 'next/link';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import BlogItem from '@/components/BlogItem';
// import { useGAPageviewTracking } from '@/lib/googleAnalytics';

const query = groq`
  *[_type=='post'] {
    ...,
    author->,
    categories[]->,
    description,
  } 
  | order(_createdAt desc)
`;

export const revalidate = 180;

export default async function HomePage() {
  
//         if (process.env.NODE_ENV === "production") {
//           // Initialize Google Analytics
//           // eslint-disable-next-line react-hooks/rules-of-hooks
//           useGAPageviewTracking();
//         }
      
  if (draftMode().isEnabled) {
    return (
      <div>
        <h1>This is Draft Mode</h1>
        <Link href='/api/exit-draft'>Exit Draft Mode</Link>
      </div>
    );
  }

  const posts = await client.fetch(query);
  return (
    <div className='mx-auto md:max-w-[85vw] max-w-[95wv]'>
      <BlogItem posts={posts} />
    </div>
  );
}
