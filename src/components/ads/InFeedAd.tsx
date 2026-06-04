/* eslint-disable no-console */
/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef, useState } from 'react';
import { AD_CONFIG } from '@/lib/ads/adConfig';
import { adsenseManager } from '@/lib/ads/adsenseInit';
import { useConsentCheck } from '@/lib/consent/context';

interface InFeedAdProps {
  slot: string;
  className?: string;
  style?: React.CSSProperties;
  layoutKey?: string;
}

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

export default function InFeedAd({
  slot,
  className = '',
  style = {},
  layoutKey = '-6t+ed+2i-1n-4w',
}: InFeedAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const [adStatus, setAdStatus] = useState<'idle' | 'pushed' | 'filled' | 'unfilled' | 'error'>(
    'idle'
  );
  const [isClient, setIsClient] = useState(false);
  const { canUseMarketing, hasConsent } = useConsentCheck();
  const isDev = adsenseManager.isDevelopmentMode();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current) return;
    if (!isDev && (!hasConsent || !canUseMarketing)) {
      console.debug('[AdSense] InFeedAd slot=%s: awaiting consent', slot);
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
        if (!ins) {
          setAdStatus('error');
          return;
        }

        const success = await adsenseManager.pushAd(ins);
        if (!success) {
          setAdStatus('error');
          return;
        }
        setAdStatus('pushed');

        const mo = new MutationObserver(() => {
          const s = ins.getAttribute('data-ad-status');
          if (s === 'filled') {
            setAdStatus('filled');
            mo.disconnect();
            console.debug('[AdSense] InFeedAd slot=%s: filled ✓', slot);
          } else if (s === 'unfilled') {
            setAdStatus('unfilled');
            mo.disconnect();
            console.warn('[AdSense] InFeedAd slot=%s: unfilled', slot);
          }
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
    <div ref={containerRef} className={`ad-container my-6 ${className}`} style={style}>
      <div className='mb-2 text-center text-xs text-slate-500 dark:text-slate-400'>
        Advertisement
      </div>
      <ins
        ref={adRef}
        className='adsbygoogle'
        style={{ display: 'block', minHeight: '250px' }}
        data-ad-format='fluid'
        data-ad-layout-key={layoutKey}
        data-ad-client={AD_CONFIG.PUBLISHER_ID}
        data-ad-slot={slot}
      />
      {adStatus === 'idle' && (
        <div className='flex h-64 items-center justify-center rounded bg-slate-50 dark:bg-slate-900'>
          <div className='text-sm text-slate-400'>Loading advertisement...</div>
        </div>
      )}
    </div>
  );
}
