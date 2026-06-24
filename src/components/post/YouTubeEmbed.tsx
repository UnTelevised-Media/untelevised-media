'use client';

import { useState } from 'react';
import { getYoutubeVideoId } from '@/util/url/youtubeUtils';
import { AlertCircle } from 'lucide-react';

interface YouTubeEmbedProps {
  videoUrl: string;
  title?: string;
}

export default function YouTubeEmbed({ videoUrl, title = 'Article video' }: YouTubeEmbedProps) {
  const [showFallback, setShowFallback] = useState(false);

  const videoId = getYoutubeVideoId(videoUrl);

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

  // If user explicitly wants fallback, show it
  if (showFallback) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950'>
        <AlertCircle className='h-8 w-8 text-amber-600 dark:text-amber-400' />
        <div className='text-center'>
          <p className='font-semibold text-amber-900 dark:text-amber-100'>
            Video cannot be embedded
          </p>
          <p className='mt-1 text-sm text-amber-700 dark:text-amber-200'>
            This may be due to age restrictions or embedding limitations.
          </p>
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target='_blank'
          rel='noopener noreferrer'
          className='mt-2 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800'
        >
          Watch on YouTube →
        </a>
      </div>
    );
  }

  return (
    <div className='aspect-video w-full overflow-hidden bg-black'>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&fs=1`}
        title={title}
        className='h-full w-full'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen'
        sandbox='allow-same-origin allow-scripts allow-presentation allow-popups allow-popups-to-escape-sandbox'
        onError={() => setShowFallback(true)}
      />
    </div>
  );
}
