/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef } from 'react';
import AD_CONFIG from '@/lib/ads/adConfig';

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

  useEffect(() => {
    // Delay ad loading for better performance
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }, AD_CONFIG.PERFORMANCE.LOAD_DELAY);

    return () => clearTimeout(timer);
  }, []);

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
          ...style,
        }}
        data-ad-client={AD_CONFIG.PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}
