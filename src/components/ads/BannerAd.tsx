/* eslint-disable no-console */
/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef, useState } from 'react';
import { AD_CONFIG } from '@/lib/ads/adConfig';
import { adsenseManager } from '@/lib/ads/adsenseInit';
import { useConsentCheck } from '@/lib/consent/context';

interface BannerAdProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showLabel?: boolean;
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
      console.debug('[AdSense] BannerAd slot=%s: waiting for consent (hasConsent=%s canUseMarketing=%s)', slot, hasConsent, canUseMarketing);
      return;
    }
    if (pushed.current) return; // already attempted

    const container = containerRef.current;
    const obs = new IntersectionObserver(
      async (entries) => {
        if (!entries[0]?.isIntersecting || pushed.current) return;
        obs.disconnect();
        pushed.current = true;

        const ins = adRef.current;
        if (!ins) {
          console.warn('[AdSense] BannerAd slot=%s: <ins> ref is null at push time', slot);
          setAdStatus('error');
          return;
        }

        const success = await adsenseManager.pushAd(ins);
        if (!success) {
          setAdStatus('error');
          return;
        }
        setAdStatus('pushed');

        // Watch for Google to set data-ad-status
        const mo = new MutationObserver(() => {
          const status = ins.getAttribute('data-ad-status');
          if (status === 'filled') {
            console.debug('[AdSense] BannerAd slot=%s: filled ✓', slot);
            setAdStatus('filled');
            mo.disconnect();
          } else if (status === 'unfilled') {
            console.warn('[AdSense] BannerAd slot=%s: unfilled — no ad available for this slot/context', slot);
            setAdStatus('unfilled');
            mo.disconnect();
          }
        });
        mo.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
        setTimeout(() => { mo.disconnect(); }, 15_000);
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
      {showLabel && AD_CONFIG.INTEGRATION.showAdLabel && (
        <div className='mb-2 text-center text-xs text-slate-500 dark:text-slate-400'>Advertisement</div>
      )}
      <ins
        ref={adRef}
        className='adsbygoogle'
        style={{ display: 'block', minHeight: '90px', width: '100%' }}
        data-ad-client={AD_CONFIG.PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
      {adStatus === 'idle' && (
        <div className='flex h-24 items-center justify-center rounded bg-slate-50 dark:bg-slate-900'>
          <div className='text-sm text-slate-400'>Loading advertisement...</div>
        </div>
      )}
    </div>
  );
}
