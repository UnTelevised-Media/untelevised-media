import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Shield, Scale, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Syndication Rights & Protections | UnTelevised Media',
  description:
    'Complete guide to rights, protections, and legal terms for media submissions, marketplace sales, and syndication licensing.',
};

export default function SyndicationRightsPage() {
  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* HERO */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-16 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                SYNDICATION RIGHTS
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-5xl'>
              CREATOR & CONTENT RIGHTS
            </h2>
            <p className='text-xl leading-relaxed text-slate-700 dark:text-slate-300'>
              This page explains the rights, protections, and legal obligations for creators using
              our syndication platform, submitting media, and selling content through UnTelevised
              Media.
            </p>
          </div>
        </div>
      </section>

      {/* SUBMISSION MODELS */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                TWO MODELS FOR MEDIA SUBMISSION
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-8 md:grid-cols-2'>
            {/* Gift Model */}
            <div className='border-l-4 border-green-500 bg-green-50 p-6 dark:border-green-600 dark:bg-green-950/20'>
              <h4 className='mb-3 text-lg font-bold text-green-700 dark:text-green-400'>
                GIFT MODEL (Submit Media)
              </h4>
              <div className='space-y-3 text-sm text-green-700 dark:text-green-300'>
                <p>
                  <strong>You submit media as a gift</strong> with two usage options:
                </p>
                <ul className='space-y-2 ml-4'>
                  <li>✓ Use & Post Only — No commercial sale</li>
                  <li>✓ Allow Commercial Use — We can sell it, no return to you</li>
                </ul>
                <p className='mt-3 border-t border-green-200 pt-3 dark:border-green-700'>
                  <strong>Rights transferred:</strong> You grant us the right to use, post, and
                  (if selected) sell your media. You retain copyright ownership.
                </p>
                <p>
                  <strong>Best for:</strong> Viewers who want to contribute to independent
                  journalism without expecting compensation.
                </p>
              </div>
            </div>

            {/* Commercial Model */}
            <div className='border-l-4 border-blue-500 bg-blue-50 p-6 dark:border-blue-600 dark:bg-blue-950/20'>
              <h4 className='mb-3 text-lg font-bold text-blue-700 dark:text-blue-400'>
                COMMERCIAL MODEL (Solicitation)
              </h4>
              <div className='space-y-3 text-sm text-blue-700 dark:text-blue-300'>
                <p>
                  <strong>You sell media on your terms</strong> through our marketplace.
                </p>
                <ul className='space-y-2 ml-4'>
                  <li>✓ You set the price</li>
                  <li>✓ You control licensing terms</li>
                  <li>✓ We take a commission (15-30%)</li>
                  <li>✓ You keep majority of revenue</li>
                </ul>
                <p className='mt-3 border-t border-blue-200 pt-3 dark:border-blue-700'>
                  <strong>Rights retained:</strong> You retain copyright and control usage rights.
                  Each buyer negotiates specific terms.
                </p>
                <p>
                  <strong>Best for:</strong> Professional creators who want to monetize their
                  content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CREATOR PROTECTIONS */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                CREATOR PROTECTIONS
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            {[
              {
                title: 'COPYRIGHT OWNERSHIP',
                desc: 'You retain copyright to your original work. Submission does not transfer ownership.',
              },
              {
                title: 'ATTRIBUTION RIGHTS',
                desc: 'Your name and work will be credited per agreement. No anonymization without consent.',
              },
              {
                title: 'PRIVACY PROTECTION',
                desc: 'We do not share your personal information with third parties without consent.',
              },
              {
                title: 'NON-EXCLUSIVE OPTIONS',
                desc: 'Sell the same media elsewhere. No forced exclusivity lock-in.',
              },
              {
                title: 'PAYMENT SECURITY',
                desc: 'Commercial sales processed through secure channels. No payment without agreement.',
              },
              {
                title: 'ACCOUNT SAFETY',
                desc: 'Your account is protected with encryption and security measures.',
              },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className='border border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'
              >
                <h4 className='mb-2 text-lg font-bold text-slate-900 dark:text-white'>{title}</h4>
                <p className='text-sm text-slate-700 dark:text-slate-300'>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BINDING AGREEMENTS */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                LEGAL BINDING NATURE
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='border-l-4 border-untele bg-white p-6 dark:bg-black'>
            <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
              SUBMITTING MEDIA = ACCEPTING THESE TERMS
            </h4>
            <p className='mb-4 text-slate-700 dark:text-slate-300'>
              By submitting media through our platform—whether as a gift or for commercial
              sale—you acknowledge that:
            </p>
            <ul className='space-y-3'>
              {[
                'You have read and understand these Rights & Protections',
                'You are entering into a binding legal agreement with UnTelevised Media',
                'All information you provide is true, accurate, and complete',
                'You own all rights to the media you submit',
                'You have all necessary permissions to submit the content',
                'You understand the consequences of false submissions',
              ].map((item, i) => (
                <li key={i} className='flex items-start space-x-3'>
                  <span className='mt-1 h-2 w-2 flex-shrink-0 bg-untele' />
                  <span className='text-sm text-slate-700 dark:text-slate-300'>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* YOUR OBLIGATIONS */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                YOUR OBLIGATIONS
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='space-y-6'>
            {[
              {
                title: 'OWNERSHIP & RIGHTS',
                desc: 'You own all rights to the media you submit or sell.',
              },
              {
                title: 'PERMISSIONS',
                desc: 'You have permission from anyone identifiable in the media.',
              },
              {
                title: 'NO INFRINGEMENT',
                desc: "Your media does not infringe anyone else's intellectual property.",
              },
              {
                title: 'ACCURACY',
                desc: 'Information you provide is true and accurate.',
              },
              {
                title: 'NO STOLEN CONTENT',
                desc: 'Media is not stolen, hacked, or illegally obtained.',
              },
              {
                title: 'NO MISREPRESENTATION',
                desc: 'You will not claim ownership of media you do not own.',
              },
            ].map(({ title, desc }, i) => (
              <div
                key={i}
                className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'
              >
                <h4 className='mb-2 font-bold text-slate-900 dark:text-white'>{title}</h4>
                <p className='text-sm text-slate-700 dark:text-slate-300'>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIABILITY */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                LIABILITY & CONSEQUENCES
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='space-y-6'>
            <div className='flex items-start space-x-4 border-2 border-red-600 bg-red-50 p-6 dark:border-red-600 dark:bg-red-950/20'>
              <AlertTriangle className='mt-0.5 h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-500' />
              <div>
                <h4 className='mb-2 font-bold text-red-700 dark:text-red-400'>
                  INFRINGEMENT LIABILITY
                </h4>
                <p className='text-sm text-red-700 dark:text-red-300'>
                  If your submission infringes anyone's rights, violates privacy, or contains stolen
                  information, you indemnify and hold harmless UnTelevised Media from all claims,
                  damages, and legal costs. You are solely responsible.
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-4 border-2 border-yellow-600 bg-yellow-50 p-6 dark:border-yellow-600 dark:bg-yellow-950/20'>
              <AlertTriangle className='mt-0.5 h-6 w-6 flex-shrink-0 text-yellow-600 dark:text-yellow-500' />
              <div>
                <h4 className='mb-2 font-bold text-yellow-700 dark:text-yellow-400'>
                  FALSE SUBMISSIONS
                </h4>
                <p className='text-sm text-yellow-700 dark:text-yellow-300'>
                  Submitting false information or media you don't own may result in account
                  termination, legal action, and financial liability.
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-4 border-2 border-blue-600 bg-blue-50 p-6 dark:border-blue-600 dark:bg-blue-950/20'>
              <Shield className='mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-500' />
              <div>
                <h4 className='mb-2 font-bold text-blue-700 dark:text-blue-400'>
                  OUR PROTECTION
                </h4>
                <p className='text-sm text-blue-700 dark:text-blue-300'>
                  We may remove content that violates these terms, is illegal, or is subject to
                  valid legal claims. Account termination is possible for serious violations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className='border-t-4 border-untele bg-gradient-to-b from-untele/20 to-white py-16 dark:to-black'>
        <div className='mx-auto max-w-4xl px-4 text-center'>
          <h3 className='mb-4 text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-white'>
            QUESTIONS ABOUT THESE TERMS?
          </h3>
          <p className='mb-8 text-lg text-slate-700 dark:text-slate-300'>
            Review our main Rights & Protections policy or contact us for clarification.
          </p>
          <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
            <Link
              href='/legal/rights'
              className='bg-untele px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
            >
              FULL LEGAL POLICY
            </Link>
            <a
              href='mailto:legal@untelevised.media'
              className='border-2 border-black bg-transparent px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black'
            >
              EMAIL LEGAL TEAM
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
