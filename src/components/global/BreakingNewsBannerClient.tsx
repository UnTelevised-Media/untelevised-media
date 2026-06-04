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
      role='alert'
      aria-label='Breaking news alert'
      className='mt-5 w-full border-b-2 border-red-800 bg-untele'
    >
      <div className='mx-auto flex max-w-[1400px] items-center px-4'>
        {/* BREAKING label — left block with right border */}
        <div className='flex shrink-0 items-center gap-2 border-r border-white/25 py-2.5 pr-4'>
          <span className='h-2 w-2 animate-pulse rounded-full bg-white' aria-hidden='true' />
          <span className='text-[11px] font-black uppercase tracking-[0.2em] text-white'>
            Breaking
          </span>
        </div>

        {/* Headline — flexible middle */}
        <p className='mx-4 flex-1 truncate text-sm font-bold leading-snug text-white'>
          {headline}
        </p>

        {/* CTA + Dismiss — right side */}
        <div className='flex shrink-0 items-center gap-3'>
          {linkUrl &&
            (isExternal ? (
              <a
                href={linkUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='border border-white/50 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-untele'
              >
                {linkLabel} →
              </a>
            ) : (
              <Link
                href={linkUrl}
                className='border border-white/50 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-untele'
              >
                {linkLabel} →
              </Link>
            ))}

          <button
            onClick={handleDismiss}
            aria-label='Dismiss breaking news alert'
            className='flex h-6 w-6 shrink-0 items-center justify-center text-white/50 transition-colors hover:text-white focus:outline-none focus:ring-1 focus:ring-white/50'
          >
            <svg
              aria-hidden='true'
              className='h-3.5 w-3.5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2.5}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
