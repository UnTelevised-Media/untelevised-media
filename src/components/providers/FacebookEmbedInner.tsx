'use client';
import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    // After the Facebook SDK loads, parse XFBML to render the embed
    // This handles both initial load and dynamic embeds added to the page
    const fbWindow = window as FacebookWindow;
    if (fbWindow.FB?.XFBML?.parse) {
      fbWindow.FB.XFBML.parse();
    }
  }, [postUrl]);

  return (
    <div className='mx-auto my-8 flex max-w-full justify-center' ref={containerRef}>
      <div>
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
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          defer
          crossOrigin='anonymous'
          src='https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0'
        ></script>
      </div>
    </div>
  );
}
