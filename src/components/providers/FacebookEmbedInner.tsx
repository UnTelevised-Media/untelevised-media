'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface FacebookWindow extends Window {
  FB?: {
    XFBML?: {
      parse: () => void;
    };
  };
}

export default function FacebookEmbedInner({ postUrl }: { postUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    const fbWindow = window as FacebookWindow;
    if (fbWindow.FB?.XFBML?.parse) {
      try {
        fbWindow.FB.XFBML.parse();
      } catch (error) {
        console.error('Facebook embed error:', error);
        setRenderError(true);
      }
    } else {
      // SDK not loaded yet, retry after a delay
      const timeout = setTimeout(() => {
        try {
          const fb = (window as FacebookWindow).FB;
          if (fb?.XFBML?.parse) {
            fb.XFBML.parse();
          }
        } catch (error) {
          console.error('Facebook embed deferred error:', error);
          setRenderError(true);
        }
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [postUrl]);

  if (renderError) {
    return (
      <div className='mx-auto my-8 flex max-w-full justify-center'>
        <div className='flex max-w-md flex-col items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950'>
          <p className='text-sm text-slate-700 dark:text-slate-300'>
            Unable to load Facebook post. You can view it directly:
          </p>
          <Link
            href={postUrl}
            className='text-untele hover:text-red-700'
            target='_blank'
            rel='noopener noreferrer'
          >
            View on Facebook ↗
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto my-8 flex max-w-full justify-center' ref={containerRef}>
      <div id='fb-root'></div>
      <div className='fb-post' data-href={postUrl} data-width='500' data-show-text='true'>
        <blockquote cite={postUrl} className='fb-xfbml-parse-ignore'>
          <Link
            href={postUrl}
            className='text-untele hover:text-red-700'
            target='_blank'
            rel='noopener noreferrer'
          >
            View this post on Facebook
          </Link>
        </blockquote>
      </div>
    </div>
  );
}
