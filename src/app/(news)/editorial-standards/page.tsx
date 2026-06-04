// src/app/(user)/editorial-standards/page.tsx
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editorial Standards | UnTelevised Media',
  description:
    'Our editorial principles, sourcing standards, verification process, corrections policy, and commitment to independent journalism.',
  openGraph: {
    title: 'Editorial Standards | UnTelevised Media',
    description:
      'Our editorial principles, sourcing standards, verification process, corrections policy, and commitment to independent journalism.',
  },
};

export default function EditorialStandardsPage() {
  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* HERO */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-16 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                EDITORIAL STANDARDS
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-5xl'>
              THE STANDARDS THAT GOVERN OUR JOURNALISM
            </h2>
            <p className='text-xl leading-relaxed text-slate-700 dark:text-slate-300'>
              Independent journalism carries a responsibility that corporate media has long
              abandoned. These are the standards we hold ourselves to — in every story, every
              source, every correction.
            </p>
          </div>
        </div>
      </section>

      {/* OUR COMMITMENT */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='grid gap-12 lg:grid-cols-2'>
            <div>
              <div className='mb-6 flex items-center space-x-4'>
                <div className='bg-untele px-3 py-1'>
                  <h3 className='text-sm font-black uppercase tracking-widest text-white'>
                    OUR COMMITMENT
                  </h3>
                </div>
                <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
              </div>
              <h4 className='mb-4 text-2xl font-bold text-slate-900 dark:text-white'>
                ACCURACY ABOVE ALL ELSE
              </h4>
              <p className='mb-4 leading-relaxed text-slate-700 dark:text-slate-300'>
                We are committed to publishing accurate, fair, and independently verified
                information. Before any story is published, claims are sourced, cross-referenced,
                and reviewed. We do not publish rumors, speculation, or unverified allegations as
                fact.
              </p>
              <p className='leading-relaxed text-slate-700 dark:text-slate-300'>
                When we get something wrong, we say so — clearly, promptly, and in the same
                location as the original error. We do not quietly edit articles without disclosure,
                and we do not delete reporting to escape accountability.
              </p>
            </div>

            <div className='border-l-4 border-untele bg-slate-100 p-6 dark:bg-black'>
              <blockquote className='text-lg italic text-slate-800 dark:text-slate-200'>
                &ldquo;A free press can be good or bad, but, most certainly, without freedom it
                will never be anything but bad. Independence is not a privilege — it is the minimum
                condition for honest journalism.&rdquo;
              </blockquote>
              <cite className='mt-4 block text-sm font-bold uppercase tracking-wide text-untele'>
                — UnTelevised Editorial Board
              </cite>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PRINCIPLES */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                CORE PRINCIPLES
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {[
              {
                n: '01',
                title: 'ACCURACY',
                body: 'Every factual claim must be verifiable. We use primary sources wherever possible, disclose when secondary sources are relied upon, and correct errors as soon as they are identified.',
              },
              {
                n: '02',
                title: 'INDEPENDENCE',
                body: 'Our editorial decisions are made solely by our journalists and editors. No advertiser, donor, government, or external organization has any influence over what we cover or how we cover it.',
              },
              {
                n: '03',
                title: 'FAIRNESS',
                body: 'All parties directly named in a story are given reasonable opportunity to respond before publication. We represent all sides with equal rigor, not equal credulity.',
              },
              {
                n: '04',
                title: 'VERIFICATION',
                body: 'We do not publish unverified information as fact. Claims are tested against documents, on-record sources, and official records. Anonymous sources are used sparingly and only when essential.',
              },
              {
                n: '05',
                title: 'TRANSPARENCY',
                body: 'We disclose our sources, methodology, and funding to the degree we safely can. Where sources must be protected, we explain why rather than simply omitting the explanation.',
              },
              {
                n: '06',
                title: 'ACCOUNTABILITY',
                body: 'We hold ourselves to the same scrutiny we apply to those we cover. Errors are acknowledged and corrected publicly. Staff who violate these standards are held responsible.',
              },
            ].map(({ n, title, body }) => (
              <div
                key={n}
                className='flex h-full flex-col border border-slate-300 bg-slate-50 p-6 transition-all hover:border-untele dark:border-slate-700 dark:bg-slate-950'
              >
                <div className='mb-4 flex h-12 w-12 items-center justify-center bg-untele text-sm font-black text-white'>
                  {n}
                </div>
                <h4 className='mb-3 text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  {title}
                </h4>
                <p className='flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300'>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VERIFICATION PROCESS */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                VERIFICATION PROCESS
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-8 md:grid-cols-2'>
            {[
              {
                title: 'PRIMARY SOURCING',
                body: 'We prioritize first-hand documentation — court filings, government records, leaked documents, on-camera statements, and interviews with direct witnesses. Secondary sources are cited and their limitations acknowledged.',
              },
              {
                title: 'MULTI-SOURCE REQUIREMENT',
                body: 'Significant factual claims require at least two independent sources. Single-source claims are labeled as such, and readers are informed when only one source could be obtained.',
              },
              {
                title: 'DOCUMENT VERIFICATION',
                body: 'Documents are verified for authenticity before publication. Where possible, forensic or expert review is sought. We do not publish leaked materials we cannot authenticate.',
              },
              {
                title: 'RIGHT OF REPLY',
                body: 'Individuals and organizations who are the subject of critical coverage are contacted and given adequate time to respond. Their response — or refusal to respond — is included in the story.',
              },
            ].map(({ title, body }) => (
              <div
                key={title}
                className='flex h-full flex-col border-l-4 border-untele bg-slate-100 p-6 dark:bg-black'
              >
                <h4 className='mb-3 text-lg font-bold text-slate-900 dark:text-white'>{title}</h4>
                <p className='flex-1 text-slate-700 dark:text-slate-300'>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOURCE STANDARDS */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='grid gap-12 lg:grid-cols-2'>
            <div>
              <div className='mb-6 flex items-center space-x-4'>
                <div className='bg-untele px-3 py-1'>
                  <h3 className='text-sm font-black uppercase tracking-widest text-white'>
                    SOURCE STANDARDS
                  </h3>
                </div>
                <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
              </div>
              <h4 className='mb-4 text-2xl font-bold text-slate-900 dark:text-white'>
                HOW WE USE AND PROTECT SOURCES
              </h4>
              <div className='space-y-4 text-slate-700 dark:text-slate-300'>
                <p className='leading-relaxed'>
                  Named, on-record sources are always preferred. Anonymous sources are granted
                  anonymity only when they provide essential information that cannot be obtained
                  otherwise, and when the story is of significant public interest.
                </p>
                <p className='leading-relaxed'>
                  Editors must know the identity of any anonymous source before a story is
                  approved. The reason anonymity was granted is disclosed in the published article.
                  We do not grant anonymity to sources attacking individuals from hiding.
                </p>
                <p className='leading-relaxed'>
                  We protect whistleblowers. All source communications may be made via our{' '}
                  <Link href='/secure-contact' className='font-bold text-untele hover:underline'>
                    Secure Contact
                  </Link>{' '}
                  or{' '}
                  <Link href='/whistleblower' className='font-bold text-untele hover:underline'>
                    Whistleblower Portal
                  </Link>
                  , both of which use end-to-end encryption.
                </p>
              </div>
            </div>

            <div>
              <div className='mb-6 flex items-center space-x-4'>
                <div className='bg-untele px-3 py-1'>
                  <h3 className='text-sm font-black uppercase tracking-widest text-white'>
                    SOURCE TRANSPARENCY PANEL
                  </h3>
                </div>
                <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
              </div>
              <p className='mb-4 leading-relaxed text-slate-700 dark:text-slate-300'>
                Every article and live event on UnTelevised Media includes a collapsible{' '}
                <strong>Sources &amp; Methodology</strong> panel. This panel discloses:
              </p>
              <ul className='space-y-3'>
                {[
                  'All named sources with their type (document, interview, statement, data, media, on-scene)',
                  'The URL or reference location for publicly accessible sources',
                  'A flag when a source is anonymous, without revealing their identity',
                  'Our methodology — how we gathered and verified the information',
                ].map((item) => (
                  <li key={item} className='flex items-start space-x-3'>
                    <div className='mt-1.5 h-2 w-2 flex-shrink-0 bg-untele' />
                    <span className='text-sm text-slate-700 dark:text-slate-300'>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CORRECTIONS POLICY */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                CORRECTIONS POLICY
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-8 lg:grid-cols-2'>
            <div className='space-y-6'>
              <p className='leading-relaxed text-slate-700 dark:text-slate-300'>
                Errors happen. What separates honest journalism from dishonest journalism is what
                you do when they do. We publish corrections prominently, on the original article,
                as soon as an error is confirmed — not buried, not deleted, not silently edited.
              </p>
              <p className='leading-relaxed text-slate-700 dark:text-slate-300'>
                We use four correction types, each displayed on the article with clear visual
                labeling:
              </p>

              <div className='space-y-3'>
                {[
                  {
                    color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/20',
                    label: 'CORRECTION',
                    desc: 'A factual error was published. The error is described and the correct information is provided.',
                  },
                  {
                    color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
                    label: 'CLARIFICATION',
                    desc: 'The original reporting was technically accurate but misleading or incomplete. Additional context is added.',
                  },
                  {
                    color: 'border-green-500 bg-green-50 dark:bg-green-950/20',
                    label: 'UPDATE',
                    desc: 'Significant new information has emerged that changes the picture. The update is noted with a timestamp.',
                  },
                  {
                    color: 'border-red-600 bg-red-50 dark:bg-red-950/20',
                    label: 'RETRACTION',
                    desc: 'The story cannot be supported in whole or in significant part and has been retracted. The title is marked and the reason is published.',
                  },
                ].map(({ color, label, desc }) => (
                  <div key={label} className={`border-l-4 p-4 ${color}`}>
                    <p className='mb-1 text-sm font-black uppercase tracking-wide text-slate-900 dark:text-slate-100'>
                      {label}
                    </p>
                    <p className='text-sm text-slate-700 dark:text-slate-300'>{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className='border-2 border-untele bg-gradient-to-b from-untele/10 to-slate-100 p-8 dark:to-black'>
              <h5 className='mb-4 text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white'>
                SUBMIT A CORRECTION REQUEST
              </h5>
              <p className='mb-6 text-slate-700 dark:text-slate-300'>
                If you believe we have published inaccurate information, we want to know. All
                correction requests are reviewed by a senior editor within 24 hours.
              </p>
              <div className='space-y-4'>
                <a
                  href='mailto:corrections@untelevised.media'
                  className='block w-full bg-untele py-4 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
                >
                  EMAIL CORRECTIONS DESK
                </a>
                <Link
                  href='/secure-contact'
                  className='block w-full border-2 border-black bg-transparent py-4 text-center text-sm font-black uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black'
                >
                  SECURE CONTACT FORM
                </Link>
              </div>
              <p className='mt-6 text-xs text-slate-500 dark:text-slate-400'>
                Please include the URL of the article, the specific claim you believe is incorrect,
                and any supporting documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INDEPENDENCE & CONFLICTS */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                INDEPENDENCE &amp; CONFLICTS OF INTEREST
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {[
              {
                title: 'EDITORIAL FIREWALL',
                body: 'Advertisers and donors have no access to our editorial process. Commercial relationships are disclosed in our financial transparency reports. No story is killed, altered, or commissioned due to commercial pressure.',
              },
              {
                title: 'STAFF DISCLOSURES',
                body: 'Journalists disclose any personal, financial, or political connection to the subjects they cover. Staff cannot report on entities in which they hold financial interests or with which they have personal relationships.',
              },
              {
                title: 'NO POLITICAL ALIGNMENT',
                body: 'We do not endorse political candidates or parties. Staff opinions expressed outside their UnTelevised work are their own and are not editorial positions. We cover all governments and movements with equal critical scrutiny.',
              },
              {
                title: 'FUNDING TRANSPARENCY',
                body: 'UnTelevised Media is reader-funded. We do not accept government grants, political donations, or funding from entities we cover. Our financial model is disclosed to readers.',
              },
              {
                title: 'NATIVE ADVERTISING',
                body: 'Sponsored or promoted content is always clearly labeled and visually distinct from editorial content. Paid partnerships never influence editorial decisions or story selection.',
              },
              {
                title: 'OUTSIDE EMPLOYMENT',
                body: 'Staff must disclose any outside employment or consulting arrangements. Secondary work that creates a conflict with their reporting responsibilities is not permitted.',
              },
            ].map(({ title, body }) => (
              <div
                key={title}
                className='flex h-full flex-col border border-slate-300 bg-slate-50 p-6 transition-all hover:border-untele dark:border-slate-700 dark:bg-slate-950'
              >
                <h4 className='mb-3 text-base font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                  {title}
                </h4>
                <p className='flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300'>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SENSITIVE REPORTING */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                SENSITIVE REPORTING
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-8 md:grid-cols-2'>
            {[
              {
                title: 'TRAUMA & GRAPHIC CONTENT',
                body: 'We assess whether publishing graphic or disturbing content serves a genuine public interest that outweighs potential harm. When such content is published, it is preceded by a clear content warning and contextualized appropriately.',
              },
              {
                title: 'SUICIDE & SELF-HARM',
                body: 'We follow established safe messaging guidelines for reporting on suicide and self-harm. We do not publish methods or details that could encourage imitation, and we include crisis resources where relevant.',
              },
              {
                title: 'MINORS',
                body: 'The identities of minors are protected except where they themselves, their guardians, or the public record has already established them — and even then, only when their inclusion is essential to the story.',
              },
              {
                title: 'NATIONAL SECURITY',
                body: 'When reporting involves national security matters, we consult with relevant parties where doing so does not compromise our sources or the public interest. We do not publish information we believe would cause direct, immediate harm to individuals.',
              },
            ].map(({ title, body }) => (
              <div
                key={title}
                className='flex h-full flex-col border-l-4 border-untele bg-slate-100 p-6 dark:bg-black'
              >
                <h4 className='mb-3 text-lg font-bold text-slate-900 dark:text-white'>{title}</h4>
                <p className='flex-1 text-slate-700 dark:text-slate-300'>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPLAINTS & CONTACT */}
      <section className='border-t-4 border-untele bg-gradient-to-b from-untele/20 to-white py-16 dark:to-black'>
        <div className='mx-auto max-w-4xl px-4 text-center'>
          <h3 className='mb-4 text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-white'>
            QUESTIONS ABOUT OUR STANDARDS?
          </h3>
          <p className='mb-8 text-lg text-slate-700 dark:text-slate-300'>
            We are accountable to our readers. If you have a concern about our reporting, our
            methods, or a potential violation of these standards — contact us.
          </p>
          <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
            <a
              href='mailto:editorial@untelevised.media'
              className='bg-untele px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
            >
              EMAIL EDITORIAL BOARD
            </a>
            <Link
              href='/about'
              className='border-2 border-black bg-transparent px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black'
            >
              ABOUT US
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
