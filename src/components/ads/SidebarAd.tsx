/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  const containerClasses = `
    ad-container 
    ${sticky ? 'sticky top-24' : ''} 
    ${className}
  `.trim();

  return (
    <div className={containerClasses} style={style}>
      <div className="mb-2 text-xs text-slate-500 dark:text-slate-400 text-center">
        Advertisement
      </div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          ...style,
        }}
        data-ad-client="ca-pub-7412827340538951"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
