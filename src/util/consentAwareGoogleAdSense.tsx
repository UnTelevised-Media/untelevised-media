/* eslint-disable no-console */
'use client';

import { useConsentCheck } from '@/lib/consent/context';
import GoogleAdSense from './googleAdSense';

interface ConsentAwareGoogleAdSenseProps {
  googleAdsenseId: string;
}

const ConsentAwareGoogleAdSense = ({ googleAdsenseId }: ConsentAwareGoogleAdSenseProps) => {
  const { canUseMarketing, hasConsent } = useConsentCheck();
  const isDevelopment = process.env.NODE_ENV === 'development';

  const shouldLoadScript = isDevelopment || (hasConsent && canUseMarketing);

  const handleScriptLoad = () => {
    console.debug('[AdSense] Script ready — consent granted, ads can serve');
    if (typeof window !== 'undefined' && window.gtag && hasConsent && canUseMarketing) {
      setTimeout(() => {
        window.gtag?.('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        });
        console.debug('[AdSense] Consent mode updated: ad_storage=granted');
      }, 100);
    }
  };

  const handleScriptError = (error: Error) => {
    console.warn('[AdSense] Script load error (ad blocker or network):', error.message);
  };

  // Marketing consent explicitly denied — don't load
  if (!isDevelopment && hasConsent && !canUseMarketing) {
    console.debug('[AdSense] Marketing consent denied — not loading AdSense script');
    return null;
  }

  // Consent still pending (new visitor, banner not yet interacted with)
  if (!isDevelopment && !shouldLoadScript) {
    console.debug('[AdSense] Consent pending — waiting before loading script. hasConsent=%s canUseMarketing=%s', hasConsent, canUseMarketing);
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
