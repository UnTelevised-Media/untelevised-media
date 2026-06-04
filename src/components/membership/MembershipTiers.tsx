'use client';

import { useState } from 'react';

interface Tier {
  id: string;
  name: string;
  price: number;
  featured?: boolean;
  description: string;
  perks: string[];
}

const TIERS: Tier[] = [
  {
    id: 'supporter',
    name: 'Supporter',
    price: 5,
    description: 'Back independent journalism with a monthly contribution.',
    perks: ['Supporter badge in comments', 'Monthly member newsletter', 'Our sincere gratitude'],
  },
  {
    id: 'contributor',
    name: 'Contributor',
    price: 15,
    featured: true,
    description: 'Get more access while keeping the mission alive.',
    perks: [
      'Everything in Supporter',
      'Ad-free reading experience',
      'Access to members-only articles',
      'Monthly Q&A with editorial team',
    ],
  },
  {
    id: 'patron',
    name: 'Patron',
    price: 50,
    description: 'Become a founding patron of independent media.',
    perks: [
      'Everything in Contributor',
      'Credit in articles you support',
      'Direct email line to editors',
      'Annual patron recognition',
    ],
  },
];

export function MembershipTiers() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin(tierId: string) {
    setLoading(tierId);
    setError(null);
    try {
      const res = await fetch('/api/membership/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? 'Checkout failed');
      window.location.href = data.url!;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(null);
    }
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`flex flex-col border p-6 transition-colors ${
              tier.featured ? 'border-untele' : 'border-zinc-700 hover:border-zinc-500'
            }`}
          >
            {tier.featured && (
              <div className='mb-4 inline-block self-start bg-untele px-2 py-0.5 text-xs font-black uppercase tracking-widest text-white'>
                Most Popular
              </div>
            )}
            <h2 className='mb-1 text-xl font-black uppercase tracking-wide text-white'>
              {tier.name}
            </h2>
            <div className='mb-4'>
              <span className='text-3xl font-black text-white'>${tier.price}</span>
              <span className='text-sm text-zinc-400'>/month</span>
            </div>
            <p className='mb-6 text-sm text-zinc-400'>{tier.description}</p>
            <ul className='mb-8 flex-1 space-y-2'>
              {tier.perks.map((perk) => (
                <li key={perk} className='flex items-start gap-2 text-sm text-zinc-300'>
                  <span className='mt-0.5 shrink-0 text-untele'>&#10003;</span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleJoin(tier.id)}
              disabled={loading !== null}
              className='bg-untele py-3 text-xs font-black uppercase tracking-widest text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60'
            >
              {loading === tier.id ? 'Redirecting...' : `Join as ${tier.name}`}
            </button>
          </div>
        ))}
      </div>
      {error && <p className='text-center text-sm text-red-400'>{error}</p>}
    </div>
  );
}
