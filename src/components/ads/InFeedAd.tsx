/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef, useState } from 'react';
import { adsenseManager } from '@/lib/ads/adsenseInit';
import AD_CONFIG from '@/lib/ads/adConfig';

interface InFeedAdProps {
  slot: string;
  className?: string;
  style?: React.CSSProperties;
  layoutKey?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function InFeedAd({
  slot,
  className = '',
  style = {},
  layoutKey = '-6t+ed+2i-1n-4w',
}: InFeedAdProps) {
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
        if (!adRef.current) {
          return;
        }

        const success = await adsenseManager.pushAd(adRef.current);
        if (success) {
          // Set loaded immediately - let AdSense handle the rest
          setIsLoaded(true);

          // Monitor for ad status changes
          const observer = new MutationObserver(() => {
            if (adRef.current) {
              const status = adRef.current.getAttribute('data-ad-status');
              if (status === 'unfilled') {
                console.log('AdSense: Ad unfilled, hiding component');
                setHasError(true);
                observer.disconnect();
              } else if (status === 'filled') {
                console.log('AdSense: Ad filled successfully');
                observer.disconnect();
              }
            }
          });

          observer.observe(adRef.current, {
            attributes: true,
            attributeFilter: ['data-ad-status'],
          });

          // Cleanup observer after 10 seconds
          setTimeout(() => observer.disconnect(), 10000);
        } else {
          throw new Error('Failed to load ad');
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
      <div className={`ad-container my-6 ${className}`} style={style}>
        <div className='mb-2 text-center text-xs text-slate-500 dark:text-slate-400'>
          Advertisement
        </div>
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
    <div className={`ad-container my-6 ${className}`} style={style}>
      <div className='mb-2 text-center text-xs text-slate-500 dark:text-slate-400'>
        Advertisement
      </div>
      <ins
        ref={adRef}
        className='adsbygoogle'
        style={{
          display: 'block',
          minHeight: isLoaded ? 'auto' : '250px',
          backgroundColor: isLoaded ? 'transparent' : '#f8f9fa',
          ...style,
        }}
        data-ad-format='fluid'
        data-ad-layout-key={layoutKey}
        data-ad-client={AD_CONFIG.PUBLISHER_ID}
        data-ad-slot={slot}
      />
      {!isLoaded && !hasError && (
        <div className='flex h-64 items-center justify-center rounded bg-slate-50 dark:bg-slate-900'>
          <div className='text-sm text-slate-400'>Loading advertisement...</div>
        </div>
      )}
    </div>
  );
}
