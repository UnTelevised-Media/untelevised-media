// src/lib/consent/types.ts

export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  cookies: string[];
}

export interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface ConsentRecord {
  preferences: ConsentPreferences;
  timestamp: number;
  version: string;
  userAgent: string;
  ipHash?: string;
}

export interface AdBlockerStatus {
  detected: boolean;
  messageShown: boolean;
  messageDismissed: boolean;
  lastChecked: number;
}

export interface PrivacySettings {
  consent: ConsentRecord | null;
  adBlocker: AdBlockerStatus;
  doNotTrack: boolean;
  cookieBannerDismissed: boolean;
}

export type ConsentStatus = 'pending' | 'granted' | 'denied' | 'partial';

export interface ConsentContextType {
  preferences: ConsentPreferences;
  status: ConsentStatus;
  showBanner: boolean;
  updatePreferences: (preferences: Partial<ConsentPreferences>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  showSettings: () => void;
  hideBanner: () => void;
  isLoading: boolean;
}

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: 'essential',
    name: 'Essential Cookies',
    description:
      'These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you which amount to a request for services.',
    required: true,
    cookies: ['consent-preferences', 'theme-preference', 'session-id'],
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description:
      'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our content and user experience.',
    required: false,
    cookies: ['_ga', '_ga_*', '_gid', '_gat', 'vercel-analytics'],
  },
  {
    id: 'marketing',
    name: 'Marketing & Advertising Cookies',
    description:
      'These cookies are used to make advertising messages more relevant to you and your interests. They also perform functions like preventing the same ad from continuously reappearing.',
    required: false,
    cookies: ['googletag', '_gcl_*', 'ads-preferences', 'doubleclick'],
  },
  {
    id: 'preferences',
    name: 'Preference Cookies',
    description:
      'These cookies allow the website to remember choices you make and provide enhanced, more personal features. They may be set by us or by third party providers.',
    required: false,
    cookies: ['language-preference', 'region-preference', 'accessibility-settings'],
  },
];

export const CONSENT_VERSION = '1.0.0';
export const CONSENT_STORAGE_KEY = 'gdpr-consent';
export const ADBLOCKER_STORAGE_KEY = 'adblocker-status';
