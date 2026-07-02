import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content Licensing | UnTelevised Media',
  description:
    'Terms and standards for purchasing and using UnTelevised Media content. Browse our featured journalistic media.',
};

export default function ContentLicensingPage() {
  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* HERO */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-16 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                CONTENT LICENSING
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-5xl'>
              LICENSE OUR CONTENT
            </h2>
            <p className='text-xl leading-relaxed text-slate-700 dark:text-slate-300'>
              UnTelevised Media content is available for licensing. Whether you&rsquo;re an outlet,
              educator, filmmaker, or platform, use our photography and video in your projects.
            </p>
          </div>
        </div>
      </section>

      {/* LICENSING STANDARDS */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                TERMS & STANDARDS
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='space-y-6'>
            {[
              {
                title: 'Attribution Required',
                desc: 'All content must include proper credit to UnTelevised Media and the original creator (photographer, videographer, journalist).',
              },
              {
                title: 'No Modification Without Permission',
                desc: 'Content cannot be altered, edited, or recontextualized without written approval from UnTelevised Media.',
              },
              {
                title: 'Editorial Use',
                desc: 'Content licensed for editorial, news, educational, and documentary purposes. Not for commercial advertising or unrelated marketing.',
              },
              {
                title: 'No Misrepresentation',
                desc: 'Content cannot be presented as your own work. Original source and creators must be credited.',
              },
              {
                title: 'Rights Protection',
                desc: 'Some content is exclusive, some non-exclusive. Check licensing terms before use. Violations may result in legal action.',
              },
              {
                title: 'Pricing & Agreements',
                desc: 'Different content has different licensing models. Contact us for specific terms, pricing, and usage rights.',
              },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className='flex h-full flex-col border-l-4 border-untele bg-white p-6 dark:bg-black'
              >
                <h4 className='mb-2 text-lg font-bold text-slate-900 dark:text-white'>{title}</h4>
                <p className='text-slate-600 dark:text-slate-400'>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PHOTOGRAPHY */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                PHOTOGRAPHY
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-8 lg:grid-cols-2'>
            <div>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                Street Photography & Breaking News
              </h4>
              <p className='mb-4 text-slate-700 dark:text-slate-300'>
                High-quality photos captured on the ground. Document events, protests, human impact
                stories, environmental conditions, and breaking news moments that mainstream outlets
                ignore.
              </p>
              <Link
                href='#'
                className='inline-block border-2 border-untele px-6 py-3 text-sm font-black uppercase tracking-widest text-untele transition-colors hover:bg-untele hover:text-white'
              >
                BROWSE PHOTOS →
              </Link>
            </div>

            {/* SKELETON PLACEHOLDER FOR FEATURED PHOTOS */}
            <div className='space-y-4'>
              <div className='h-48 animate-pulse bg-slate-200 dark:bg-slate-800' />
              <div className='h-12 animate-pulse bg-slate-200 dark:bg-slate-800' />
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                VIDEO & DOCUMENTARIES
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-8 lg:grid-cols-2'>
            {/* SKELETON PLACEHOLDER FOR FEATURED VIDEOS */}
            <div className='space-y-4'>
              <div className='h-48 animate-pulse bg-slate-300 dark:bg-slate-700' />
              <div className='h-12 animate-pulse bg-slate-300 dark:bg-slate-700' />
            </div>

            <div>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                Original Video Coverage
              </h4>
              <p className='mb-4 text-slate-700 dark:text-slate-300'>
                Long-form video documentation, interviews, footage packages, and short documentaries.
                Unfiltered coverage of stories mainstream media won&rsquo;t touch. Available for
                licensing in various formats and resolutions.
              </p>
              <Link
                href='#'
                className='inline-block border-2 border-untele px-6 py-3 text-sm font-black uppercase tracking-widest text-untele transition-colors hover:bg-untele hover:text-white'
              >
                BROWSE VIDEOS →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LICENSING PROCESS */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                HOW TO LICENSE
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='space-y-6'>
            {[
              {
                step: '1',
                title: 'BROWSE & SELECT',
                desc: 'Find content in our photography and video galleries. Shortlist what you need.',
              },
              {
                step: '2',
                title: 'REQUEST LICENSE',
                desc: 'Contact us with your intended use, format needed, and distribution scope.',
              },
              {
                step: '3',
                title: 'AGREE TO TERMS',
                desc: 'We provide licensing terms, pricing, and usage restrictions. Negotiate if needed.',
              },
              {
                step: '4',
                title: 'GET CONTENT',
                desc: 'Once terms are signed, receive your content in the format and quality specified.',
              },
              {
                step: '5',
                title: 'USE & CREDIT',
                desc: 'Publish, broadcast, or distribute. Ensure proper attribution per agreement.',
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className='flex h-full flex-col border-l-4 border-untele bg-slate-50 p-6 dark:bg-slate-950'
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

      {/* PRICING & TYPES */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                LICENSE TYPES
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {[
              {
                title: 'Editorial Use',
                price: 'Custom',
                desc: 'News, journalism, educational purposes. Competitive rates.',
              },
              {
                title: 'Documentary/Film',
                price: 'Custom',
                desc: 'Feature films, documentaries, streaming. Higher rates for commercial.',
              },
              {
                title: 'Social Media',
                price: 'Custom',
                desc: 'Posts, stories, clips. Licensed for specific platforms and duration.',
              },
              {
                title: 'Educational',
                price: 'Reduced',
                desc: 'Schools, universities, non-profit educational use. Special rates.',
              },
              {
                title: 'Non-Profit',
                price: 'Reduced',
                desc: 'Non-profit organizations. We support mission-driven work.',
              },
              {
                title: 'Commercial',
                price: 'Premium',
                desc: 'Advertising, commercial projects, marketing. Full licensing fees.',
              },
            ].map(({ title, price, desc }) => (
              <div
                key={title}
                className='border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-black'
              >
                <h4 className='mb-2 text-lg font-bold text-slate-900 dark:text-white'>{title}</h4>
                <p className='mb-3 text-sm font-bold uppercase tracking-widest text-untele'>{price}</p>
                <p className='text-sm text-slate-600 dark:text-slate-400'>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                YOU GET
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            {[
              'High-resolution master files (full, proxy, and compressed formats)',
              'Legal license agreement documenting usage rights',
              'Full metadata, captions, and source information',
              'Attribution guidelines and graphics if needed',
              'Technical support for format conversion/delivery',
              'Perpetual license (you can use indefinitely per agreement)',
            ].map((item) => (
              <div key={item} className='flex items-start space-x-4'>
                <div className='mt-1 h-3 w-3 flex-shrink-0 bg-untele' />
                <p className='text-slate-700 dark:text-slate-300'>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className='border-t-4 border-untele bg-gradient-to-b from-untele/20 to-white py-16 dark:to-black'>
        <div className='mx-auto max-w-4xl px-4 text-center'>
          <h3 className='mb-4 text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-white'>
            READY TO LICENSE?
          </h3>
          <p className='mb-8 text-lg text-slate-700 dark:text-slate-300'>
            Contact us for pricing, rights, and availability of specific content.
          </p>
          <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
            <a
              href='mailto:licensing@untelevised.media'
              className='bg-untele px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
            >
              EMAIL LICENSING TEAM
            </a>
            <Link
              href='/legal/rights'
              className='border-2 border-black bg-transparent px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black'
            >
              VIEW RIGHTS & TERMS
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
