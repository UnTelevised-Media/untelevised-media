'use client';
import { useEffect, useRef, useState } from 'react';
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
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const tiktokWindow = window as TikTokWindow;
    if (tiktokWindow.tiktok?.embed?.lib?.render) {
      try {
        tiktokWindow.tiktok.embed.lib.render(containerRef.current);
      } catch (error) {
        console.error('TikTok embed error:', error);
        setRenderError(true);
      }
    } else {
      // Script not loaded yet, wait a bit and retry
      const timeout = setTimeout(() => {
        try {
          const tiktok = (window as TikTokWindow).tiktok;
          if (tiktok?.embed?.lib?.render) {
            tiktok.embed.lib.render(containerRef.current!);
          }
        } catch (error) {
          console.error('TikTok embed deferred error:', error);
          setRenderError(true);
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [videoUrl]);

  // Extract video ID from URL: https://www.tiktok.com/@username/video/VIDEO_ID
  const videoId = videoUrl.match(/\/video\/(\d+)/)?.[1] ?? '';
  // Extract username from URL
  const username = videoUrl.match(/@([^/]+)/)?.[1] ?? '';

  if (renderError) {
    return (
      <div className='mx-auto my-8 flex max-w-full justify-center'>
        <div className='flex max-w-md flex-col items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950'>
          <p className='text-sm text-slate-700 dark:text-slate-300'>
            Unable to load TikTok video. You can view it directly:
          </p>
          <Link
            href={videoUrl.replace(/\/$/, '')}
            target='_blank'
            rel='noopener noreferrer'
            className='text-untele hover:text-red-700'
          >
            View on TikTok ↗
          </Link>
        </div>
      </div>
    );
  }

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
