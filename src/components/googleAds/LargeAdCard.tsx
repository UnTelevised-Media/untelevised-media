/* eslint-disable no-console */
/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useRef, useState } from 'react';
import { AD_CONFIG } from '@/lib/ads/adConfig';
import { adsenseManager } from '@/lib/ads/adsenseInit';
import { useConsentCheck } from '@/lib/consent/context';

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

export default function LargeAdCard({
  slot = AD_CONFIG.AD_SLOTS.HOMEPAGE_BANNER,
}: {
  slot?: string;
  googleAdsenseId?: string;
}) {
  const adRef = useRef<HTMLModElement>(null);
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
    if (!isClient || !adRef.current) return;
    if (!isDev && (!hasConsent || !canUseMarketing)) {
      console.debug('[AdSense] LargeAdCard slot=%s: awaiting consent', slot);
      return;
    }
    if (pushed.current) return;
    pushed.current = true;

    const ins = adRef.current;
    adsenseManager.pushAd(ins).then((success) => {
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
        } else if (s === 'unfilled') {
          setAdStatus('unfilled');
          mo.disconnect();
        }
      });
      mo.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
      setTimeout(() => mo.disconnect(), 15_000);
    });
  }, [isClient, isDev, hasConsent, canUseMarketing, slot]);

  if (!isClient) return null;
  if ((adStatus === 'error' || adStatus === 'unfilled') && !isDev) return null;

  return (
    <div className='flex h-full w-full'>
      <ins
        ref={adRef}
        className='adsbygoogle'
        style={{ display: 'block', minHeight: '250px', width: '100%' }}
        data-ad-client={AD_CONFIG.PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format='auto'
        data-full-width-responsive='true'
      />
    </div>
  );
}
