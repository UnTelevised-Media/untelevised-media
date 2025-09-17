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

  // Only load AdSense script when we have proper consent OR in development mode
  const shouldLoadScript = (hasConsent && canUseMarketing) || isDevelopment;

  const handleScriptLoad = () => {
    console.log('ConsentAwareGoogleAdSense: AdSense script loaded successfully');

    // Initialize Google consent mode only if we have real consent
    if (typeof window !== 'undefined' && window.gtag && hasConsent && canUseMarketing) {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
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

  if (!shouldLoadScript) {
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
