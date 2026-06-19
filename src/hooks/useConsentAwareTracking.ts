'use client';

import * as Sentry from '@sentry/nextjs';
import { useConsentCheck } from './useConsent';

export function useConsentAwareTracking() {
  const { canUseAnalytics, canUseMarketing } = useConsentCheck();

  const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
    // Sentry breadcrumb — no consent required, this is error-monitoring context
    Sentry.addBreadcrumb({
      category: 'user.action',
      message: eventName,
      data: parameters,
      level: 'info',
    });

    if (!canUseAnalytics || typeof window === 'undefined' || !window.gtag) {
      return;
    }

    window.gtag('event', eventName, {
      ...parameters,
      consent_analytics: canUseAnalytics,
      consent_marketing: canUseMarketing,
    });
  };

  return {
    trackEvent,
    canTrack: canUseAnalytics,
    canUseMarketing,
  };
}
