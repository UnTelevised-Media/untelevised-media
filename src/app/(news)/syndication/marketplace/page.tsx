import React from 'react';
import Link from 'next/link';
import { TrendingUp, Users, DollarSign } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace | UnTelevised Media',
  description:
    'The UnTelevised Media marketplace — where independent creators sell journalistic media on their terms.',
};

export default function MarketplacePage() {
  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* HERO */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-16 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                MARKETPLACE
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-5xl'>
              WHERE CREATORS MEET DISTRIBUTION
            </h2>
            <p className='mb-4 text-xl leading-relaxed text-slate-700 dark:text-slate-300'>
              Independent journalists, filmmakers, and photographers list their work here. UnTelevised
              Media connects creators directly with outlets, platforms, and audiences.
            </p>
            <p className='text-lg text-slate-600 dark:text-slate-400'>
              Set your price. Keep your rights. Build your career.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                HOW IT WORKS
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='space-y-6'>
            {[
              {
                step: '1',
                title: 'YOU LIST',
                desc: 'Creators submit media to our marketplace with their pricing and terms.',
              },
              {
                step: '2',
                title: 'WE VERIFY',
                desc: 'Our team reviews submissions and confirms rights ownership.',
              },
              {
                step: '3',
                title: 'BUYERS FIND YOU',
                desc: 'Outlets, platforms, and editors browse and discover your work.',
              },
              {
                step: '4',
                title: 'YOU NEGOTIATE',
                desc: 'Buyers contact you directly to discuss terms and usage rights.',
              },
              {
                step: '5',
                title: 'YOU PROFIT',
                desc: 'Get paid directly by buyers. We take a small commission on successful sales.',
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className='flex h-full flex-col border-l-4 border-untele bg-white p-6 dark:bg-black'
              >
                <div className='flex items-start gap-4'>
                  <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center bg-untele text-white font-bold'>
                    {step}
                  </div>
                  <div>
                    <h4 className='font-bold text-slate-900 dark:text-white'>{title}</h4>
                    <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CREATORS LOVE IT */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                WHY CREATORS CHOOSE US
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {[
              {
                icon: DollarSign,
                title: 'YOU CONTROL PRICING',
                desc: 'No gatekeepers. Set your price and negotiate your terms.',
              },
              {
                icon: Users,
                title: 'DIRECT RELATIONSHIPS',
                desc: 'Work directly with buyers. Build long-term partnerships.',
              },
              {
                icon: TrendingUp,
                title: 'GROW YOUR BUSINESS',
                desc: 'Multiple revenue streams from a single piece of content.',
              },
              {
                title: 'NON-EXCLUSIVE',
                desc: 'Sell the same media everywhere. No exclusivity lock-in.',
              },
              {
                title: 'KEEP YOUR RIGHTS',
                desc: 'You own your work. Retain copyright and control usage.',
              },
              {
                title: 'BUILD REPUTATION',
                desc: 'Get published on a respected independent journalism platform.',
              },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <div
                key={idx}
                className='flex h-full flex-col border border-slate-300 bg-slate-50 p-6 transition-all hover:border-untele dark:border-slate-700 dark:bg-slate-950'
              >
                {Icon && (
                  <Icon className='mb-4 h-8 w-8 text-untele' />
                )}
                <h4 className='mb-3 text-lg font-bold text-slate-900 dark:text-white'>{title}</h4>
                <p className='flex-1 text-sm text-slate-700 dark:text-slate-300'>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMISSION STRUCTURE */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                TRANSPARENT PRICING
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
            {[
              {
                tier: 'Editorial License',
                commission: '20%',
                desc: 'Standard licensing for news outlets, documentaries, educational use',
              },
              {
                tier: 'Commercial License',
                commission: '30%',
                desc: 'Higher-value commercial uses, advertising, brand partnerships',
              },
              {
                tier: 'Exclusive License',
                commission: '15-25%',
                desc: 'Exclusive rights agreements negotiated per project',
              },
              {
                tier: 'Direct Sales',
                commission: '10%',
                desc: 'Buyer found directly on our platform, full creator control',
              },
            ].map(({ tier, commission, desc }) => (
              <div
                key={tier}
                className='rounded border-2 border-untele bg-white p-6 text-center dark:bg-black'
              >
                <h4 className='mb-2 text-lg font-bold text-slate-900 dark:text-white'>{tier}</h4>
                <p className='mb-3 text-2xl font-black text-untele'>{commission}</p>
                <p className='text-sm text-slate-600 dark:text-slate-400'>{desc}</p>
              </div>
            ))}
          </div>

          <div className='mt-12 border-l-4 border-untele bg-slate-100 p-6 dark:bg-black'>
            <p className='text-sm text-slate-700 dark:text-slate-300'>
              <strong>Example:</strong> You sell a video license for $1,000. At 20% commission,
              we take $200 and you receive $800. You control pricing, so adjust your rates
              accordingly. Higher-value content = higher commission but often worth it for access
              to larger buyers.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED CREATORS */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                FEATURED CREATORS
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className='border border-slate-300 p-6 dark:border-slate-700'
              >
                <div className='mb-4 h-32 animate-pulse bg-slate-200 dark:bg-slate-800' />
                <div className='mb-3 h-6 animate-pulse bg-slate-200 dark:bg-slate-800' />
                <div className='mb-4 h-4 animate-pulse bg-slate-200 dark:bg-slate-800' />
                <div className='h-4 animate-pulse bg-slate-200 dark:bg-slate-800' />
              </div>
            ))}
          </div>

          <div className='mt-12 text-center'>
            <p className='mb-6 text-slate-700 dark:text-slate-300'>
              Featured creators are coming soon. Be among the first!
            </p>
          </div>
        </div>
      </section>

      {/* MEDIA CATEGORIES */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                WHAT'S SELLING
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {[
              'Breaking News Footage',
              'Documentary Content',
              'Investigative Photography',
              'Exclusive Interviews',
              'Conflict Zone Coverage',
              'Environmental Documentation',
              'Protest & Activism Coverage',
              'Undercover Investigations',
              'Expert Commentary',
            ].map((category) => (
              <div
                key={category}
                className='border-l-4 border-untele bg-white p-6 dark:bg-black'
              >
                <h4 className='font-bold text-slate-900 dark:text-white'>{category}</h4>
                <p className='mt-2 text-sm text-slate-600 dark:text-slate-400'>
                  High-demand category for news outlets and platforms
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='border-t-4 border-untele bg-gradient-to-b from-untele/20 to-white py-16 dark:to-black'>
        <div className='mx-auto max-w-4xl px-4 text-center'>
          <h3 className='mb-4 text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-white'>
            READY TO LIST YOUR MEDIA?
          </h3>
          <p className='mb-8 text-lg text-slate-700 dark:text-slate-300'>
            Start selling your journalistic work today. Submit your media solicitation to get started.
          </p>
          <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
            <Link
              href='/syndication/solicitation'
              className='bg-untele px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
            >
              SUBMIT MEDIA SOLICITATION
            </Link>
            <Link
              href='/legal/rights'
              className='border-2 border-black bg-transparent px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black'
            >
              VIEW MARKETPLACE TERMS
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
