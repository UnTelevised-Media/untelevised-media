'use client';
// src/components/bookstore/GiftToggle.tsx
// "Buy as a Gift" toggle on the book detail page.
// When enabled, reveals recipient email + optional from-name + anonymous checkbox.
// Only works with Buy Now (not Add to Cart — gifts must be immediate checkout).

import { useState } from 'react';
import type { GiftOptions } from '@/lib/bookstore/types';

interface Props {
  onChange: (options: GiftOptions | null) => void;
}

export default function GiftToggle({ onChange }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    if (!checked) {
      onChange(null);
    } else {
      onChange({ recipientEmail, fromName: fromName || undefined, anonymous });
    }
  };

  const handleFieldChange = (
    newEmail: string,
    newFromName: string,
    newAnonymous: boolean
  ) => {
    if (enabled) {
      onChange({
        recipientEmail: newEmail,
        fromName: newFromName || undefined,
        anonymous: newAnonymous,
      });
    }
  };

  return (
    <div className='mb-4 border border-hp-sand-border bg-hp-sand p-4 dark:border-hp-dark-border dark:bg-hp-dark-card'>
      {/* Toggle row */}
      <label className='flex cursor-pointer items-center gap-3'>
        <input
          type='checkbox'
          checked={enabled}
          onChange={(e) => handleToggle(e.target.checked)}
          className='h-4 w-4 accent-untele'
        />
        <span className='text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-hp-cream'>
          Buy as a Gift
        </span>
        <span className='text-[10px] text-hp-muted'>
          — send the download directly to someone else
        </span>
      </label>

      {/* Expanded fields */}
      {enabled && (
        <div className='mt-4 flex flex-col gap-3'>
          {/* Recipient email */}
          <div>
            <label
              htmlFor='gift-recipient-email'
              className='mb-1 block text-[10px] font-black uppercase tracking-widest text-hp-muted'
            >
              Recipient Email <span className='text-untele'>*</span>
            </label>
            <input
              id='gift-recipient-email'
              type='email'
              required
              value={recipientEmail}
              onChange={(e) => {
                setRecipientEmail(e.target.value);
                handleFieldChange(e.target.value, fromName, anonymous);
              }}
              placeholder='recipient@email.com'
              className='w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-untele focus:outline-none dark:border-hp-dark-border dark:bg-hp-dark-card dark:text-hp-cream'
            />
          </div>

          {/* From name */}
          <div>
            <label
              htmlFor='gift-from-name'
              className='mb-1 block text-[10px] font-black uppercase tracking-widest text-hp-muted'
            >
              Your Name{' '}
              <span className='font-normal normal-case text-hp-muted'>(optional)</span>
            </label>
            <input
              id='gift-from-name'
              type='text'
              value={fromName}
              disabled={anonymous}
              onChange={(e) => {
                setFromName(e.target.value);
                handleFieldChange(recipientEmail, e.target.value, anonymous);
              }}
              placeholder={anonymous ? 'Hidden — gift is anonymous' : 'Your name'}
              className='w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-untele focus:outline-none disabled:opacity-40 dark:border-hp-dark-border dark:bg-hp-dark-card dark:text-hp-cream'
            />
          </div>

          {/* Anonymous checkbox */}
          <label className='flex cursor-pointer items-center gap-2'>
            <input
              type='checkbox'
              checked={anonymous}
              onChange={(e) => {
                setAnonymous(e.target.checked);
                handleFieldChange(recipientEmail, fromName, e.target.checked);
              }}
              className='h-3.5 w-3.5 accent-untele'
            />
            <span className='text-[10px] font-bold uppercase tracking-widest text-hp-muted'>
              Send anonymously — recipient sees &ldquo;From: A friend&rdquo;
            </span>
          </label>

          <p className='text-[10px] text-hp-muted'>
            The recipient receives a gift email with the download link. No pricing is shown.
            You receive the standard order receipt.
          </p>
        </div>
      )}
    </div>
  );
}
