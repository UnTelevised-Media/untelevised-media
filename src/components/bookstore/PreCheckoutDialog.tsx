'use client';

import { useRouter } from 'next/navigation';

interface Props {
  onGuest: () => void;
  onClose: () => void;
}

export default function PreCheckoutDialog({ onGuest, onClose }: Props) {
  const router = useRouter();

  const returnUrl = '/bookstore/cart';

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Panel */}
      <div className='relative w-full max-w-md border border-hp-sand-border bg-white shadow-2xl dark:border-hp-dark-border dark:bg-hp-dark-card'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-hp-sand-border px-5 py-4 dark:border-hp-dark-border'>
          <div className='bg-untele px-2 py-0.5'>
            <span className='text-[10px] font-black uppercase tracking-widest text-white'>
              Sign In to Continue
            </span>
          </div>
          <button
            onClick={onClose}
            className='text-slate-400 hover:text-slate-700 dark:hover:text-hp-cream'
            aria-label='Close'
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className='px-5 py-5'>
          <p className='mb-1 text-sm font-black text-slate-900 dark:text-hp-cream'>
            Have an account?
          </p>
          <p className='mb-4 text-xs text-hp-muted'>
            Sign in to save your purchases to your library and re-download digital books anytime.
          </p>

          <div className='flex flex-col gap-2'>
            <button
              onClick={() => router.push(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`)}
              className='w-full bg-untele py-3 text-xs font-black uppercase tracking-widest text-white hover:opacity-90'
            >
              Sign In
            </button>
            <button
              onClick={() => router.push(`/sign-up?redirect_url=${encodeURIComponent(returnUrl)}`)}
              className='w-full border border-untele py-3 text-xs font-black uppercase tracking-widest text-untele hover:bg-red-50 dark:hover:bg-red-950/20'
            >
              Create Account
            </button>
          </div>

          <div className='my-4 flex items-center gap-3'>
            <div className='h-px flex-1 bg-slate-200 dark:bg-slate-700' />
            <span className='text-[10px] font-bold uppercase tracking-widest text-hp-muted'>
              or
            </span>
            <div className='h-px flex-1 bg-slate-200 dark:bg-slate-700' />
          </div>

          <button
            onClick={() => {
              onClose();
              onGuest();
            }}
            className='w-full border border-hp-sand-border py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:border-slate-400 dark:border-hp-dark-border dark:text-hp-cream'
          >
            Continue as Guest
          </button>

          <p className='mt-3 text-[10px] leading-relaxed text-hp-muted'>
            Guest orders: digital purchases are emailed to you as a one-time download link. Without
            an account your books won't be saved to an onsite library for later access.
          </p>
        </div>
      </div>
    </div>
  );
}
