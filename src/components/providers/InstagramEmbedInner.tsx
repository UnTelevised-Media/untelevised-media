'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface InstagramWindow extends Window {
  instgrm?: {
    Embeds?: {
      process: () => void;
    };
  };
}

export default function InstagramEmbedInner({ postId }: { postId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const instagramWindow = window as InstagramWindow;
    if (instagramWindow.instgrm?.Embeds?.process) {
      instagramWindow.instgrm.Embeds.process();
    }
  }, [postId]);

  return (
    <div className='mx-auto my-8 flex max-w-full justify-center' ref={containerRef}>
      <blockquote
        className='instagram-media min-w-fit max-w-xl'
        data-instgrm-captioned
        data-instgrm-permalink={`https://www.instagram.com/p/${postId}`}
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
    </div>
  );
}
