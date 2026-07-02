import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';
import { submitCopyrightClaim } from '@/services/legal/submission';

export const metadata: Metadata = {
  title: 'Copyright Claim | UnTelevised Media',
  description:
    'Submit a copyright infringement claim. This is the official channel for copyright-related issues.',
};

async function handleCopyrightClaim(formData: FormData) {
  'use server';
  const data = Object.fromEntries(formData);
  await submitCopyrightClaim(data);
}

export default function CopyrightClaimPage() {
  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* HERO */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-16 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                COPYRIGHT CLAIM
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-5xl'>
              REPORT COPYRIGHT INFRINGEMENT
            </h2>
            <p className='mb-4 text-xl leading-relaxed text-slate-700 dark:text-slate-300'>
              If you believe your copyrighted work has been used on UnTelevised Media without
              authorization, submit a claim through this official form. This is the ONLY method
              through which copyright claims will be processed.
            </p>
            <p className='text-lg text-slate-600 dark:text-slate-400'>
              <strong>IMPORTANT:</strong> Any legal action taken without first using this form will
              be considered non-compliant with our process and will not be honored.
            </p>
          </div>
        </div>
      </section>

      {/* REQUIREMENTS */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                WHAT WE REQUIRE
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            {[
              {
                title: 'Proof of Ownership',
                desc: 'Documentation proving you own the copyright to the work in question',
              },
              {
                title: 'Original Work',
                desc: 'Evidence that the work is original and created by you',
              },
              {
                title: 'Specific Identification',
                desc: 'Clear description and URL of the infringing content',
              },
              {
                title: 'Good Faith Assertion',
                desc: 'Declaration under penalty of perjury that your claim is valid',
              },
              {
                title: 'Contact Information',
                desc: 'Valid name, email, and phone for follow-up communication',
              },
              {
                title: 'Detailed Explanation',
                desc: 'Specific explanation of how the work infringes your copyright',
              },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className='border-l-4 border-untele bg-white p-6 dark:bg-black'
              >
                <h4 className='mb-2 text-lg font-bold text-slate-900 dark:text-white'>{title}</h4>
                <p className='text-slate-600 dark:text-slate-400'>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-4xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                SUBMIT YOUR CLAIM
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <form action={handleCopyrightClaim} className='space-y-6'>
            {/* CLAIMANT INFO */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                CLAIMANT INFORMATION
              </h4>

              <div className='grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Full Name *
                  </label>
                  <input
                    type='text'
                    name='claimantName'
                    required
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='Your full name'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Email *
                  </label>
                  <input
                    type='email'
                    name='claimantEmail'
                    required
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='your.email@example.com'
                  />
                </div>
              </div>

              <div className='mt-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Phone *
                </label>
                <input
                  type='tel'
                  name='claimantPhone'
                  required
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Your phone number'
                />
              </div>
            </div>

            {/* COPYRIGHT OWNERSHIP */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                COPYRIGHT OWNERSHIP
              </h4>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Ownership Type *
                </label>
                <select
                  name='ownershipType'
                  required
                  defaultValue='original-creator'
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                >
                  <option value='original-creator'>Original Creator</option>
                  <option value='copyright-owner'>Copyright Owner</option>
                  <option value='authorized-agent'>Authorized Agent/Representative</option>
                  <option value='employer'>Employer (work made for hire)</option>
                </select>
              </div>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Copyright Registration Number (if available)
                </label>
                <input
                  type='text'
                  name='registrationNumber'
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='US Copyright Registration # (e.g., TXu-123-456-789)'
                />
              </div>

              <div className='grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Type of Work *
                  </label>
                  <select
                    name='workType'
                    required
                    defaultValue='photo'
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  >
                    <option value='photo'>Photograph</option>
                    <option value='video'>Video</option>
                    <option value='article'>Article/Writing</option>
                    <option value='audio'>Audio/Music</option>
                    <option value='graphic'>Graphic Design</option>
                    <option value='other'>Other</option>
                  </select>
                </div>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Copyright Date *
                  </label>
                  <input
                    type='date'
                    name='copyrightDate'
                    required
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  />
                </div>
              </div>
            </div>

            {/* WORK DESCRIPTION */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                ORIGINAL WORK DESCRIPTION
              </h4>

              <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                Describe Your Original Work *
              </label>
              <textarea
                name='worksDescription'
                required
                rows={5}
                className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                placeholder='Detailed description of your original work, including distinguishing features...'
              />
            </div>

            {/* INFRINGING CONTENT */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                INFRINGING CONTENT
              </h4>

              <div className='mb-6 grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    URL of Infringing Content *
                  </label>
                  <input
                    type='url'
                    name='infringingContentUrl'
                    required
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='https://untelevised.media/...'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Title of Infringing Content *
                  </label>
                  <input
                    type='text'
                    name='infringingContentTitle'
                    required
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='Article/post title'
                  />
                </div>
              </div>

              <div className='mb-6 grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Date First Posted *
                  </label>
                  <input
                    type='date'
                    name='dateFirstPosted'
                    required
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Date You Discovered *
                  </label>
                  <input
                    type='date'
                    name='dateDiscovered'
                    required
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  />
                </div>
              </div>

              <div>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  How Specifically Does This Content Infringe Your Copyright? *
                </label>
                <textarea
                  name='claimDetails'
                  required
                  rows={5}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Explain specifically how the content infringes. Include any side-by-side comparisons...'
                />
              </div>
            </div>

            {/* RESOLUTION & DAMAGES */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                PREFERRED RESOLUTION
              </h4>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  What Action Do You Seek? *
                </label>
                <select
                  name='preferencedResolution'
                  required
                  defaultValue='removal'
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                >
                  <option value='removal'>Removal of Content</option>
                  <option value='attribution'>Attribution/Credit</option>
                  <option value='license'>Licensing Agreement</option>
                  <option value='damages'>Damages Payment</option>
                  <option value='other'>Other</option>
                </select>
              </div>

              <div>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Claimed Damages (if applicable)
                </label>
                <input
                  type='text'
                  name='damagesDue'
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='$0.00 or description of damages'
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
                placeholder='Any other relevant information...'
              />
            </div>

            {/* WARNING */}
            <div className='border border-yellow-500 bg-yellow-500/10 p-4 dark:bg-yellow-950/20'>
              <div className='flex items-start space-x-3'>
                <AlertTriangle className='mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-500' />
                <div>
                  <p className='font-bold text-yellow-700 dark:text-yellow-400'>
                    LEGAL DECLARATION
                  </p>
                  <p className='mt-1 text-sm text-yellow-700 dark:text-yellow-300'>
                    I declare under penalty of perjury that the information in this claim is true
                    and accurate to the best of my knowledge. False claims may result in legal
                    liability. By submitting, you agree to our{' '}
                    <Link href='/legal/rights' className='font-bold underline hover:no-underline'>
                      Rights & Protections Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className='flex gap-4'>
              <button
                type='submit'
                className='flex-1 bg-untele px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
              >
                SUBMIT CLAIM
              </button>
              <Link
                href='/legal/rights'
                className='flex items-center border-2 border-black bg-transparent px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black'
              >
                VIEW RIGHTS
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
