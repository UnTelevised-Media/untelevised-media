/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`ad-container my-6 ${className}`} style={style}>
      <div className="mb-2 text-xs text-slate-500 dark:text-slate-400 text-center">
        Advertisement
      </div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style,
        }}
        data-ad-format="fluid"
        data-ad-layout-key={layoutKey}
        data-ad-client="ca-pub-7412827340538951"
        data-ad-slot={slot}
      />
    </div>
  );
}
