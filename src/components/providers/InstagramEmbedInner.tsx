'use client';

import Link from 'next/link';

export default function InstagramEmbedInner({ postId }: { postId: string }) {
  return (
    <div className='mx-auto my-8 flex max-w-full justify-center'>
      <blockquote
        className='instagram-media min-w-fit max-w-xl'
        data-instgrm-captioned
        data-instgrm-permalink={`https://www.instagram.com/p/${postId}`}
        data-instgrm-version='14'
      >
        <div>
          <Link
            href={`https://www.instagram.com/p/${postId}`}
            className='text-untele hover:text-red-700'
            target='_blank'
          >
            View this post on Instagram
          </Link>
        </div>
      </blockquote>
      <script async src='//www.instagram.com/embed.js'></script>
    </div>
  );
}
