/* eslint-disable react/function-component-definition */
'use client';

import Script from 'next/script';
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
      window.adsbygoogle = window.adsbygoogle || [];

      // Check if script is already loaded
      if (window.adsenseLoaded) {
        setScriptLoaded(true);
        onLoad?.();
      }
    }
  }, [onLoad]);

  const handleScriptLoad = () => {
    console.log('AdSense: Script loaded successfully');
    setScriptLoaded(true);

    if (typeof window !== 'undefined') {
      window.adsenseLoaded = true;
      window.adsenseScriptError = false;

      // Ensure adsbygoogle array is available
      window.adsbygoogle = window.adsbygoogle || [];
    }

    onLoad?.();
  };

  const handleScriptError = () => {
    const error = new Error('Failed to load Google AdSense script');
    console.error('AdSense: Script loading failed', error);
    setScriptError(error);

    if (typeof window !== 'undefined') {
      window.adsenseScriptError = true;
    }

    onError?.(error);
  };

  // Don't render on server side
  if (!isClient) {
    return null;
  }

  // Don't render script if there's an error or if already loaded
  if (scriptError || (typeof window !== 'undefined' && window.adsenseLoaded)) {
    return null;
  }

  return (
    <Script
      id='google-adsense'
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      strategy='afterInteractive'
      crossOrigin='anonymous'
      onLoad={handleScriptLoad}
      onError={handleScriptError}
    />
  );
}
