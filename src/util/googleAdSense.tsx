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
    adsbygoogle: any[];
    adsenseLoaded?: boolean;
    adsenseScriptError?: boolean;
  }
}

export default function GoogleAdSense({ publisherId, onLoad, onError }: GoogleAdSenseProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<Error | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Initialize adsbygoogle array immediately on client
    if (typeof window !== 'undefined') {
      // Force initialize the array
      if (!window.adsbygoogle || !Array.isArray(window.adsbygoogle)) {
        window.adsbygoogle = [];
        console.log('AdSense: Initialized adsbygoogle array');
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
        console.log('AdSense: Script already exists in DOM');
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
        console.log('AdSense: Script loaded successfully');
        setScriptLoaded(true);

        if (typeof window !== 'undefined') {
          window.adsenseLoaded = true;
          window.adsenseScriptError = false;

          // Ensure adsbygoogle array is available and properly initialized
          window.adsbygoogle = window.adsbygoogle || [];

          // Force initialization if needed
          setTimeout(() => {
            if (window.adsbygoogle && !Array.isArray(window.adsbygoogle)) {
              window.adsbygoogle = [];
            }
            console.log('AdSense: adsbygoogle array initialized:', !!window.adsbygoogle);
          }, 100);
        }

        onLoad?.();
      };

      script.onerror = () => {
        const error = new Error('Failed to load Google AdSense script');
        console.error('AdSense: Script loading failed', error);
        setScriptError(error);

        if (typeof window !== 'undefined') {
          window.adsenseScriptError = true;
        }

        onError?.(error);
      };

      // Add script to document head
      document.head.appendChild(script);

      // Cleanup function
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [publisherId, onLoad, onError]);

  // Don't render anything - script is loaded programmatically
  return null;
}
