/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef, useState } from 'react';
import AD_CONFIG from '@/lib/ads/adConfig';
import { adsenseManager } from '@/lib/ads/adsenseInit';

interface BannerAdProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showLabel?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadAd = async () => {
      try {
        // Wait for the configured delay
        await new Promise((resolve) => setTimeout(resolve, AD_CONFIG.PERFORMANCE.LOAD_DELAY));

        if (!adRef.current) {
          return;
        }

        const success = await adsenseManager.pushAd(adRef.current);
        if (success) {
          setIsLoaded(true);
        } else {
          throw new Error('Failed to load ad');
        }
      } catch (error) {
        console.error('AdSense error:', error);
        setHasError(true);
      }
    };

    if (typeof window !== 'undefined') {
      loadAd();
    }
  }, []);

  if (hasError) {
    return null; // Don't show anything if there's an error
  }

  return (
    <div className={`ad-container ${className}`} style={style}>
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
