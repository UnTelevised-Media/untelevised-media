'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface TikTokWindow extends Window {
  tiktok?: {
    embed: {
      lib?: {
        render: (element: HTMLElement) => void;
      };
    };
  };
}

export default function TikTokEmbedInner({ videoUrl }: { videoUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tiktokWindow = window as TikTokWindow;
    if (tiktokWindow.tiktok?.embed?.lib?.render && containerRef.current) {
      tiktokWindow.tiktok.embed.lib.render(containerRef.current);
    }
  }, [videoUrl]);

  // Extract video ID from URL: https://www.tiktok.com/@username/video/VIDEO_ID
  const videoId = videoUrl.match(/\/video\/(\d+)/)?.[1] ?? '';
  // Extract username from URL
  const username = videoUrl.match(/@([^/]+)/)?.[1] ?? '';

  return (
    <div className='mx-auto my-8 flex max-w-full justify-center' ref={containerRef}>
      <blockquote
        className='tiktok-embed'
        cite={videoUrl}
        data-video-id={videoId}
        style={{ maxWidth: '605px', minWidth: '325px' }}
      >
        <section>
          <Link
            href={videoUrl.replace(/\/$/, '')}
            target='_blank'
            rel='noopener noreferrer'
            className='text-untele hover:text-red-700'
          >
            {username ? `@${username}` : 'View this video on TikTok'}
          </Link>
        </section>
      </blockquote>
    </div>
  );
}
