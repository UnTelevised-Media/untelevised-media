'use client';

import { useEffect } from 'react';

interface ViewPingProps {
  slug: string;
}

export default function ViewPing({ slug }: ViewPingProps) {
  useEffect(() => {
    if (!slug) return;

    const storageKey = `viewed_${slug}`;

    if (sessionStorage.getItem(storageKey)) return;

    sessionStorage.setItem(storageKey, '1');

    fetch('/api/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {
      // Silently fail — view tracking is non-critical
    });
  }, [slug]);

  return null;
}
