'use client';

import { createContext, useContext } from 'react';

export interface AdContextType {
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

export const AdContext = createContext<AdContextType | null>(null);

export const useAdContext = () => {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAdContext must be used within an AdManager');
  }
  return context;
};
