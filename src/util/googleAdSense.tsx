/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useState } from 'react';

interface GoogleAdSenseProps {
  publisherId: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adsbygoogle: any[];
    adsenseLoaded?: boolean;
    adsenseScriptError?: boolean;
  }
}

export default function GoogleAdSense({ publisherId, onLoad, onError }: GoogleAdSenseProps) {
  const [, setScriptLoaded] = useState(false);
  const [, setScriptError] = useState<Error | null>(null);
  const [, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Initialize adsbygoogle array immediately on client
    if (typeof window !== 'undefined') {
      // Force initialize the array
      if (!window.adsbygoogle || !Array.isArray(window.adsbygoogle)) {
        window.adsbygoogle = [];
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('AdSense: Initialized adsbygoogle array');
        }
      }

      // Check if script is already loaded
      if (window.adsenseLoaded) {
        setScriptLoaded(true);
        onLoad?.();
        return;
      }

      // Check if script already exists in DOM
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
      if (existingScript) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('AdSense: Script already exists in DOM');
        }
        // Still ensure array is available
        window.adsbygoogle = window.adsbygoogle || [];
        return;
      }

      // Load script manually to avoid data-nscript attribute issue
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.id = 'google-adsense';

      script.onload = () => {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('AdSense: Script loaded successfully');
        }
        setScriptLoaded(true);

        if (typeof window !== 'undefined') {
          window.adsenseLoaded = true;
          window.adsenseScriptError = false;

          // Initialize adsbygoogle array immediately
          if (!window.adsbygoogle || !Array.isArray(window.adsbygoogle)) {
            window.adsbygoogle = [];
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.log('AdSense: Initialized adsbygoogle array');
            }
          }

          // Give Google's script a moment to take over the array
          setTimeout(() => {
            if (window.adsbygoogle && !Array.isArray(window.adsbygoogle)) {
              window.adsbygoogle = [];
            }
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.log('AdSense: Final array check completed');
            }
          }, 100);
        }

        onLoad?.();
      };

      script.onerror = () => {
        const error = new Error('Failed to load Google AdSense script');
        if (process.env.NODE_ENV === 'development') {
          console.error('AdSense: Script loading failed', error);
        }
        setScriptError(error);

        if (typeof window !== 'undefined') {
          window.adsenseScriptError = true;
        }

        onError?.(error);
      };

      // Add script to document head.
      // No cleanup return — the AdSense script is a persistent global resource
      // that must survive route changes. Removing it on unmount would tear down
      // the adsbygoogle array and break all ads until the script reloaded.
      document.head.appendChild(script);
    }
  }, [publisherId, onLoad, onError]);

  // Don't render anything - script is loaded programmatically
  return null;
}
