// src/app/(user)/careers/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { PortableText } from '@portabletext/react';
import { RichTextComponents } from '@/components/providers/RichTextComponents';
import { sanityFetch } from '@/lib/sanity/lib/live';
import { queryActiveJobListings } from '@/lib/sanity/lib/queries';
import { ContributorApplicationForm } from '@/components/careers/ContributorApplicationForm';
import formatDate from '@/util/formatDate';
import { Briefcase, MapPin, Clock, DollarSign } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Careers | UnTelevised Media',
  description:
    'Join the UnTelevised Media team. Open positions for journalists, photographers, videographers, and more. We are always looking for passionate storytellers.',
  alternates: {
    canonical: 'https://www.untelevised.media/careers',
  },
  openGraph: {
    title: 'Careers | UnTelevised Media',
    description:
      'Join the UnTelevised Media team. We are always looking for passionate journalists, photographers, and storytellers.',
  },
};

interface JobListing {
  _id: string;
  title: string;
  slug: { current: string };
  department?: string;
  type?: string;
  location?: string;
  compensation?: string;
  description?: unknown[];
  requirements?: string[];
  closingDate?: string;
}

const DEPT_LABELS: Record<string, string> = {
  editorial: 'Editorial',
  photography: 'Photography',
  video: 'Video',
  technology: 'Technology',
  operations: 'Operations',
  community: 'Community',
};

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-Time',
  'part-time': 'Part-Time',
  freelance: 'Freelance',
  volunteer: 'Volunteer',
};

export default async function CareersPage() {
  const today = new Date().toISOString().split('T')[0];

  let listings: JobListing[] = [];
  try {
    const { data } = await sanityFetch({
      query: queryActiveJobListings,
      params: { today },
      tags: ['jobListing'],
    });
    listings = data ?? [];
  } catch {
    // Silently fall back to general application if fetch fails
  }

  const hasListings = listings.length > 0;

  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* HERO */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-16 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-5xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                CAREERS
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='max-w-3xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-5xl'>
              WRITE FOR THE RESISTANCE
            </h2>
            <p className='mb-4 text-xl leading-relaxed text-slate-700 dark:text-slate-300'>
              We&rsquo;re building an independent media outlet that covers the stories corporate
              press won&rsquo;t touch. We need journalists, photographers, videographers, and
              community organizers who believe in people-first reporting.
            </p>
            <p className='text-lg text-slate-600 dark:text-slate-400'>
              No experience required — only commitment, curiosity, and courage.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section className='border-b border-slate-300 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-5xl px-4'>
          <div className='grid gap-6 sm:grid-cols-3'>
            {[
              {
                title: 'EDITORIAL FREEDOM',
                body: 'Pitch any story. No corporate advertiser will kill your piece. Your byline, your voice.',
              },
              {
                title: 'PORTFOLIO BUILDING',
                body: 'Published work on a growing independent outlet. Real clips, real audience, real impact.',
              },
              {
                title: 'GLOBAL REACH',
                body: 'Our coverage reaches readers across 50+ countries. Your work matters beyond your city.',
              },
            ].map(({ title, body }) => (
              <div key={title} className='border-l-4 border-untele bg-white p-5 dark:bg-black'>
                <h3 className='mb-2 text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white'>
                  {title}
                </h3>
                <p className='text-sm text-slate-600 dark:text-slate-400'>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WE'RE LOOKING FOR — position grid */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-5xl px-4'>
          <div className='mb-10 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h2 className='text-lg font-black uppercase tracking-widest text-white'>
                WE&rsquo;RE LOOKING FOR
              </h2>
            </div>
            <div className='h-px flex-1 bg-slate-300 dark:bg-slate-700' />
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {[
              'Article Writer',
              'Article Editor',
              'Video Editor',
              'Live Street Journalist',
              'Social Media Manager',
              'Content Creator',
              'Radio Host',
              'Video Producer',
              'Photographer',
              'Graphic Designer',
              'Web Developer',
              'Research Analyst',
            ].map((role) => (
              <div
                key={role}
                className='border border-slate-200 p-5 transition-colors hover:border-untele dark:border-slate-700'
              >
                <h3 className='mb-2 text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white'>
                  {role}
                </h3>
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  Join our team and help expose the truth through{' '}
                  {role.toLowerCase()} work.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className='mx-auto max-w-5xl px-4 py-12'>
        {/* OPEN POSITIONS */}
        {hasListings && (
          <section className='mb-14'>
            <div className='mb-8 flex items-center space-x-4'>
              <div className='bg-untele px-4 py-2'>
                <h2 className='text-lg font-black uppercase tracking-widest text-white'>
                  OPEN POSITIONS
                </h2>
              </div>
              <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
              <span className='text-sm font-bold uppercase tracking-widest text-slate-500'>
                {listings.length} {listings.length === 1 ? 'ROLE' : 'ROLES'}
              </span>
            </div>

            <div className='space-y-4'>
              {listings.map((job) => (
                <details
                  key={job._id}
                  className='group border border-slate-300 open:border-untele dark:border-slate-700'
                >
                  <summary className='flex cursor-pointer list-none items-center justify-between px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-950 [&::-webkit-details-marker]:hidden'>
                    <div className='flex flex-col gap-1'>
                      <span className='text-lg font-black uppercase tracking-wide text-slate-900 dark:text-white'>
                        {job.title}
                      </span>
                      <div className='flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400'>
                        {job.department && (
                          <span className='flex items-center gap-1'>
                            <Briefcase className='h-3 w-3' />
                            {DEPT_LABELS[job.department] ?? job.department}
                          </span>
                        )}
                        {job.type && (
                          <span className='flex items-center gap-1'>
                            <Clock className='h-3 w-3' />
                            {TYPE_LABELS[job.type] ?? job.type}
                          </span>
                        )}
                        {job.location && (
                          <span className='flex items-center gap-1'>
                            <MapPin className='h-3 w-3' />
                            {job.location}
                          </span>
                        )}
                        {job.compensation && (
                          <span className='flex items-center gap-1'>
                            <DollarSign className='h-3 w-3' />
                            {job.compensation}
                          </span>
                        )}
                        {job.closingDate && (
                          <span className='text-amber-600 dark:text-amber-400'>
                            Closes {formatDate(job.closingDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className='ml-4 flex-shrink-0 bg-untele px-4 py-2 text-xs font-black uppercase tracking-widest text-white group-open:bg-slate-700'>
                      <span className='group-open:hidden'>APPLY</span>
                      <span className='hidden group-open:inline'>CLOSE</span>
                    </span>
                  </summary>

                  <div className='border-t border-slate-200 px-6 py-8 dark:border-slate-800'>
                    {job.description && Array.isArray(job.description) && job.description.length > 0 && (
                      <div className='prose prose-slate dark:prose-invert mb-6 max-w-none text-sm'>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <PortableText value={job.description as any} components={RichTextComponents} />
                      </div>
                    )}

                    {job.requirements && job.requirements.length > 0 && (
                      <div className='mb-8'>
                        <h4 className='mb-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                          Requirements
                        </h4>
                        <ul className='space-y-2'>
                          {job.requirements.map((req, i) => (
                            <li key={i} className='flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300'>
                              <span className='mt-0.5 h-2 w-2 flex-shrink-0 bg-untele' />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className='border-t border-slate-200 pt-8 dark:border-slate-800'>
                      <div className='mb-6 flex items-center space-x-4'>
                        <div className='bg-untele px-3 py-1'>
                          <h4 className='text-xs font-black uppercase tracking-widest text-white'>
                            APPLY — {job.title}
                          </h4>
                        </div>
                        <div className='h-px flex-1 bg-slate-300 dark:bg-slate-700' />
                      </div>
                      <ContributorApplicationForm prefilledPosition={job.title} />
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* GENERAL APPLICATION */}
        <section className='border border-slate-300 dark:border-slate-700'>
          <div className='border-b border-slate-300 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-950'>
            <div className='flex items-center space-x-4'>
              <div className='bg-untele px-3 py-1'>
                <h2 className='text-lg font-black uppercase tracking-widest text-white'>
                  {hasListings ? 'GENERAL APPLICATION' : "WE'RE ALWAYS HIRING"}
                </h2>
              </div>
            </div>
          </div>
          <div className='px-6 py-8'>
            <p className='mb-8 text-slate-600 dark:text-slate-400'>
              {hasListings
                ? "Don't see a role that fits? Submit a general application and we'll keep it on file for when the right opportunity opens."
                : "We don't have specific open roles right now, but we're always looking for talented journalists, photographers, and storytellers. Submit a general application and we'll be in touch."}
            </p>
            <ContributorApplicationForm />
          </div>
        </section>

      </div>
    </div>
  );
}
