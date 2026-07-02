import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';
import { submitAbuseReport } from '@/services/legal/submission';

export const metadata: Metadata = {
  title: 'Abuse Report | UnTelevised Media',
  description:
    'Report abusive content, harassment, or misconduct on UnTelevised Media. This is our official reporting channel.',
};

async function handleAbuseReport(formData: FormData) {
  'use server';
  const data = Object.fromEntries(formData);
  await submitAbuseReport(data);
}

export default function AbuseReportPage() {
  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* HERO */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-16 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                ABUSE REPORT
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-5xl'>
              REPORT ABUSE & MISCONDUCT
            </h2>
            <p className='mb-4 text-xl leading-relaxed text-slate-700 dark:text-slate-300'>
              This is the official channel for reporting abusive content, harassment, threats, or
              other misconduct on UnTelevised Media platforms. Your report will be reviewed by our
              Trust & Safety team.
            </p>
            <p className='text-lg text-slate-600 dark:text-slate-400'>
              <strong>IMPORTANT:</strong> This form is the ONLY official method through which abuse
              reports will be considered. Any reports made through other channels will not be
              processed. If legal action is taken before using this form, we will not honor such
              requests.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT WE INVESTIGATE */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                TYPES OF ABUSE WE INVESTIGATE
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            {[
              { title: 'Harassment & Threats', desc: 'Threatening language, repeated targeting, doxxing' },
              { title: 'Hate Speech', desc: 'Content targeting protected groups' },
              { title: 'Misinformation Abuse', desc: 'Deliberate creation of false harmful content' },
              { title: 'Sexual Content', desc: 'Non-consensual intimate content, solicitation' },
              { title: 'Violence & Harm', desc: 'Content promoting violence or self-harm' },
              { title: 'Spam & Manipulation', desc: 'Coordinated inauthentic behavior' },
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
                SUBMIT YOUR REPORT
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <form action={handleAbuseReport} className='space-y-6'>
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
                    name='reporterName'
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
                    name='reporterEmail'
                    required
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='your.email@example.com'
                  />
                </div>
              </div>

              <div className='mt-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Phone (Optional)
                </label>
                <input
                  type='tel'
                  name='reporterPhone'
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Your phone number'
                />
              </div>
            </div>

            {/* Incident Details */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                INCIDENT DETAILS
              </h4>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Type of Abuse *
                </label>
                <select
                  name='incidentType'
                  required
                  defaultValue='harassment'
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                >
                  <option value='harassment'>Harassment or Targeted Attack</option>
                  <option value='hate'>Hate Speech</option>
                  <option value='threats'>Threats or Violence</option>
                  <option value='sexual'>Sexual or Intimate Content</option>
                  <option value='spam'>Spam or Manipulation</option>
                  <option value='impersonation'>Impersonation</option>
                  <option value='other'>Other</option>
                </select>
              </div>

              <div className='grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Name/Account Being Reported *
                  </label>
                  <input
                    type='text'
                    name='targetName'
                    required
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    placeholder='Username or name of reported account'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                    Date of Incident *
                  </label>
                  <input
                    type='date'
                    name='dateOfIncident'
                    required
                    className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  />
                </div>
              </div>

              <div className='mt-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  URL/Link to Content (if applicable)
                </label>
                <input
                  type='url'
                  name='targetUrl'
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='https://...'
                />
              </div>
            </div>

            {/* Content Details */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <h4 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                CONTENT & CONTEXT
              </h4>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Description of the Abuse *
                </label>
                <textarea
                  name='contentDetails'
                  required
                  rows={6}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Describe the abusive content or behavior in detail...'
                />
              </div>

              <div className='mb-6'>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Who is Affected By This?
                </label>
                <textarea
                  name='affectedParties'
                  rows={3}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Who is affected by this content? (yourself, others, specific groups, etc.)'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  Evidence URLs (Screenshots, archives, etc.)
                </label>
                <textarea
                  name='evidenceUrls'
                  rows={3}
                  className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                  placeholder='Links to evidence, archives, screenshots (one per line)'
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className='border-l-4 border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950'>
              <label className='mb-2 block text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                Additional Information (Optional)
              </label>
              <textarea
                name='additionalInfo'
                rows={4}
                className='w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                placeholder='Any additional context or information...'
              />
            </div>

            {/* Warning */}
            <div className='border border-yellow-500 bg-yellow-500/10 p-4 dark:bg-yellow-950/20'>
              <div className='flex items-start space-x-3'>
                <AlertTriangle className='mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-500' />
                <div>
                  <p className='font-bold text-yellow-700 dark:text-yellow-400'>IMPORTANT</p>
                  <p className='mt-1 text-sm text-yellow-700 dark:text-yellow-300'>
                    This form is the ONLY official abuse reporting channel. False or frivolous
                    reports may result in your account restrictions. By submitting this report, you
                    agree to the terms in our{' '}
                    <Link href='/legal/rights' className='font-bold underline hover:no-underline'>
                      Rights & Protections Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className='flex gap-4'>
              <button
                type='submit'
                className='flex-1 bg-untele px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
              >
                SUBMIT REPORT
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

      {/* PROCESS SECTION */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                OUR REVIEW PROCESS
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='space-y-6'>
            {[
              {
                step: '1',
                title: 'SUBMISSION',
                desc: 'You submit a report through this official form',
              },
              {
                step: '2',
                title: 'REVIEW',
                desc: 'Our Trust & Safety team reviews the report within 7 days',
              },
              {
                step: '3',
                title: 'INVESTIGATION',
                desc: 'We investigate the claims and determine appropriate action',
              },
              {
                step: '4',
                title: 'ACTION',
                desc: 'We take action (warning, suspension, removal, etc.) if warranted',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className='border-l-4 border-untele bg-white p-6 dark:bg-black'>
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
    </div>
  );
}
