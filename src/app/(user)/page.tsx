/* eslint-disable react/function-component-definition */
import { draftMode } from 'next/headers';
// import { token } from '@/lib/sanity.fetch';
import { client } from '@/lib/sanity.client';
import Link from 'next/link';
import { groq } from 'next-sanity';
// import PreviewProvider from '@/components/PreviewProvider';
import BlogItem from '@/components/BlogItem';

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
    <div className='mx-auto max-w-[85vw]'>
      <BlogItem posts={posts} />
    </div>
  );
}
