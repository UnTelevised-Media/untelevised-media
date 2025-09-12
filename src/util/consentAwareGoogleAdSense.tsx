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

    // Only initialize when we have proper consent OR in development mode
    // Prevent double initialization by checking if already initialized or in fallback mode
    const shouldInitialize = (hasConsent && canUseMarketing) || isDevelopment;
    const alreadyHandled = adsenseManager.isInitialized() || adsenseManager.isInFallbackMode();

    if (shouldInitialize && !alreadyHandled) {
      // eslint-disable-next-line no-console
      console.log('ConsentAwareGoogleAdSense: Initializing AdSense...', {
        hasConsent,
        canUseMarketing,
        isDevelopment,
        alreadyHandled,
      });

      // Add a small delay to prevent race conditions
      const initTimeout = setTimeout(() => {
        adsenseManager
          .initialize()
          .then((success) => {
            if (success) {
              // eslint-disable-next-line no-console
              console.log('ConsentAwareGoogleAdSense: AdSense initialized successfully');

              // Initialize Google consent mode only if we have real consent
              if (typeof window !== 'undefined' && window.gtag && hasConsent && canUseMarketing) {
                window.gtag('consent', 'update', {
                  ad_storage: 'granted',
                  ad_user_data: 'granted',
                  ad_personalization: 'granted',
                });
              }
            } else {
              // Check if we're in fallback mode
              if (adsenseManager.isInFallbackMode()) {
                console.info('ConsentAwareGoogleAdSense: Running in fallback mode (development)');
              } else if (adsenseManager.isLikelyBlocked()) {
                console.warn('ConsentAwareGoogleAdSense: AdSense likely blocked by ad blocker');
                if (isDevelopment) {
                  console.info(
                    'ConsentAwareGoogleAdSense: This is expected in development with ad blockers'
                  );
                }
              } else {
                console.error('ConsentAwareGoogleAdSense: Failed to initialize AdSense');
              }
            }
          })
          .catch((error) => {
            // More specific error handling
            if (error.message.includes('blocked')) {
              console.warn(
                'ConsentAwareGoogleAdSense: AdSense blocked by ad blocker or network filter'
              );
              if (isDevelopment) {
                console.info(
                  'ConsentAwareGoogleAdSense: Consider disabling ad blocker for development'
                );
              }
            } else {
              console.error('ConsentAwareGoogleAdSense: AdSense initialization error:', error);
            }
          });
      }, 200); // Slightly longer delay to ensure consent state is stable

      return () => clearTimeout(initTimeout);
    } else if (!shouldInitialize) {
      // eslint-disable-next-line no-console
      console.log('ConsentAwareGoogleAdSense: Waiting for consent...', {
        hasConsent,
        canUseMarketing,
        isDevelopment,
      });
    } else {
      // eslint-disable-next-line no-console
      console.log('ConsentAwareGoogleAdSense: Already handled, skipping initialization', {
        hasConsent,
        canUseMarketing,
        isDevelopment,
        alreadyHandled,
      });
    }
  }, [hasConsent, canUseMarketing]);

  // Don't render anything - the AdSense manager handles script loading
  return null;
};

export default ConsentAwareGoogleAdSense;
