/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef, useState } from 'react';
import { adsenseManager } from '@/lib/ads/adsenseInit';
import AD_CONFIG from '@/lib/ads/adConfig';

interface RectangleAdProps {
  slot: string;
  width?: number;
  height?: number;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function RectangleAd({
  slot,
  width = 300,
  height = 250,
  responsive = true,
  className = '',
  style = {},
}: RectangleAdProps) {
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
      <div className={`ad-container ${className}`} style={style}>
        <div
          className='flex items-center justify-center rounded bg-slate-50 dark:bg-slate-900'
          style={{ height: `${height}px` }}
        >
          <div className='text-sm text-slate-400'>Loading advertisement...</div>
        </div>
      </div>
    );
  }

  if (hasError && !adsenseManager.isDevelopmentMode()) {
    return null; // Don't show anything if there's an error in production
  }

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className='adsbygoogle'
        style={{
          display: 'inline-block',
          width: responsive ? '100%' : `${width}px`,
          height: responsive ? 'auto' : `${height}px`,
          minHeight: isLoaded ? 'auto' : `${height}px`,
          backgroundColor: isLoaded ? 'transparent' : '#f8f9fa',
          ...style,
        }}
        data-ad-client={AD_CONFIG.PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={responsive ? 'auto' : 'rectangle'}
        data-full-width-responsive={responsive.toString()}
      />
      {!isLoaded && !hasError && (
        <div
          className='flex items-center justify-center rounded bg-slate-50 dark:bg-slate-900'
          style={{ height: `${height}px` }}
        >
          <div className='text-sm text-slate-400'>Loading advertisement...</div>
        </div>
      )}
    </div>
  );
}
