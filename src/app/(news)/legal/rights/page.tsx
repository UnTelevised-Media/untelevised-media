import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Shield, Scale, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rights & Protections | UnTelevised Media',
  description:
    'Complete guide to rights, protections, and legal terms for media submissions, commercial licensing, and platform usage.',
};

export default function RightsPage() {
  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* HERO */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-16 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                RIGHTS & PROTECTIONS
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-5xl'>
              TERMS & LEGAL PROTECTIONS
            </h2>
            <p className='text-xl leading-relaxed text-slate-700 dark:text-slate-300'>
              This page explains the rights, protections, and legal obligations for everyone
              submitting media, filing complaints, or entering commercial agreements with
              UnTelevised Media.
            </p>
          </div>
        </div>
      </section>

      {/* BINDING NATURE OF SUBMISSIONS */}
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
              SUBMITTING MEDIA OR COMPLAINTS = ACCEPTING THESE TERMS
            </h4>
            <p className='mb-4 text-slate-700 dark:text-slate-300'>
              By submitting any form on UnTelevised Media—whether media, a legal complaint, or
              commercial solicitation—you acknowledge that:
            </p>
            <ul className='space-y-3'>
              {[
                'You have read and understand these Rights & Protections',
                'You are entering into a binding legal agreement with UnTelevised Media',
                'All information you provide is true, accurate, and complete',
                'You own all rights to any media or content you submit',
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

      {/* MEDIA SUBMISSIONS */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                MEDIA SUBMISSIONS (GIFTS)
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='space-y-6'>
            <div className='border-l-4 border-untele bg-slate-50 p-6 dark:bg-slate-950'>
              <h4 className='mb-3 text-lg font-bold text-slate-900 dark:text-white'>
                WHAT HAPPENS WITH GIFT SUBMISSIONS
              </h4>
              <p className='mb-4 text-slate-700 dark:text-slate-300'>
                When you submit media through our{' '}
                <Link href='/syndication/submit-media' className='font-bold text-untele hover:underline'>
                  Submit Media
                </Link>{' '}
                form, you are giving UnTelevised Media a gift. You specifically choose one of two
                options:
              </p>

              <div className='space-y-4'>
                <div className='border-l-4 border-green-500 bg-green-50 p-4 dark:border-green-600 dark:bg-green-950/20'>
                  <p className='font-bold text-green-700 dark:text-green-400'>OPTION 1: USE & POST ONLY</p>
                  <p className='mt-2 text-sm text-green-700 dark:text-green-300'>
                    UnTelevised may use, post, and distribute your media for journalism and
                    editorial purposes, but cannot sell it. Your media helps expose the truth.
                  </p>
                </div>

                <div className='border-l-4 border-amber-500 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-950/20'>
                  <p className='font-bold text-amber-700 dark:text-amber-400'>OPTION 2: ALLOW COMMERCIAL USE</p>
                  <p className='mt-2 text-sm text-amber-700 dark:text-amber-300'>
                    UnTelevised may use, post, sell, and distribute your media in any way they see
                    fit. You receive no return. This is a complete gift to independent journalism.
                  </p>
                </div>
              </div>
            </div>

            <div className='border-l-4 border-untele bg-slate-50 p-6 dark:bg-slate-950'>
              <h4 className='mb-3 text-lg font-bold text-slate-900 dark:text-white'>
                WHAT YOU GUARANTEE
              </h4>
              <ul className='space-y-2'>
                {[
                  "You own or have full rights to the media submitted",
                  "The media does not infringe anyone else's copyrights or intellectual property",
                  "The media does not violate anyone's privacy or right to their image",
                  'You have permission from anyone identifiable in the media',
                  'The media does not contain stolen, illegally obtained, or hacked information',
                  'You have not submitted the same media elsewhere with conflicting rights restrictions',
                ].map((item, i) => (
                  <li key={i} className='flex items-start space-x-3 text-sm'>
                    <span className='mt-1 h-2 w-2 flex-shrink-0 bg-untele' />
                    <span className='text-slate-700 dark:text-slate-300'>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className='border-l-4 border-red-600 bg-red-50 p-6 dark:border-red-600 dark:bg-red-950/20'>
              <h4 className='mb-3 text-lg font-bold text-red-700 dark:text-red-400'>
                LIABILITY & CONSEQUENCES
              </h4>
              <p className='text-sm text-red-700 dark:text-red-300'>
                If your submission infringes anyone's rights, violates privacy, contains stolen
                information, or is otherwise illegal, you indemnify and hold harmless UnTelevised
                Media from all claims, damages, and legal costs. You are solely responsible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LEGAL COMPLAINTS */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                LEGAL COMPLAINTS & CLAIMS
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='space-y-6'>
            <div className='border-l-4 border-untele bg-white p-6 dark:bg-black'>
              <h4 className='mb-3 text-lg font-bold text-slate-900 dark:text-white'>
                THESE ARE THE ONLY OFFICIAL CHANNELS
              </h4>
              <p className='mb-4 text-slate-700 dark:text-slate-300'>
                UnTelevised Media will ONLY accept and process legal complaints through these
                official forms:
              </p>
              <div className='grid gap-4 md:grid-cols-2'>
                {[
                  { name: 'Abuse Report', url: '/legal/abuse-report' },
                  { name: 'Copyright Claim', url: '/legal/copyright-claim' },
                  { name: 'Defamation Claim', url: '/legal/defamation-claim' },
                  { name: 'DMCA Takedown', url: '/legal/dmca-takedown' },
                ].map(({ name, url }) => (
                  <Link
                    key={name}
                    href={url}
                    className='block border-2 border-untele bg-white p-4 text-center text-sm font-bold uppercase tracking-widest text-untele transition-colors hover:bg-untele hover:text-white dark:bg-black'
                  >
                    {name} →
                  </Link>
                ))}
              </div>
            </div>

            <div className='border-l-4 border-red-600 bg-red-50 p-6 dark:border-red-600 dark:bg-red-950/20'>
              <h4 className='mb-3 text-lg font-bold text-red-700 dark:text-red-400'>
                IF YOU BYPASS THESE FORMS
              </h4>
              <p className='text-sm text-red-700 dark:text-red-300'>
                Any legal action, cease-and-desist letter, lawsuit, or other legal proceeding taken
                without first using the official forms above will be considered non-compliant with
                our process. We will not honor such requests and will not negotiate with parties who
                ignore this policy. We reserve the right to defend against such actions and seek
                damages for frivolous claims.
              </p>
            </div>

            <div className='border-l-4 border-untele bg-white p-6 dark:bg-black'>
              <h4 className='mb-3 text-lg font-bold text-slate-900 dark:text-white'>
                PERJURY & FALSE CLAIMS
              </h4>
              <p className='mb-4 text-sm text-slate-700 dark:text-slate-300'>
                All legal claims require statements made under penalty of perjury. False, frivolous,
                or bad-faith claims are serious:
              </p>
              <ul className='space-y-2'>
                {[
                  '18 U.S.C. § 1746 — False statements under perjury are punishable by fines and up to 5 years imprisonment',
                  'Frivolous copyright claims may expose you to sanctions and attorney fee liability',
                  'Bad-faith defamation claims can result in summary judgment against you',
                  'False DMCA notices create liability under 17 U.S.C. § 512(f)',
                ].map((item, i) => (
                  <li key={i} className='flex items-start space-x-3 text-sm'>
                    <span className='mt-1 h-2 w-2 flex-shrink-0 bg-red-600' />
                    <span className='text-slate-700 dark:text-slate-300'>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* MARKETPLACE & SOLICITATION */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                COMMERCIAL SALES & SOLICITATION
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='space-y-6'>
            <div className='border-l-4 border-untele bg-slate-50 p-6 dark:bg-slate-950'>
              <h4 className='mb-3 text-lg font-bold text-slate-900 dark:text-white'>
                HOW SOLICITATION WORKS
              </h4>
              <p className='mb-4 text-slate-700 dark:text-slate-300'>
                When you submit a{' '}
                <Link href='/syndication/solicitation' className='font-bold text-untele hover:underline'>
                  Media Solicitation
                </Link>{' '}
                to sell your media:
              </p>
              <ul className='space-y-2'>
                {[
                  'You are offering media for sale on terms you specify',
                  'You set the price, licensing terms, and usage restrictions',
                  'UnTelevised facilitates connections between you and potential buyers',
                  'You negotiate directly with interested buyers',
                  'UnTelevised takes a commission only on successful sales',
                  'You control all negotiations and final agreements',
                ].map((item, i) => (
                  <li key={i} className='flex items-start space-x-3 text-sm'>
                    <span className='mt-1 h-2 w-2 flex-shrink-0 bg-untele' />
                    <span className='text-slate-700 dark:text-slate-300'>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className='border-l-4 border-untele bg-slate-50 p-6 dark:bg-slate-950'>
              <h4 className='mb-3 text-lg font-bold text-slate-900 dark:text-white'>
                YOUR OBLIGATIONS
              </h4>
              <ul className='space-y-2'>
                {[
                  "You own all rights to the media you list",
                  "You have permission from anyone identifiable in the media",
                  "You are not selling media you do not have rights to",
                  "You are not listing stolen, hacked, or illegally obtained content",
                  "You are not violating anyone else's intellectual property",
                  "You will not misrepresent the media or its quality",
                  "You will honor agreements with buyers once signed",
                ].map((item, i) => (
                  <li key={i} className='flex items-start space-x-3 text-sm'>
                    <span className='mt-1 h-2 w-2 flex-shrink-0 bg-untele' />
                    <span className='text-slate-700 dark:text-slate-300'>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className='border-l-4 border-red-600 bg-red-50 p-6 dark:border-red-600 dark:bg-red-950/20'>
              <h4 className='mb-3 text-lg font-bold text-red-700 dark:text-red-400'>
                LIABILITY FOR COMMERCIAL SALES
              </h4>
              <p className='text-sm text-red-700 dark:text-red-300'>
                If you sell media you do not own, have not obtained rights for, or that infringes
                someone's copyright or privacy, you are solely liable. You indemnify UnTelevised
                Media and the buyer from all claims. You may be responsible for damages, legal
                fees, and restitution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT LICENSING */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                CONTENT LICENSING TERMS
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='space-y-6'>
            <div className='border-l-4 border-untele bg-white p-6 dark:bg-black'>
              <h4 className='mb-3 text-lg font-bold text-slate-900 dark:text-white'>
                WHEN YOU LICENSE CONTENT FROM US
              </h4>
              <p className='mb-4 text-slate-700 dark:text-slate-300'>
                By licensing any content from UnTelevised Media, you agree to:
              </p>
              <ul className='space-y-2'>
                {[
                  'You will use the content only in accordance with the license granted',
                  'You will provide proper attribution to UnTelevised and original creators',
                  'You will not modify, edit, or recontextualize without permission',
                  'You will not claim ownership of the content',
                  'You will not use content for purposes beyond what the license permits',
                  'You understand that non-compliance may result in legal action',
                ].map((item, i) => (
                  <li key={i} className='flex items-start space-x-3 text-sm'>
                    <span className='mt-1 h-2 w-2 flex-shrink-0 bg-untele' />
                    <span className='text-slate-700 dark:text-slate-300'>{item}</span>
                  </li>
                ))}
              </ul>
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
                title: 'DISPUTE RESOLUTION',
                desc: 'Disagreements about licensing are resolved through negotiation and mediation, not litigation first.',
              },
              {
                title: 'PAYMENT SECURITY',
                desc: 'Payment for commercial sales is processed through secure channels. No payment without agreement.',
              },
              {
                title: 'ACCOUNT SAFETY',
                desc: 'Your account is protected with encryption and security measures. You control your submissions.',
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

      {/* PLATFORM POLICIES */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                UNTELEVISED MEDIA PROTECTIONS
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='space-y-6'>
            {[
              {
                title: 'INDEMNIFICATION',
                desc: 'Submitters indemnify UnTelevised from claims arising from submitted content. Your liability, not ours.',
              },
              {
                title: 'REMOVAL RIGHTS',
                desc: 'We may remove content that violates these terms, is illegal, or is the subject of valid legal claims.',
              },
              {
                title: 'DISPUTE RESOLUTION',
                desc: 'Disputes are resolved through our official forms and processes, not through threats or legal action.',
              },
              {
                title: 'COUNTER-NOTICES',
                desc: 'We honor valid counter-notices per DMCA. Accused parties have the right to respond to claims.',
              },
              {
                title: 'NO THIRD-PARTY LIABILITY',
                desc: 'We are not liable for how buyers use licensed content or how commercial partners use submissions.',
              },
            ].map(({ title, desc }, i) => (
              <div
                key={i}
                className='border-l-4 border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-black'
              >
                <h4 className='mb-2 font-bold text-slate-900 dark:text-white'>{title}</h4>
                <p className='text-sm text-slate-700 dark:text-slate-300'>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL WARNINGS */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                LEGAL WARNINGS
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='space-y-6'>
            <div className='flex items-start space-x-4 border-2 border-red-600 bg-red-50 p-6 dark:border-red-600 dark:bg-red-950/20'>
              <AlertTriangle className='mt-0.5 h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-500' />
              <div>
                <h4 className='mb-2 font-bold text-red-700 dark:text-red-400'>
                  PERJURY & CRIMINAL LIABILITY
                </h4>
                <p className='text-sm text-red-700 dark:text-red-300'>
                  Submitting false information under penalty of perjury is a FEDERAL CRIME punishable
                  by up to 5 years imprisonment and fines up to $250,000. Take these forms seriously.
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-4 border-2 border-amber-600 bg-amber-50 p-6 dark:border-amber-600 dark:bg-amber-950/20'>
              <Shield className='mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-500' />
              <div>
                <h4 className='mb-2 font-bold text-amber-700 dark:text-amber-400'>
                  NO GUARANTEE OF SUCCESS
                </h4>
                <p className='text-sm text-amber-700 dark:text-amber-300'>
                  Submitting a form does not guarantee action. We review claims and determine if
                  action is warranted. Frivolous or invalid claims will not result in content
                  removal or action.
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-4 border-2 border-blue-600 bg-blue-50 p-6 dark:border-blue-600 dark:bg-blue-950/20'>
              <Scale className='mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-500' />
              <div>
                <h4 className='mb-2 font-bold text-blue-700 dark:text-blue-400'>
                  THESE ARE BINDING AGREEMENTS
                </h4>
                <p className='text-sm text-blue-700 dark:text-blue-300'>
                  By submitting any form, you are entering into legally binding contracts. Consult
                  an attorney if you have questions about your rights or obligations.
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
            Consult an attorney if you have questions about your legal rights or obligations.
          </p>
          <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
            <a
              href='mailto:legal@untelevised.media'
              className='bg-untele px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
            >
              EMAIL LEGAL TEAM
            </a>
            <Link
              href='/editorial-standards'
              className='border-2 border-black bg-transparent px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black'
            >
              EDITORIAL STANDARDS
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
