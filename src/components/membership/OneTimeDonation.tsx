'use client';

import { useState } from 'react';

const PRESETS = [5, 10, 25, 50, 100];

export function OneTimeDonation() {
  const [selected, setSelected] = useState<number | null>(25);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveAmount = custom !== '' ? parseFloat(custom) : (selected ?? 0);

  async function handleDonate() {
    const amountCents = Math.round(effectiveAmount * 100);
    if (!amountCents || amountCents < 500) {
      setError('Minimum donation is $5.00');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/membership/one-time-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? 'Checkout failed');
      window.location.href = data.url!;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className='border border-zinc-700 bg-black p-6'>
      <h3 className='mb-1 text-lg font-black uppercase tracking-wide text-white'>
        One-Time Donation
      </h3>
      <p className='mb-5 text-sm text-zinc-400'>
        Pay what you can. Every dollar goes directly to the mission.
      </p>

      {/* Preset amounts */}
      <div className='mb-4 flex flex-wrap gap-2'>
        {PRESETS.map((amt) => (
          <button
            key={amt}
            onClick={() => {
              setSelected(amt);
              setCustom('');
            }}
            className={`px-4 py-2 text-sm font-black uppercase tracking-widest transition-colors ${
              selected === amt && custom === ''
                ? 'bg-untele text-white'
                : 'border border-zinc-600 text-zinc-300 hover:border-untele hover:text-white'
            }`}
          >
            ${amt}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className='mb-5 flex items-center gap-2'>
        <span className='text-sm font-black text-zinc-400'>$</span>
        <input
          type='number'
          min='5'
          step='1'
          placeholder='Custom amount'
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value);
            setSelected(null);
          }}
          className='w-full border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-untele focus:outline-none'
        />
      </div>

      {error && <p className='mb-3 text-xs text-red-400'>{error}</p>}

      <button
        onClick={handleDonate}
        disabled={loading || effectiveAmount < 5}
        className='w-full bg-untele py-3 text-xs font-black uppercase tracking-widest text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60'
      >
        {loading
          ? 'Redirecting...'
          : `Donate ${effectiveAmount >= 5 ? `$${effectiveAmount % 1 === 0 ? effectiveAmount : effectiveAmount.toFixed(2)}` : ''} via Stripe`}
      </button>
      <p className='mt-2 text-center text-xs text-zinc-600'>
        Powered by Stripe · Secure · No account required
      </p>
    </div>
  );
}
