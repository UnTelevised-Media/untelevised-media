/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef, useState } from 'react';
import { adsenseManager } from '@/lib/ads/adsenseInit';
import { AD_CONFIG } from '@/lib/ads/adConfig';
import { useConsentCheck } from '@/lib/consent/context';

interface SidebarAdProps {
  slot: string;
  className?: string;
  style?: React.CSSProperties;
  sticky?: boolean;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adsbygoogle: any[];
  }
}

export default function SidebarAd({
  slot,
  className = '',
  style = {},
  sticky = false,
}: SidebarAdProps) {
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
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (!adRef.current) return;
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

  const containerClasses = `ad-container ${sticky ? 'sticky top-24' : ''} ${className}`.trim();

  if (!isClient) {
    return (
      <div ref={containerRef} className={containerClasses} style={style}>
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
    <div ref={containerRef} className={containerClasses} style={style}>
      <div className='mb-2 text-center text-xs text-slate-500 dark:text-slate-400'>
        Advertisement
      </div>
      <ins
        ref={adRef}
        className='adsbygoogle'
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          minHeight: isLoaded ? 'auto' : '250px',
          backgroundColor: isLoaded ? 'transparent' : '#f8f9fa',
          ...style,
        }}
        data-ad-client={AD_CONFIG.PUBLISHER_ID}
        data-ad-slot={slot}
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
