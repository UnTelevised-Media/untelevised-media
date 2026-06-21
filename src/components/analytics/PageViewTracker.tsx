'use client';

import { useEffect } from 'react';
import useConsentAwareTracking from '@/hooks/googleAdSense/useConsentAwareTracking';

interface Props {
  event: string;
  params?: Record<string, unknown>;
}

export default function PageViewTracker({ event, params }: Props) {
  const { trackEvent } = useConsentAwareTracking();

  useEffect(() => {
    trackEvent(event, params);
  }, [event, params, trackEvent]);

  return null;
}
