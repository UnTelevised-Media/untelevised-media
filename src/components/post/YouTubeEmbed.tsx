'use client';

import { useEffect, useRef, useState } from 'react';
import { getYoutubeVideoId } from '@/util/url/youtubeUtils';
import { AlertCircle } from 'lucide-react';

interface YouTubeEmbedProps {
  videoUrl: string;
  title?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function YouTubeEmbed({ videoUrl, title = 'Article video' }: YouTubeEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const videoId = getYoutubeVideoId(videoUrl);
    if (!videoId) {
      setError('Invalid video URL');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let apiReadyHandler: (() => void) | null = null;

    // Load YouTube IFrame API
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        if (isMounted) {
          initializePlayer(videoId);
        }
      } else {
        // Check if script already exists
        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
          const script = document.createElement('script');
          script.src = 'https://www.youtube.com/iframe_api';
          script.async = true;
          script.defer = true;
          document.body.appendChild(script);
        }

        // Set callback - use a more robust approach
        apiReadyHandler = () => {
          if (isMounted) {
            initializePlayer(videoId);
          }
        };

        if (window.onYouTubeIframeAPIReady) {
          // Preserve existing handler
          const existingHandler = window.onYouTubeIframeAPIReady;
          window.onYouTubeIframeAPIReady = () => {
            existingHandler();
            apiReadyHandler?.();
          };
        } else {
          window.onYouTubeIframeAPIReady = apiReadyHandler;
        }
      }
    };

    const initializePlayer = (id: string) => {
      if (!containerRef.current || !window.YT) return;

      try {
        // Clear any existing content
        containerRef.current.innerHTML = '';

        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '100%',
          width: '100%',
          videoId: id,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            fs: 1,
            showinfo: 0,
            iv_load_policy: 3,
          },
          events: {
            onReady: () => {
              if (isMounted) {
                setIsLoading(false);
              }
            },
            onError: (event: any) => {
              if (isMounted) {
                // Error codes:
                // 2 = Invalid param
                // 5 = HTML5 player error
                // 100 = Video not found
                // 101 = Video owner does not allow embedding
                // 150 = Same as 101
                const errorCodes: Record<number, string> = {
                  2: 'Invalid video parameter',
                  5: 'HTML5 player error',
                  100: 'Video not found',
                  101: 'Video owner does not allow embedding',
                  150: 'This video cannot be embedded',
                };
                const errorMsg =
                  errorCodes[event.data] || `Error loading video (code: ${event.data})`;
                setError(errorMsg);
                setIsLoading(false);
              }
            },
          },
        });
      } catch (e) {
        if (isMounted) {
          setError('Failed to initialize video player');
          setIsLoading(false);
        }
      }
    };

    loadYouTubeAPI();

    return () => {
      isMounted = false;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Silently ignore destroy errors
        }
      }
      playerRef.current = null;
    };
  }, [videoUrl]);

  if (error) {
    const videoId = getYoutubeVideoId(videoUrl);
    return (
      <div className='flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950'>
        <AlertCircle className='h-8 w-8 text-amber-600 dark:text-amber-400' />
        <div className='text-center'>
          <p className='font-semibold text-amber-900 dark:text-amber-100'>{error}</p>
          <p className='mt-1 text-sm text-amber-700 dark:text-amber-200'>
            This may be due to age restrictions or embedding limitations.
          </p>
        </div>
        {videoId && (
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target='_blank'
            rel='noopener noreferrer'
            className='mt-2 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800'
          >
            Watch on YouTube →
          </a>
        )}
      </div>
    );
  }

  return (
    <div className='relative w-full'>
      <div
        ref={containerRef}
        className='aspect-video w-full'
        style={{
          backgroundColor: '#000',
        }}
      />
      {isLoading && (
        <div className='absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-slate-400 border-t-white' />
        </div>
      )}
    </div>
  );
}
