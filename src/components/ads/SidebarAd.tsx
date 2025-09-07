/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef, useState } from 'react';
import { adsenseManager } from '@/lib/ads/adsenseInit';

interface SidebarAdProps {
  slot: string;
  className?: string;
  style?: React.CSSProperties;
  sticky?: boolean;
}

declare global {
  interface Window {
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

  const containerClasses = `
    ad-container
    ${sticky ? 'sticky top-24' : ''}
    ${className}
  `.trim();

  return (
    <div className={containerClasses} style={style}>
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
        data-ad-client='ca-pub-7412827340538951'
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
