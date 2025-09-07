// src/util/consentAwareGoogleAdSense.tsx
'use client';

import { useEffect } from 'react';
import { useConsentCheck } from '@/lib/consent/context';
import { adsenseManager } from '@/lib/ads/adsenseInit';

interface ConsentAwareGoogleAdSenseProps {
  googleAdsenseId: string;
}

const ConsentAwareGoogleAdSense = ({ googleAdsenseId }: ConsentAwareGoogleAdSenseProps) => {
  const { canUseMarketing, hasConsent } = useConsentCheck();

  useEffect(() => {
    // In development, bypass consent checks for easier testing
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Initialize AdSense when consent is granted OR in development
    if ((hasConsent && canUseMarketing) || isDevelopment) {
      // eslint-disable-next-line no-console
      console.log('ConsentAwareGoogleAdSense: Initializing AdSense...', {
        hasConsent,
        canUseMarketing,
        isDevelopment,
      });

      adsenseManager
        .initialize()
        .then((success) => {
          if (success) {
            // eslint-disable-next-line no-console
            console.log('ConsentAwareGoogleAdSense: AdSense initialized successfully');

            // Initialize Google consent mode
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('consent', 'update', {
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted',
              });
            }
          } else {
             
            console.error('ConsentAwareGoogleAdSense: Failed to initialize AdSense');
          }
        })
        .catch((error) => {
           
          console.error('ConsentAwareGoogleAdSense: AdSense initialization error:', error);
        });
    } else {
      // eslint-disable-next-line no-console
      console.log('ConsentAwareGoogleAdSense: Waiting for consent...', {
        hasConsent,
        canUseMarketing,
        isDevelopment,
      });
    }
  }, [hasConsent, canUseMarketing]);

  // Don't render anything - the AdSense manager handles script loading
  return null;
};

export default ConsentAwareGoogleAdSense;
