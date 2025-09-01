/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef } from 'react';

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
    <div className={`ad-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'inline-block',
          width: responsive ? '100%' : `${width}px`,
          height: responsive ? 'auto' : `${height}px`,
          ...style,
        }}
        data-ad-client="ca-pub-7412827340538951"
        data-ad-slot={slot}
        data-ad-format={responsive ? 'auto' : 'rectangle'}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}
