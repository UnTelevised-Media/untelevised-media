import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Briefcase } from 'lucide-react';
import type { Metadata } from 'next';
import { submitMediaSolicitation } from '@/services/syndication/submission';

export const metadata: Metadata = {
  title: 'Media Solicitation | UnTelevised Media',
  description:
    'Sell your journalistic media on your terms. Submit your work to negotiate with UnTelevised Media.',
};

async function handleSolicitation(formData: FormData) {
  'use server';
  const data = Object.fromEntries(formData);
  await submitMediaSolicitation(data);
}

export default function SolicitationPage() {
  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* HERO */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-16 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                MEDIA SOLICITATION
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-5xl'>
              SELL YOUR MEDIA ON YOUR TERMS
            </h2>
            <p className='mb-4 text-xl leading-relaxed text-slate-700 dark:text-slate-300'>
              Are you a journalist, filmmaker, or photographer with valuable content? Offer your
              media for sale directly. You set the price, we negotiate the terms.
            </p>
            <p className='text-lg text-slate-600 dark:text-slate-400'>
              This is how independent creators build relationships with distribution partners.
              Submit your media to open negotiations with UnTelevised Media.
            </p>
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-4xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                SUBMIT YOUR SOLICITATION
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <form action={handleSolicitation} className='space-y-6'>
            {/* CREATOR INFO */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                YOUR INFORMATION
              </h4>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Experience Level *
                </label>
                <select
                  name='experienceLevel'
                  required
                  defaultValue='independent'
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                >
                  <option value='independent'>Independent Creator</option>
                  <option value='freelance'>Freelance Journalist/Filmmaker</option>
                  <option value='news-outlet'>News Outlet</option>
                  <option value='production-company'>Production Company</option>
                  <option value='other'>Other</option>
                </select>
              </div>

              <div className='grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Your Name *
                  </label>
                  <input
                    type='text'
                    name='creatorName'
                    required
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='Your name'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Email *
                  </label>
                  <input
                    type='email'
                    name='creatorEmail'
                    required
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='your.email@example.com'
                  />
                </div>
              </div>

              <div className='mt-6 grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Phone *
                  </label>
                  <input
                    type='tel'
                    name='creatorPhone'
                    required
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='Your phone number'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Company/Brand Name (Optional)
                  </label>
                  <input
                    type='text'
                    name='companyName'
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='Production company, media outlet, etc.'
                  />
                </div>
              </div>

              <div className='mt-6 grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Portfolio/Website
                  </label>
                  <input
                    type='url'
                    name='portfolioUrl'
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='https://your-portfolio.com'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Personal Website (Optional)
                  </label>
                  <input
                    type='url'
                    name='creatorWebsite'
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='https://your-website.com'
                  />
                </div>
              </div>

              <div className='mt-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Tell Us About Yourself
                </label>
                <textarea
                  name='creatorBio'
                  rows={4}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Your background, experience, what makes your work unique...'
                />
              </div>
            </div>

            {/* MEDIA INFO */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                YOUR MEDIA
              </h4>

              <div className='mb-6'>
                <label className='mb-3 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Types of Media You Offer *
                </label>
                <div className='space-y-3'>
                  {['photo', 'video', 'documentary', 'interviews', 'investigation', 'other'].map((type) => (
                    <label key={type} className='flex items-center space-x-3'>
                      <input
                        type='checkbox'
                        name={`mediaType_${type}`}
                        className='h-4 w-4'
                      />
                      <span className='text-sm text-slate-700 dark:text-slate-300'>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Primary Content Categories *
                </label>
                <select
                  name='mediaCategory'
                  required
                  defaultValue=''
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                >
                  <option value=''>Select category</option>
                  <option value='politics'>Politics & Government</option>
                  <option value='conflict'>Conflict & War</option>
                  <option value='environment'>Environment & Climate</option>
                  <option value='corporate'>Corporate Accountability</option>
                  <option value='human-rights'>Human Rights</option>
                  <option value='other'>Other</option>
                </select>
              </div>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  What Media Are You Offering? *
                </label>
                <textarea
                  name='mediaDescription'
                  required
                  rows={5}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Describe the media you want to sell. Include topics, length, quality, exclusivity status, etc.'
                />
              </div>
            </div>

            {/* TERMS & PRICING */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                LICENSING TERMS & PRICING
              </h4>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Exclusivity *
                </label>
                <select
                  name='exclusivityRequested'
                  required
                  defaultValue='no'
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                >
                  <option value='no'>Non-Exclusive (I can sell elsewhere)</option>
                  <option value='yes'>Exclusive (You get exclusive rights)</option>
                  <option value='negotiable'>Negotiable</option>
                </select>
              </div>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Pricing Expectations *
                </label>
                <textarea
                  name='pricingExpectations'
                  required
                  rows={3}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Your price expectations. Be specific: flat fee, per-use, percentage split, or range.'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Specific Terms You Require
                </label>
                <textarea
                  name='requestedTerms'
                  rows={3}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Any non-negotiable terms? Attribution requirements? Time limits? Restrictions?'
                />
              </div>
            </div>

            {/* ADDITIONAL INFO */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                Additional Information (Optional)
              </label>
              <textarea
                name='additionalInfo'
                rows={4}
                className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                placeholder='Anything else we should know about you or your media?'
              />
            </div>

            {/* WARNING */}
            <div className='border border-blue-500 bg-blue-500/10 p-4 dark:bg-blue-950/20'>
              <div className='flex items-start space-x-3'>
                <Briefcase className='mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-500' />
                <div>
                  <p className='font-bold text-blue-700 dark:text-blue-400'>NEXT STEPS</p>
                  <p className='mt-1 text-sm text-blue-700 dark:text-blue-300'>
                    We will review your solicitation and contact you within 5 business days. See our{' '}
                    <Link href='/legal/rights' className='font-bold underline hover:no-underline'>
                      Rights & Protections Policy
                    </Link>{' '}
                    for how solicitations are handled.
                  </p>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type='submit'
              className='w-full bg-untele px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
            >
              SUBMIT SOLICITATION
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
