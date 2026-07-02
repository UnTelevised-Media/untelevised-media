import React from 'react';
import Link from 'next/link';
import { Upload, AlertTriangle, FileVideo, Image } from 'lucide-react';
import type { Metadata } from 'next';
import { submitMedia } from '@/services/syndication/submission';

export const metadata: Metadata = {
  title: 'Submit Media | UnTelevised Media',
  description:
    'Submit your photos or videos to UnTelevised Media. Share your story and help us expose the truth.',
};

async function handleMediaSubmit(formData: FormData) {
  'use server';
  const data = Object.fromEntries(formData);
  await submitMedia(data);
}

export default function SubmitMediaPage() {
  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* HERO */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-16 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                SUBMIT MEDIA
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-5xl'>
              SHARE YOUR STORY
            </h2>
            <p className='mb-4 text-xl leading-relaxed text-slate-700 dark:text-slate-300'>
              Got photos or videos the mainstream media won&rsquo;t show? Submit them here. Your
              media helps expose the truth.
            </p>
            <p className='text-lg text-slate-600 dark:text-slate-400'>
              <strong>Note:</strong> This is the ONLY official method for media submissions. All
              submissions are treated as a gift to UnTelevised Media.
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
                SUBMIT YOUR MEDIA
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <form action={handleMediaSubmit} className='space-y-6'>
            {/* YOUR INFORMATION */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                YOUR INFORMATION
              </h4>

              <div className='grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Name *
                  </label>
                  <input
                    type='text'
                    name='submitterName'
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
                    name='submitterEmail'
                    required
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='your.email@example.com'
                  />
                </div>
              </div>

              <div className='mt-6 grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Phone (Optional)
                  </label>
                  <input
                    type='tel'
                    name='submitterPhone'
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='Your phone number'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Location (Optional)
                  </label>
                  <input
                    type='text'
                    name='submitterLocation'
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='City, State/Country'
                  />
                </div>
              </div>
            </div>

            {/* MEDIA DETAILS */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                MEDIA DETAILS
              </h4>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Type of Media *
                </label>
                <select
                  name='mediaType'
                  required
                  defaultValue='photo'
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                >
                  <option value='photo'>Photo/Image</option>
                  <option value='video'>Video</option>
                  <option value='mixed'>Both Photo & Video</option>
                </select>
              </div>

              <div className='mb-6 grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Date Captured *
                  </label>
                  <input
                    type='date'
                    name='dateCaptured'
                    required
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Location of Media *
                  </label>
                  <input
                    type='text'
                    name='location'
                    required
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='Where was this taken?'
                  />
                </div>
              </div>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  What Does This Media Show? *
                </label>
                <textarea
                  name='mediaDescription'
                  required
                  rows={4}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Describe what your media shows...'
                />
              </div>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Context & Story *
                </label>
                <textarea
                  name='context'
                  required
                  rows={4}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Provide context about what happened, when, why it matters...'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Additional Details (Optional)
                </label>
                <textarea
                  name='additionalDetails'
                  rows={3}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Any other relevant information...'
                />
              </div>
            </div>

            {/* RIGHTS CHOICE */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-6 text-lg font-bold text-slate-900 dark:text-white'>
                MEDIA RIGHTS
              </h4>

              <div className='space-y-4'>
                <label className='flex cursor-pointer items-start space-x-4 rounded border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-black'>
                  <input
                    type='radio'
                    name='allowCommercialUse'
                    value='no'
                    required
                    defaultChecked
                    className='mt-1 h-4 w-4'
                  />
                  <div>
                    <p className='font-bold text-slate-900 dark:text-white'>
                      Use & Post Only (Recommended)
                    </p>
                    <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
                      UnTelevised can use and post your media for journalism, but cannot sell it.
                    </p>
                  </div>
                </label>

                <label className='flex cursor-pointer items-start space-x-4 rounded border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-black'>
                  <input
                    type='radio'
                    name='allowCommercialUse'
                    value='yes'
                    className='mt-1 h-4 w-4'
                  />
                  <div>
                    <p className='font-bold text-slate-900 dark:text-white'>
                      Allow Commercial Use
                    </p>
                    <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
                      UnTelevised may sell your media. You receive no return.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* TERMS AGREEMENT */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                LEGAL AGREEMENT
              </h4>

              <label className='mb-6 flex items-start space-x-3'>
                <input
                  type='checkbox'
                  name='agreeToTerms'
                  required
                  className='mt-1 h-4 w-4'
                />
                <span className='text-sm text-slate-700 dark:text-slate-300'>
                  I agree to the{' '}
                  <Link href='/legal/rights' className='font-bold text-untele hover:underline'>
                    Rights & Protections Policy
                  </Link>{' '}
                  and confirm that I own or have permission to submit this media.
                </span>
              </label>
            </div>

            {/* WARNING */}
            <div className='border border-yellow-500 bg-yellow-500/10 p-4 dark:bg-yellow-950/20'>
              <div className='flex items-start space-x-3'>
                <AlertTriangle className='mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-500' />
                <div>
                  <p className='font-bold text-yellow-700 dark:text-yellow-400'>IMPORTANT</p>
                  <p className='mt-1 text-sm text-yellow-700 dark:text-yellow-300'>
                    By submitting media, you represent that you own it or have all necessary rights.
                    See our{' '}
                    <Link href='/legal/rights' className='font-bold underline hover:no-underline'>
                      Rights & Protections Policy
                    </Link>{' '}
                    for full terms.
                  </p>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type='submit'
              className='w-full bg-untele px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
            >
              SUBMIT MEDIA
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
