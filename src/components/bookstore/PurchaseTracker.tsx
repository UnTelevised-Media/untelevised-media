'use client';
// Fires a GA4 'purchase' event once when a confirmed order loads.

import { useEffect, useRef } from 'react';
import { useConsentAwareTracking } from '@/components/analytics/ConsentAwareAnalytics';

interface Props {
  sessionId: string;
  total: number | null;
  currency?: string;
}

export default function PurchaseTracker({ sessionId, total, currency = 'USD' }: Props) {
  const { trackEvent } = useConsentAwareTracking();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || total == null) return;
    fired.current = true;
    trackEvent('purchase', {
      transaction_id: sessionId,
      value: total,
      currency,
    });
  }, [sessionId, total, currency, trackEvent]);

  return null;
}
