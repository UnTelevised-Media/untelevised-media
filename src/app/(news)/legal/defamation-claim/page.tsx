import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';
import { submitDefamationClaim } from '@/services/legal/submission';

export const metadata: Metadata = {
  title: 'Defamation Claim | UnTelevised Media',
  description: 'Submit a defamation claim. This is the official channel for defamation-related complaints.',
};

async function handleDefamationClaim(formData: FormData) {
  'use server';
  const data = Object.fromEntries(formData);
  await submitDefamationClaim(data);
}

export default function DefamationClaimPage() {
  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* HERO */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-16 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                DEFAMATION CLAIM
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-5xl'>
              REPORT FALSE STATEMENTS
            </h2>
            <p className='mb-4 text-xl leading-relaxed text-slate-700 dark:text-slate-300'>
              If you believe UnTelevised Media has published false statements of fact that have
              damaged your reputation, submit a defamation claim through this official form. This
              is the ONLY method through which defamation claims will be considered.
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
                SUBMIT YOUR CLAIM
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <form action={handleDefamationClaim} className='space-y-6'>
            {/* CLAIMANT INFO */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                YOUR INFORMATION
              </h4>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Are you submitting as? *
                </label>
                <select
                  name='claimantType'
                  required
                  defaultValue='individual'
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                >
                  <option value='individual'>Individual</option>
                  <option value='organization'>Organization/Entity</option>
                  <option value='attorney'>Attorney/Legal Representative</option>
                </select>
              </div>

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
                    placeholder='Your name'
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

            {/* AFFECTED PARTY */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                AFFECTED PARTY
              </h4>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Name of Person/Entity Defamed *
                </label>
                <input
                  type='text'
                  name='affectedPartyName'
                  required
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Name of person or organization'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Entity/Organization (if applicable)
                </label>
                <input
                  type='text'
                  name='affectedPartyEntity'
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Company or organization name'
                />
              </div>
            </div>

            {/* DEFAMATORY STATEMENTS */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                THE FALSE STATEMENTS
              </h4>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  URL of Article/Content *
                </label>
                <input
                  type='url'
                  name='defamatoryContentUrl'
                  required
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='https://untelevised.media/...'
                />
              </div>

              <div className='mb-6 grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Date Published *
                  </label>
                  <input
                    type='date'
                    name='publicationDate'
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

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Specific False Statements *
                </label>
                <textarea
                  name='statementsInQuestion'
                  required
                  rows={5}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Quote the specific statements you claim are false (include context)'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Why These Statements Are False *
                </label>
                <textarea
                  name='falsityBasis'
                  required
                  rows={5}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Explain in detail why these statements are false. Provide evidence or documentation.'
                />
              </div>
            </div>

            {/* DAMAGES */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                HARM & DAMAGES
              </h4>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  How Have You Been Harmed? *
                </label>
                <textarea
                  name='injuryDetails'
                  required
                  rows={4}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Describe how the false statements have harmed you...'
                />
              </div>

              <div className='grid gap-6 md:grid-cols-3'>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Economic Damages
                  </label>
                  <input
                    type='text'
                    name='economicDamages'
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='$0.00'
                  />
                  <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Lost income, business losses</p>
                </div>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Reputational Damages
                  </label>
                  <input
                    type='text'
                    name='reputationalDamages'
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='$0.00'
                  />
                  <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Reputation harm, dignity</p>
                </div>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Emotional Distress
                  </label>
                  <input
                    type='text'
                    name='emotionalDamages'
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='$0.00'
                  />
                  <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Pain and suffering</p>
                </div>
              </div>
            </div>

            {/* PRIOR ACTIONS */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                PRIOR ACTIONS
              </h4>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Have You Previously Contacted Us About This? *
                </label>
                <select
                  name='priorNotifications'
                  required
                  defaultValue=''
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                >
                  <option value=''>Select...</option>
                  <option value='no'>No</option>
                  <option value='yes-email'>Yes - via email</option>
                  <option value='yes-phone'>Yes - via phone</option>
                  <option value='yes-other'>Yes - other method</option>
                </select>
              </div>

              <div>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Retractions or Corrections Requested
                </label>
                <textarea
                  name='retractionsRequested'
                  rows={3}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Have you requested retractions or corrections? When and how?'
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
                placeholder='Any additional relevant information...'
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
