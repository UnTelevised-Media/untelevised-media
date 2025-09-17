/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef, useState } from 'react';
import { adsenseManager } from '@/lib/ads/adsenseInit';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function LargeAdCard({
  googleAdsenseId: _googleAdsenseId,
}: {
  googleAdsenseId: string;
}) {
  const adRef = useRef<HTMLModElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !adRef.current) {
      return;
    }

    const loadAd = async () => {
      try {
        // Small delay to ensure DOM is ready
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!adRef.current) {
          return;
        }

        const success = await adsenseManager.pushAd(adRef.current);
        if (success) {
          setIsLoaded(true);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error('AdSense error:', error);
        setHasError(true);
      }
    };

    loadAd();
  }, [isClient]);

  // Don't render anything on server side to prevent hydration issues
  if (!isClient) {
    return (
      <div className='ad-container'>
        <div className='flex h-64 items-center justify-center rounded bg-slate-50 dark:bg-slate-900'>
          <div className='text-sm text-slate-400'>Loading advertisement...</div>
        </div>
      </div>
    );
  }

  if (hasError && !adsenseManager.isDevelopmentMode()) {
    return null; // Don't show anything if there's an error in production
  }

  return (
    <div className='flex h-full w-full'>
      <ins
        ref={adRef}
        className='adsbygoogle'
        style={{
          display: 'block',
          minHeight: isLoaded ? 'auto' : '250px',
          backgroundColor: isLoaded ? 'transparent' : '#f8f9fa',
        }}
        data-ad-client='ca-pub-7412827340538951'
        data-ad-slot='9662364496'
        data-ad-format='auto'
        data-full-width-responsive='true'
      />
      {!isLoaded && !hasError && (
        <div className='flex h-64 items-center justify-center rounded bg-slate-50 dark:bg-slate-900'>
          <div className='text-sm text-slate-400'>Loading advertisement...</div>
        </div>
      )}
    </div>
  );
}
