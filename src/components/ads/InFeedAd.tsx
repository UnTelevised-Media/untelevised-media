/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef, useState } from 'react';
import { adsenseManager } from '@/lib/ads/adsenseInit';
import { AD_CONFIG } from '@/lib/ads/adConfig';
import { useConsentCheck } from '@/lib/consent/context';

interface InFeedAdProps {
  slot: string;
  className?: string;
  style?: React.CSSProperties;
  layoutKey?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { canUseMarketing, hasConsent } = useConsentCheck();
  const isDev = adsenseManager.isDevelopmentMode();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current) return;
    if (!isDev && (!hasConsent || !canUseMarketing)) return;

    const loadAd = async () => {
      try {
        if (!adRef.current) return;

        const success = await adsenseManager.pushAd(adRef.current);
        if (success) {
          setIsLoaded(true);

          // Monitor for ad fill status via MutationObserver
          const mutationObserver = new MutationObserver(() => {
            if (adRef.current) {
              const status = adRef.current.getAttribute('data-ad-status');
              if (status === 'unfilled') {
                if (process.env.NODE_ENV === 'development') {
                  // eslint-disable-next-line no-console
                  console.log('AdSense: Ad unfilled, hiding component');
                }
                setHasError(true);
                mutationObserver.disconnect();
              } else if (status === 'filled') {
                if (process.env.NODE_ENV === 'development') {
                  // eslint-disable-next-line no-console
                  console.log('AdSense: Ad filled successfully');
                }
                mutationObserver.disconnect();
              }
            }
          });

          mutationObserver.observe(adRef.current, {
            attributes: true,
            attributeFilter: ['data-ad-status'],
          });

          setTimeout(() => mutationObserver.disconnect(), 10000);
        } else {
          throw new Error('Failed to load ad');
        }
      } catch (error) {
        console.error('AdSense error:', error);
        setHasError(true);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect();
          loadAd();
        }
      },
      { rootMargin: AD_CONFIG.PERFORMANCE.LAZY_LOAD_MARGIN }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isClient, isDev, hasConsent, canUseMarketing]);

  if (!isClient) {
    return (
      <div ref={containerRef} className={`ad-container my-6 ${className}`} style={style}>
        <div className='mb-2 text-center text-xs text-slate-500 dark:text-slate-400'>
          Advertisement
        </div>
        <div className='flex h-64 items-center justify-center rounded bg-slate-50 dark:bg-slate-900'>
          <div className='text-sm text-slate-400'>Loading advertisement...</div>
        </div>
      </div>
    );
  }

  if (hasError && !isDev) {
    return null;
  }

  return (
    <div ref={containerRef} className={`ad-container my-6 ${className}`} style={style}>
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
