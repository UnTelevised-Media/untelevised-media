/* eslint-disable react/function-component-definition */
'use client';

import { useEffect, useState, useRef, createContext, useContext } from 'react';
import { AD_CONFIG } from '@/lib/ads/adConfig';
import { useConsentCheck } from '@/lib/consent/context';

interface AdManagerProps {
  children: React.ReactNode;
  maxAdsPerPage?: number;
  respectUserPreferences?: boolean;
}

export default function AdManager({
  children,
  maxAdsPerPage,
  respectUserPreferences = true,
}: AdManagerProps) {
  const [adsLoaded, setAdsLoaded] = useState(0);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [userPreferences, setUserPreferences] = useState({
    doNotTrack: false,
    reducedMotion: false,
  });
  const adCountRef = useRef(0);
  const { canUseMarketing, hasConsent } = useConsentCheck();

  useEffect(() => {
    // Check user preferences
    if (respectUserPreferences) {
      const doNotTrack =
        navigator.doNotTrack === '1' ||
        (window as unknown as { doNotTrack?: string }).doNotTrack === '1' ||
        (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack === '1';

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      setUserPreferences({ doNotTrack, reducedMotion });
    }

    // Screen size detection
    const checkScreenSize = () => {
      if (window.innerWidth < AD_CONFIG.BREAKPOINTS.MOBILE) {
        setScreenSize('mobile');
      } else if (window.innerWidth < AD_CONFIG.BREAKPOINTS.TABLET) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [respectUserPreferences]);

  // Get maximum ads allowed for current screen size
  const getMaxAdsForScreen = () => {
    if (maxAdsPerPage) {
      return maxAdsPerPage;
    }

    switch (screenSize) {
      case 'mobile':
        return AD_CONFIG.VISIBILITY.MOBILE.maxAdsPerPage;
      case 'tablet':
        return AD_CONFIG.VISIBILITY.TABLET.maxAdsPerPage;
      case 'desktop':
        return AD_CONFIG.VISIBILITY.DESKTOP.maxAdsPerPage;
      default:
        return AD_CONFIG.PERFORMANCE.MAX_ADS_PER_PAGE;
    }
  };

  // Check if more ads can be loaded
  const canLoadMoreAds = () => {
    // Don't load ads if consent is pending or marketing cookies are denied
    if (!hasConsent || !canUseMarketing) {
      return false;
    }

    return adCountRef.current < getMaxAdsForScreen();
  };

  // Register an ad load
  const registerAdLoad = () => {
    if (canLoadMoreAds()) {
      adCountRef.current += 1;
      setAdsLoaded(adCountRef.current);
      return true;
    }
    return false;
  };

  // Provide context to child components
  const adContext = {
    canLoadMoreAds,
    registerAdLoad,
    screenSize,
    userPreferences,
    adsLoaded,
    maxAds: getMaxAdsForScreen(),
  };

  return (
    <div className='ad-manager'>
      {/* Pass context through React Context or props */}
      <AdContext.Provider value={adContext}>{children}</AdContext.Provider>
    </div>
  );
}

// Create React Context for ad management

interface AdContextType {
  canLoadMoreAds: () => boolean;
  registerAdLoad: () => boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop';
  userPreferences: {
    doNotTrack: boolean;
    reducedMotion: boolean;
  };
  adsLoaded: number;
  maxAds: number;
}

const AdContext = createContext<AdContextType | null>(null);

export const useAdContext = () => {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAdContext must be used within an AdManager');
  }
  return context;
};
