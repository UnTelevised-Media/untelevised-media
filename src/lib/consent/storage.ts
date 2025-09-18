// src/lib/consent/storage.ts
'use client';

import {
  ConsentRecord,
  ConsentPreferences,
  AdBlockerStatus,
  PrivacySettings,
  CONSENT_STORAGE_KEY,
  ADBLOCKER_STORAGE_KEY,
  CONSENT_VERSION,
} from './types';

// Utility to safely access localStorage
const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
};

// Hash IP for privacy compliance (simplified version)
const hashIP = async (ip: string): Promise<string> => {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return 'unknown';
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${ip}privacy-salt`);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 16);
  } catch {
    return 'unknown';
  }
};

// Get user's IP (simplified - in production you'd use a service)
const getUserIP = async (): Promise<string> => {
  try {
    // In production, you'd call your backend or a service like ipapi.co
    return 'client-side-unknown';
  } catch {
    return 'unknown';
  }
};

export const consentStorage = {
  // Save consent preferences
  async saveConsent(preferences: ConsentPreferences): Promise<void> {
    const storage = getStorage();
    if (!storage) {
      return;
    }

    const userIP = await getUserIP();
    const ipHash = await hashIP(userIP);

    const record: ConsentRecord = {
      preferences,
      timestamp: Date.now(),
      version: CONSENT_VERSION,
      userAgent: navigator.userAgent,
      ipHash,
    };

    try {
      storage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));

      // Also send to analytics if consent given
      if (preferences.analytics && typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: preferences.analytics ? 'granted' : 'denied',
          ad_storage: preferences.marketing ? 'granted' : 'denied',
          ad_user_data: preferences.marketing ? 'granted' : 'denied',
          ad_personalization: preferences.marketing ? 'granted' : 'denied',
        });
      }
    } catch (error) {
      console.error('Failed to save consent preferences:', error);
    }
  },

  // Load consent preferences
  loadConsent(): ConsentRecord | null {
    const storage = getStorage();
    if (!storage) {
      return null;
    }

    try {
      const stored = storage.getItem(CONSENT_STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const record: ConsentRecord = JSON.parse(stored);

      // Check if consent is still valid (not older than 13 months)
      const thirteenMonths = 13 * 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - record.timestamp > thirteenMonths) {
        this.clearConsent();
        return null;
      }

      // Check if version is current
      if (record.version !== CONSENT_VERSION) {
        this.clearConsent();
        return null;
      }

      return record;
    } catch (error) {
      console.error('Failed to load consent preferences:', error);
      return null;
    }
  },

  // Clear consent preferences
  clearConsent(): void {
    const storage = getStorage();
    if (!storage) {
      return;
    }

    try {
      storage.removeItem(CONSENT_STORAGE_KEY);

      // Reset Google consent
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      }
    } catch (error) {
      console.error('Failed to clear consent preferences:', error);
    }
  },

  // Check if consent exists and is valid
  hasValidConsent(): boolean {
    return this.loadConsent() !== null;
  },
};

export const adBlockerStorage = {
  // Save ad blocker status
  saveStatus(status: AdBlockerStatus): void {
    const storage = getStorage();
    if (!storage) {
      return;
    }

    try {
      storage.setItem(ADBLOCKER_STORAGE_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('Failed to save ad blocker status:', error);
    }
  },

  // Load ad blocker status
  loadStatus(): AdBlockerStatus | null {
    const storage = getStorage();
    if (!storage) {
      return null;
    }

    try {
      const stored = storage.getItem(ADBLOCKER_STORAGE_KEY);
      if (!stored) {
        return null;
      }

      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load ad blocker status:', error);
      return null;
    }
  },

  // Clear ad blocker status
  clearStatus(): void {
    const storage = getStorage();
    if (!storage) {
      return;
    }

    try {
      storage.removeItem(ADBLOCKER_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear ad blocker status:', error);
    }
  },
};

// Privacy settings management
export const privacyStorage = {
  // Get all privacy settings
  getSettings(): PrivacySettings {
    const consent = consentStorage.loadConsent();
    const adBlocker = adBlockerStorage.loadStatus() ?? {
      detected: false,
      messageShown: false,
      messageDismissed: false,
      lastChecked: 0,
    };

    return {
      consent,
      adBlocker,
      doNotTrack: navigator.doNotTrack === '1',
      cookieBannerDismissed: consent !== null,
    };
  },

  // Export user data (GDPR Article 20)
  exportUserData(): string {
    const settings = this.getSettings();
    const exportData = {
      ...settings,
      exportedAt: new Date().toISOString(),
      version: CONSENT_VERSION,
    };

    return JSON.stringify(exportData, null, 2);
  },

  // Delete all user data (GDPR Article 17)
  deleteAllData(): void {
    consentStorage.clearConsent();
    adBlockerStorage.clearStatus();

    // Clear any other privacy-related data
    const storage = getStorage();
    if (!storage) {
      return;
    }

    const keysToRemove = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && (key.includes('privacy') || key.includes('consent') || key.includes('gdpr'))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      try {
        storage.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove ${key}:`, error);
      }
    });
  },
};

// Global gtag type declaration
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
  }
}
