// src/util/consentAwareGoogleAdSense.tsx
'use client';

import Script from 'next/script';
import { useConsentCheck } from '@/lib/consent/context';

interface ConsentAwareGoogleAdSenseProps {
  googleAdsenseId: string;
}

const ConsentAwareGoogleAdSense = ({ googleAdsenseId }: ConsentAwareGoogleAdSenseProps) => {
  const { canUseMarketing, hasConsent } = useConsentCheck();

  // Don't load AdSense if consent is pending or marketing cookies are denied
  if (!hasConsent || !canUseMarketing) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdsenseId}`}
      strategy='afterInteractive'
      crossOrigin='anonymous'
      onLoad={() => {
        // Initialize Google consent mode
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('consent', 'update', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
          });
        }
      }}
    />
  );
};

export default ConsentAwareGoogleAdSense;
