'use client';

import { useConsentCheck } from '@/hooks/googleAdSense/useConsent';
import GoogleAdSense from './GoogleAdSense';

interface ConsentAwareGoogleAdSenseProps {
  googleAdsenseId: string;
}

function ConsentAwareGoogleAdSense({ googleAdsenseId }: ConsentAwareGoogleAdSenseProps) {
  const { canUseMarketing, hasConsent } = useConsentCheck();
  const isDevelopment = process.env.NODE_ENV === 'development';

  const shouldLoadScript = isDevelopment || (hasConsent && canUseMarketing);

  const handleScriptLoad = () => {
    
    if (typeof window !== 'undefined' && window.gtag && hasConsent && canUseMarketing) {
      setTimeout(() => {
        window.gtag?.('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        });
        
      }, 100);
    }
  };

  const handleScriptError = (error: Error) => {
    console.warn('[AdSense] Script load error (ad blocker or network):', error.message);
  };

  // Marketing consent explicitly denied — don't load
  if (!isDevelopment && hasConsent && !canUseMarketing) {
    
    return null;
  }

  // Consent still pending (new visitor, banner not yet interacted with)
  if (!isDevelopment && !shouldLoadScript) {
    
    return null;
  }

  return (
    <GoogleAdSense
      publisherId={googleAdsenseId}
      onLoad={handleScriptLoad}
      onError={handleScriptError}
    />
  );
}

export default ConsentAwareGoogleAdSense;
