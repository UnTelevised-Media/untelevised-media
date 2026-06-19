'use client';

import { useEffect, useState } from 'react';
import { adBlockerDetector } from '@/lib/googleAdSense/consent/adBlockerDetection';

export default function useAdBlockerDetection() {
  const [detected, setDetected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const detect = async () => {
      try {
        const result = await adBlockerDetector.detect();
        if (mounted) {
          setDetected(result);
        }
      } catch (error) {
        console.warn('Ad blocker detection failed:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    detect();

    return () => {
      mounted = false;
    };
  }, []);

  return { detected, loading };
}
