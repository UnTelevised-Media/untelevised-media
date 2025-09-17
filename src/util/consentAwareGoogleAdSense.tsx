// src/util/consentAwareGoogleAdSense.tsx
'use client';

import { useConsentCheck } from '@/lib/consent/context';
import GoogleAdSense from './googleAdSense';

interface ConsentAwareGoogleAdSenseProps {
  googleAdsenseId: string;
}

const ConsentAwareGoogleAdSense = ({ googleAdsenseId }: ConsentAwareGoogleAdSenseProps) => {
  const { canUseMarketing, hasConsent } = useConsentCheck();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // In development mode, always load the script regardless of consent
  // In production, only load when we have proper consent
  const shouldLoadScript = isDevelopment || (hasConsent && canUseMarketing);

  const handleScriptLoad = () => {
    console.log('ConsentAwareGoogleAdSense: AdSense script loaded successfully');

    // Initialize Google consent mode only if we have real consent
    if (typeof window !== 'undefined' && window.gtag && hasConsent && canUseMarketing) {
      // Small delay to ensure gtag is ready
      setTimeout(() => {
        if (window.gtag) {
          window.gtag('consent', 'update', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
          });
          console.log('ConsentAwareGoogleAdSense: Consent mode updated for ads');
        }
      }, 100);
    }
  };

  const handleScriptError = (error: Error) => {
    console.warn('ConsentAwareGoogleAdSense: AdSense script failed to load', error);

    // In development mode, this might be expected due to ad blockers
    if (isDevelopment) {
      console.info(
        'ConsentAwareGoogleAdSense: This is normal in development if you have an ad blocker'
      );
    }
  };

  // In production, don't load script if consent is explicitly denied
  if (!isDevelopment && hasConsent && !canUseMarketing) {
    console.log('ConsentAwareGoogleAdSense: Marketing consent denied, not loading AdSense');
    return null;
  }

  // In production, wait for consent to be determined before loading
  if (!isDevelopment && !shouldLoadScript) {
    console.log('ConsentAwareGoogleAdSense: Waiting for consent...', {
      hasConsent,
      canUseMarketing,
      isDevelopment,
    });
    return null;
  }

  return (
    <GoogleAdSense
      publisherId={googleAdsenseId}
      onLoad={handleScriptLoad}
      onError={handleScriptError}
    />
  );
};

export default ConsentAwareGoogleAdSense;
