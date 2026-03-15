/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef, useState } from 'react';
import { AD_CONFIG } from '@/lib/ads/adConfig';
import { adsenseManager } from '@/lib/ads/adsenseInit';
import { useConsentCheck } from '@/lib/consent/context';

interface BannerAdProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showLabel?: boolean;
}

export default function BannerAd({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  style = {},
  showLabel = true,
}: BannerAdProps) {
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
    // In dev mode always show placeholders; in production require marketing consent
    if (!isDev && (!hasConsent || !canUseMarketing)) return;

    const loadAd = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, AD_CONFIG.PERFORMANCE.LOAD_DELAY));
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

  if (!isClient) {
    return (
      <div ref={containerRef} className={`ad-container ${className}`} style={style}>
        {showLabel && AD_CONFIG.INTEGRATION.showAdLabel && (
          <div className='mb-2 text-center text-xs text-slate-500 dark:text-slate-400'>
            Advertisement
          </div>
        )}
        <div className='flex h-24 items-center justify-center rounded bg-slate-50 dark:bg-slate-900'>
          <div className='text-sm text-slate-400'>Loading advertisement...</div>
        </div>
      </div>
    );
  }

  if (hasError && !isDev) {
    return null;
  }

  return (
    <div ref={containerRef} className={`ad-container ${className}`} style={style}>
      {showLabel && AD_CONFIG.INTEGRATION.showAdLabel && (
        <div className='mb-2 text-center text-xs text-slate-500 dark:text-slate-400'>
          Advertisement
        </div>
      )}
      <ins
        ref={adRef}
        className='adsbygoogle'
        style={{
          display: 'block',
          textAlign: 'center',
          minHeight: isLoaded ? 'auto' : '90px',
          backgroundColor: isLoaded ? 'transparent' : '#f8f9fa',
          ...style,
        }}
        data-ad-client={AD_CONFIG.PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
      {!isLoaded && !hasError && (
        <div className='flex h-24 items-center justify-center rounded bg-slate-50 dark:bg-slate-900'>
          <div className='text-sm text-slate-400'>Loading advertisement...</div>
        </div>
      )}
    </div>
  );
}
