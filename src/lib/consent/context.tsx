// src/lib/consent/context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ConsentContextType, ConsentPreferences, ConsentStatus } from './types';
import { consentStorage } from './storage';

const defaultPreferences: ConsentPreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

const ConsentContext = createContext<ConsentContextType | null>(null);

interface ConsentProviderProps {
  children: React.ReactNode;
}

const ConsentProvider = ({ children }: ConsentProviderProps) => {
  const [preferences, setPreferences] = useState<ConsentPreferences>(defaultPreferences);
  const [status, setStatus] = useState<ConsentStatus>('pending');
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize consent state
  useEffect(() => {
    const initializeConsent = async () => {
      try {
        const existingConsent = consentStorage.loadConsent();

        if (existingConsent) {
          setPreferences(existingConsent.preferences);
          setStatus(getConsentStatus(existingConsent.preferences));
          setShowBanner(false);
        } else {
          // No existing consent - show banner
          setShowBanner(true);
          setStatus('pending');
        }
      } catch (error) {
        console.error('Failed to initialize consent:', error);
        setShowBanner(true);
        setStatus('pending');
      } finally {
        setIsLoading(false);
      }
    };

    initializeConsent();
  }, []);

  // Determine consent status based on preferences
  const getConsentStatus = (prefs: ConsentPreferences): ConsentStatus => {
    const nonEssentialPrefs = [prefs.analytics, prefs.marketing, prefs.preferences];
    const grantedCount = nonEssentialPrefs.filter(Boolean).length;

    if (grantedCount === 0) {
      return 'denied';
    }
    if (grantedCount === nonEssentialPrefs.length) {
      return 'granted';
    }
    return 'partial';
  };

  // Update preferences
  const updatePreferences = useCallback(
    async (newPreferences: Partial<ConsentPreferences>) => {
      const updatedPreferences = {
        ...preferences,
        ...newPreferences,
        essential: true, // Always true
      };

      setPreferences(updatedPreferences);
      setStatus(getConsentStatus(updatedPreferences));

      try {
        await consentStorage.saveConsent(updatedPreferences);
      } catch (error) {
        console.error('Failed to save consent preferences:', error);
      }
    },
    [preferences]
  );

  // Accept all cookies
  const acceptAll = useCallback(async () => {
    const allAccepted: ConsentPreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };

    setPreferences(allAccepted);
    setStatus('granted');
    setShowBanner(false);

    try {
      // saveConsent calls gtag('consent', 'update') — no page reload needed.
      // Google Consent Mode v2 handles dynamic consent updates without reload.
      await consentStorage.saveConsent(allAccepted);
    } catch (error) {
      console.error('Failed to save consent preferences:', error);
    }
  }, []);

  // Reject all non-essential cookies
  const rejectAll = useCallback(async () => {
    const onlyEssential: ConsentPreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };

    setPreferences(onlyEssential);
    setStatus('denied');
    setShowBanner(false);

    try {
      await consentStorage.saveConsent(onlyEssential);
    } catch (error) {
      console.error('Failed to save consent preferences:', error);
    }
  }, []);

  // Show settings (for customization)
  const showSettings = useCallback(() => {
    setShowBanner(true);
  }, []);

  // Hide banner
  const hideBanner = useCallback(() => {
    setShowBanner(false);
  }, []);

  const contextValue: ConsentContextType = {
    preferences,
    status,
    showBanner,
    updatePreferences,
    acceptAll,
    rejectAll,
    showSettings,
    hideBanner,
    isLoading,
  };

  return <ConsentContext.Provider value={contextValue}>{children}</ConsentContext.Provider>;
};

export { ConsentProvider };

export function useConsent(): ConsentContextType {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
}

// Hook for checking specific consent
export function useConsentCheck() {
  const { preferences, status } = useConsent();

  return {
    canUseAnalytics: preferences.analytics && status !== 'pending',
    canUseMarketing: preferences.marketing && status !== 'pending',
    canUsePreferences: preferences.preferences && status !== 'pending',
    hasConsent: status !== 'pending',
    isFullyConsented: status === 'granted',
  };
}

// Hook for conditional script loading
export function useConditionalScript(
  src: string,
  consentType: keyof ConsentPreferences,
  options?: {
    async?: boolean;
    defer?: boolean;
    onLoad?: () => void;
    onError?: () => void;
  }
) {
  const { preferences, status } = useConsent();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status === 'pending' || !preferences[consentType] || loaded) {
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = options?.async ?? true;
    script.defer = options?.defer ?? false;

    script.onload = () => {
      setLoaded(true);
      options?.onLoad?.();
    };

    script.onerror = () => {
      options?.onError?.();
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [src, consentType, preferences, status, loaded, options]);

  return loaded;
}
