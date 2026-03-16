'use client';
// src/components/global/BreakingNewsBannerClient.tsx

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Props {
  headline: string;
  linkUrl?: string;
  linkLabel: string;
  expiresAt?: string;
}

export function BreakingNewsBannerClient({ headline, linkUrl, linkLabel, expiresAt }: Props) {
  // Start hidden to prevent flash before sessionStorage check
  const [dismissed, setDismissed] = useState(true);
  const sessionKey = `untele_banner_${btoa(encodeURIComponent(headline)).slice(0, 16)}`;

  useEffect(() => {
    // Belt-and-suspenders client-side expiry check
    if (expiresAt && new Date(expiresAt) < new Date()) return;
    if (!sessionStorage.getItem(sessionKey)) {
      setDismissed(false);
    }
  }, [sessionKey, expiresAt]);

  function handleDismiss() {
    sessionStorage.setItem(sessionKey, '1');
    setDismissed(true);
  }

  if (dismissed) return null;

  const isExternal = linkUrl?.startsWith('http');

  return (
    <div
      role='banner'
      aria-label='Breaking news alert'
      className='relative flex items-center justify-between gap-4 bg-untele px-4 py-2 text-white'
    >
      {/* BREAKING label + headline */}
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        <span className='flex shrink-0 items-center gap-1.5'>
          <span className='h-2 w-2 animate-pulse bg-white' aria-hidden='true' />
          <span className='text-xs font-black uppercase tracking-widest'>Breaking</span>
        </span>
        <span className='truncate text-sm font-semibold'>{headline}</span>
      </div>

      {/* CTA link */}
      {linkUrl &&
        (isExternal ? (
          <a
            href={linkUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='shrink-0 border border-white/40 px-3 py-1 text-xs font-black uppercase tracking-widest hover:bg-white/10'
          >
            {linkLabel} →
          </a>
        ) : (
          <Link
            href={linkUrl}
            className='shrink-0 border border-white/40 px-3 py-1 text-xs font-black uppercase tracking-widest hover:bg-white/10'
          >
            {linkLabel} →
          </Link>
        ))}

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        aria-label='Dismiss breaking news banner'
        className='shrink-0 p-1 text-white/70 hover:text-white focus:outline-none focus:ring-1 focus:ring-white'
      >
        <svg aria-hidden='true' className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
        </svg>
      </button>
    </div>
  );
}
