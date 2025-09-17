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
  }
}

export default function GoogleAdSense({ publisherId, onLoad, onError }: GoogleAdSenseProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<Error | null>(null);

  useEffect(() => {
    // Initialize adsbygoogle array immediately
    if (typeof window !== 'undefined') {
      window.adsbygoogle = window.adsbygoogle || [];
    }
  }, []);

  const handleScriptLoad = () => {
    console.log('AdSense: Script loaded successfully');
    setScriptLoaded(true);

    if (typeof window !== 'undefined') {
      window.adsenseLoaded = true;
    }

    onLoad?.();
  };

  const handleScriptError = () => {
    const error = new Error('Failed to load Google AdSense script');
    console.error('AdSense: Script loading failed', error);
    setScriptError(error);
    onError?.(error);
  };

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
