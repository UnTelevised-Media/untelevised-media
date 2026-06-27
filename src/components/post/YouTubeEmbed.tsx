'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Play, AlertCircle } from 'lucide-react';
import { getYoutubeVideoId } from '@/util/url/youtubeUtils';

interface YouTubeEmbedProps {
  videoUrl: string;
  title?: string;
}

const IFRAME_TIMEOUT = 8000; // 8 seconds

export default function YouTubeEmbed({ videoUrl, title = 'Article video' }: YouTubeEmbedProps) {
  const [showFallback, setShowFallback] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const videoId = getYoutubeVideoId(videoUrl);

  // Timeout fallback: if iframe doesn't load within IFRAME_TIMEOUT, show thumbnail
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (!iframeLoaded) {
        setShowFallback(true);
      }
    }, IFRAME_TIMEOUT);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [iframeLoaded]);

  if (!videoId) {
    return (
      <div className='flex items-center justify-center gap-3 rounded-xl border-2 border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950'>
        <AlertCircle className='h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400' />
        <div>
          <p className='font-semibold text-amber-900 dark:text-amber-100'>Invalid video URL</p>
          <p className='text-sm text-amber-700 dark:text-amber-200'>
            Unable to parse the YouTube video link.
          </p>
        </div>
      </div>
    );
  }

  // Fallback: Show thumbnail with play button
  if (showFallback) {
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return (
      <a
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target='_blank'
        rel='noopener noreferrer'
        className='group relative block aspect-video w-full overflow-hidden rounded-lg bg-black'
      >
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className='object-cover'
          sizes='(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 100vw'
        />
        {/* Dark overlay on hover */}
        <div className='absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30' />

        {/* Play button */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-red-600 shadow-lg transition-transform group-hover:scale-110'>
            <Play className='h-8 w-8 fill-white text-white' />
          </div>
        </div>

        {/* Badge */}
        <div className='absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-semibold text-white'>
          <span>Watch on YouTube</span>
        </div>
      </a>
    );
  }

  // Hybrid: Try embedding, fallback to thumbnail if it fails
  return (
    <div className='relative aspect-video w-full overflow-hidden bg-black'>
      {!iframeLoaded && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/80'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-slate-600 border-t-white' />
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&fs=1`}
        title={title}
        className={`h-full w-full transition-opacity duration-300 ${
          iframeLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen'
        sandbox='allow-same-origin allow-scripts allow-presentation allow-popups allow-popups-to-escape-sandbox'
        onLoad={() => setIframeLoaded(true)}
        onError={() => setShowFallback(true)}
      />
    </div>
  );
}
