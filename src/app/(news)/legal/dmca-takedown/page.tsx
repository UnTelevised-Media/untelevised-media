import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';
import { submitDMCATakedown } from '@/services/legal/submission';

export const metadata: Metadata = {
  title: 'DMCA Takedown | UnTelevised Media',
  description:
    'Submit a DMCA takedown notice. This is the official channel for Digital Millennium Copyright Act claims.',
};

async function handleDMCATakedown(formData: FormData) {
  'use server';
  const data = Object.fromEntries(formData);
  await submitDMCATakedown(data);
}

export default function DMCATakedownPage() {
  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* HERO */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-16 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                DMCA TAKEDOWN NOTICE
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-5xl'>
              DIGITAL MILLENNIUM COPYRIGHT ACT
            </h2>
            <p className='mb-4 text-xl leading-relaxed text-slate-700 dark:text-slate-300'>
              If you believe copyrighted material on UnTelevised Media infringes your rights under
              the Digital Millennium Copyright Act (DMCA), submit your notice through this official
              form. This is the ONLY method through which DMCA notices will be processed.
            </p>
            <p className='text-lg text-slate-600 dark:text-slate-400'>
              <strong>IMPORTANT:</strong> Any legal action taken without first using this form will
              be considered non-compliant with our process and will not be honored.
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
                SUBMIT YOUR DMCA NOTICE
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <form action={handleDMCATakedown} className='space-y-6'>
            {/* COPYRIGHT OWNER INFO */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                COPYRIGHT OWNER INFORMATION
              </h4>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  I am the: *
                </label>
                <select
                  name='ownershipRole'
                  required
                  defaultValue='copyright-holder'
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                >
                  <option value='copyright-holder'>Copyright Holder</option>
                  <option value='authorized-agent'>Authorized Agent of Copyright Holder</option>
                  <option value='representative'>Legal Representative</option>
                </select>
              </div>

              <div className='grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Name *
                  </label>
                  <input
                    type='text'
                    name='copyrightOwnerName'
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
                    name='copyrightOwnerEmail'
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
                  name='copyrightOwnerPhone'
                  required
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Your phone number'
                />
              </div>
            </div>

            {/* WORKS IDENTIFICATION */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                COPYRIGHTED WORKS
              </h4>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Identification of Copyrighted Work(s) *
                </label>
                <textarea
                  name='worksIdentification'
                  required
                  rows={5}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Describe each copyrighted work with sufficient detail to identify it (title, author, publication date, registration number if available)'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Copyright Registration Information (if available)
                </label>
                <textarea
                  name='registrationInfo'
                  rows={3}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='US Copyright Registration numbers or other registration information'
                />
              </div>
            </div>

            {/* INFRINGING MATERIAL */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                INFRINGING MATERIAL
              </h4>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Locations of Infringing Material *
                </label>
                <textarea
                  name='infringingUrls'
                  required
                  rows={5}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Provide specific URLs and descriptions of where the infringing material is located (one per line)'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Technology Information (if applicable)
                </label>
                <textarea
                  name='technologyUsed'
                  rows={3}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Describe any technological protection measures circumvented'
                />
              </div>
            </div>

            {/* ORIGINAL WORK LOCATION */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                ORIGINAL WORK INFORMATION
              </h4>

              <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                Where Is Your Original Work Located? *
              </label>
              <textarea
                name='originalsLocation'
                required
                rows={4}
                className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                placeholder='Provide URLs or descriptions of where your original works are located/published (e.g., your website, social media, etc.)'
              />
            </div>

            {/* LEGAL STATEMENTS */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-6 text-lg font-bold text-slate-900 dark:text-white'>
                LEGAL STATEMENTS
              </h4>

              <div className='space-y-4'>
                <label className='flex items-start space-x-3'>
                  <input
                    type='checkbox'
                    name='goodFaithStatement'
                    required
                    className='mt-1 h-4 w-4'
                  />
                  <span className='text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Good Faith Belief *
                  </span>
                </label>

                <label className='flex items-start space-x-3'>
                  <input
                    type='checkbox'
                    name='accuracyStatement'
                    required
                    className='mt-1 h-4 w-4'
                  />
                  <span className='text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Accuracy Declaration *
                  </span>
                </label>

                <label className='flex items-start space-x-3'>
                  <input
                    type='checkbox'
                    name='authorityStatement'
                    required
                    className='mt-1 h-4 w-4'
                  />
                  <span className='text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Authority Statement *
                  </span>
                </label>
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
                placeholder='Any additional relevant information...'
              />
            </div>

            {/* WARNING */}
            <div className='border border-red-500 bg-red-500/10 p-4 dark:bg-red-950/20'>
              <div className='flex items-start space-x-3'>
                <AlertTriangle className='mt-0.5 h-5 w-5 text-red-600 dark:text-red-500' />
                <div>
                  <p className='font-bold text-red-700 dark:text-red-400'>
                    PENALTY OF PERJURY WARNING
                  </p>
                  <p className='mt-1 text-sm text-red-700 dark:text-red-300'>
                    <strong>18 U.S.C. § 1746</strong>: False statements made under penalty of
                    perjury are punishable by fines and/or imprisonment up to 5 years. Do not
                    submit false claims. By submitting, you agree to our{' '}
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
                SUBMIT DMCA NOTICE
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
