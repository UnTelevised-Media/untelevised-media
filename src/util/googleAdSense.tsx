/* eslint-disable no-console */
'use client';

import Script from 'next/script';

interface GoogleAdSenseProps {
  publisherId: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
    adsenseLoaded?: boolean;
    adsenseScriptError?: boolean;
  }
}

export default function GoogleAdSense({ publisherId, onLoad, onError }: GoogleAdSenseProps) {
  if (!publisherId) {
    console.error('[AdSense] GoogleAdSense: publisherId is empty — set NEXT_PUBLIC_GAS_ID env var');
    return null;
  }

  return (
    <Script
      id="google-adsense"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
      onLoad={() => {
        window.adsenseLoaded = true;
        window.adsenseScriptError = false;
        console.debug('[AdSense] Script loaded OK — publisher:', publisherId);
        onLoad?.();
      }}
      onError={(e) => {
        window.adsenseScriptError = true;
        const error = new Error('AdSense script failed to load');
        console.warn('[AdSense] Script failed to load — likely an ad blocker, CSP block, or network error:', e);
        onError?.(error);
      }}
    />
  );
}
