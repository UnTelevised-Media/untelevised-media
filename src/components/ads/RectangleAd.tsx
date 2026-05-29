/* eslint-disable no-console */
/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef, useState } from 'react';
import { AD_CONFIG } from '@/lib/ads/adConfig';
import { adsenseManager } from '@/lib/ads/adsenseInit';
import { useConsentCheck } from '@/lib/consent/context';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const [adStatus, setAdStatus] = useState<'idle' | 'pushed' | 'filled' | 'unfilled' | 'error'>('idle');
  const [isClient, setIsClient] = useState(false);
  const { canUseMarketing, hasConsent } = useConsentCheck();
  const isDev = adsenseManager.isDevelopmentMode();

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current) return;
    if (!isDev && (!hasConsent || !canUseMarketing)) {
      console.debug('[AdSense] RectangleAd slot=%s: awaiting consent', slot);
      return;
    }
    if (pushed.current) return;

    const container = containerRef.current;
    const obs = new IntersectionObserver(
      async (entries) => {
        if (!entries[0]?.isIntersecting || pushed.current) return;
        obs.disconnect();
        pushed.current = true;

        const ins = adRef.current;
        if (!ins) { setAdStatus('error'); return; }

        const success = await adsenseManager.pushAd(ins);
        if (!success) { setAdStatus('error'); return; }
        setAdStatus('pushed');

        const mo = new MutationObserver(() => {
          const s = ins.getAttribute('data-ad-status');
          if (s === 'filled') { setAdStatus('filled'); mo.disconnect(); console.debug('[AdSense] RectangleAd slot=%s: filled ✓', slot); }
          else if (s === 'unfilled') { setAdStatus('unfilled'); mo.disconnect(); console.warn('[AdSense] RectangleAd slot=%s: unfilled', slot); }
        });
        mo.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
        setTimeout(() => mo.disconnect(), 15_000);
      },
      { rootMargin: AD_CONFIG.PERFORMANCE.LAZY_LOAD_MARGIN }
    );
    obs.observe(container);
    return () => obs.disconnect();
  }, [isClient, isDev, hasConsent, canUseMarketing, slot]);

  if (!isClient) return null;
  if ((adStatus === 'error' || adStatus === 'unfilled') && !isDev) return null;

  return (
    <div ref={containerRef} className={`ad-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className='adsbygoogle'
        style={{
          display: responsive ? 'block' : 'inline-block',
          width: responsive ? '100%' : `${width}px`,
          minHeight: `${height}px`,
        }}
        data-ad-client={AD_CONFIG.PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={responsive ? 'auto' : 'rectangle'}
        data-full-width-responsive={responsive.toString()}
      />
      {adStatus === 'idle' && (
        <div
          className='flex items-center justify-center rounded bg-slate-50 dark:bg-slate-900'
          style={{ minHeight: `${height}px` }}
        >
          <div className='text-sm text-slate-400'>Loading advertisement...</div>
        </div>
      )}
    </div>
  );
}
