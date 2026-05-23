'use client';

import { useEffect } from 'react';
import { useConsentAwareTracking } from './ConsentAwareAnalytics';

interface Props {
  event: string;
  params?: Record<string, unknown>;
}

export default function PageViewTracker({ event, params }: Props) {
  const { trackEvent } = useConsentAwareTracking();

  useEffect(() => {
    trackEvent(event, params);
    // intentionally runs once on mount — params are stable at render time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
