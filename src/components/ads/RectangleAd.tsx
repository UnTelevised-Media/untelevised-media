/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef, useState } from 'react';
import { adsenseManager } from '@/lib/ads/adsenseInit';

interface RectangleAdProps {
  slot: string;
  width?: number;
  height?: number;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
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

  useEffect(() => {
    const loadAd = async () => {
      try {
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
      // Small delay to ensure DOM is ready
      const timer = setTimeout(loadAd, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  if (hasError) {
    return null; // Don't show anything if there's an error
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
        data-ad-client='ca-pub-7412827340538951'
        data-ad-slot={slot}
        data-ad-format={responsive ? 'auto' : 'rectangle'}
        data-full-width-responsive={responsive.toString()}
      />
      {!isLoaded && !hasError && (
        <div
          className="flex items-center justify-center rounded bg-slate-50 dark:bg-slate-900"
          style={{ height: `${height}px` }}
        >
          <div className='text-sm text-slate-400'>Loading advertisement...</div>
        </div>
      )}
    </div>
  );
}
