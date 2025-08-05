/* eslint-disable react/function-component-definition */
// src/app/(user)/donate/page.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function DonatePage() {
  return (
    <div className='min-h-screen bg-black text-slate-100'>
      {/* HERO SECTION */}
      <section className='border-b border-slate-800 bg-gradient-to-b from-slate-950 to-black py-16'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                SUPPORT THE TRUTH
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-700' />
          </div>

          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-white md:text-5xl'>
              FUND FEARLESS JOURNALISM
            </h2>
            <p className='text-xl leading-relaxed text-slate-300'>
              Your support keeps us independent, uncompromised, and on the frontlines where
              mainstream media won&rsquo;t go.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION STATEMENT */}
      <section className='border-b border-slate-800 bg-slate-950 py-16'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='grid gap-12 lg:grid-cols-2'>
            <div>
              <div className='mb-6 flex items-center space-x-4'>
                <div className='bg-untele px-3 py-1'>
                  <h3 className='text-sm font-black uppercase tracking-widest text-white'>
                    WHY WE NEED YOUR SUPPORT
                  </h3>
                </div>
                <div className='h-px flex-1 bg-slate-700' />
              </div>
              <p className='mb-4 leading-relaxed text-slate-300'>
                The continued existence and success of our platform depends on the invaluable
                contributions made by our dedicated viewers and readers. Your unwavering support,
                whether financial donations or essential resources, enables us to maintain this
                media outlet and ensure seamless operation of all our endeavors.
              </p>
              <p className='leading-relaxed text-slate-300'>
                We acknowledge and cherish every form of support, regardless of magnitude. Each act
                of generosity plays an integral role in sustaining our mission, and we remain
                profoundly thankful for every gesture of assistance.
              </p>
            </div>

            <div className='border-l-4 border-untele bg-black p-6'>
              <h4 className='mb-4 text-xl font-bold text-white'>CURRENT MISSION</h4>
              <p className='leading-relaxed text-slate-300'>
                We are currently raising funds to send our field reporter Hunter Duke to Washington
                DC for the January 13th national protest for Palestine. Your support helps us
                provide on-the-ground coverage where it matters most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DONATION METHODS */}
      <section className='border-b border-slate-800 bg-black py-16'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                DONATION METHODS
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-700' />
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {/* CashApp */}
            <div className='flex h-full flex-col border border-slate-700 bg-slate-950 p-6 transition-all hover:border-untele'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white'>
                $
              </div>
              <h4 className='mb-3 text-lg font-bold uppercase tracking-wide text-white'>
                CASHAPP
              </h4>
              <p className='mb-4 flex-1 text-sm text-slate-300'>
                Quick and secure mobile payments
              </p>
              <a
                href='https://cash.app/$UnTelevisedMedia'
                className='bg-untele px-4 py-3 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
                target='_blank'
                rel='noopener noreferrer'
              >
                $UnTelevisedMedia
              </a>
            </div>

            {/* Venmo */}
            <div className='flex h-full flex-col border border-slate-700 bg-slate-950 p-6 transition-all hover:border-untele'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white'>
                V
              </div>
              <h4 className='mb-3 text-lg font-bold uppercase tracking-wide text-white'>VENMO</h4>
              <p className='mb-4 flex-1 text-sm text-slate-300'>Social payment platform</p>
              <a
                href='https://venmo.com/UnTelevised'
                className='bg-untele px-4 py-3 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
                target='_blank'
                rel='noopener noreferrer'
              >
                @UnTelevised
              </a>
            </div>

            {/* Email Contact */}
            <div className='flex h-full flex-col border border-slate-700 bg-slate-950 p-6 transition-all hover:border-untele md:col-span-2 lg:col-span-1'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white'>
                @
              </div>
              <h4 className='mb-3 text-lg font-bold uppercase tracking-wide text-white'>
                LARGE DONATIONS
              </h4>
              <p className='mb-4 flex-1 text-sm text-slate-300'>
                For larger contributions or equipment donations
              </p>
              <a
                href='mailto:UnTelevisedMedia.Live@gmail.com'
                className='bg-untele px-4 py-3 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
              >
                CONTACT US
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT SECTION */}
      <section className='border-b border-slate-800 bg-slate-950 py-16'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 text-center'>
            <div className='mb-6 inline-block bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                YOUR IMPACT
              </h3>
            </div>
            <h4 className='mb-4 text-3xl font-bold text-white'>WHERE YOUR MONEY GOES</h4>
          </div>

          <div className='grid gap-8 md:grid-cols-2'>
            <div className='space-y-6'>
              <div className='border-l-4 border-untele bg-black p-6'>
                <h5 className='mb-3 text-lg font-bold text-white'>FIELD REPORTING</h5>
                <p className='text-slate-300'>
                  Travel expenses, equipment, and safety gear for correspondents reporting from
                  dangerous locations.
                </p>
              </div>

              <div className='border-l-4 border-untele bg-black p-6'>
                <h5 className='mb-3 text-lg font-bold text-white'>INVESTIGATIVE WORK</h5>
                <p className='text-slate-300'>
                  Research costs, document acquisition, and time investment for deep-dive
                  investigations.
                </p>
              </div>
            </div>

            <div className='space-y-6'>
              <div className='border-l-4 border-untele bg-black p-6'>
                <h5 className='mb-3 text-lg font-bold text-white'>TECHNOLOGY & SECURITY</h5>
                <p className='text-slate-300'>
                  Secure communication tools, website hosting, and protection for sources and
                  journalists.
                </p>
              </div>

              <div className='border-l-4 border-untele bg-black p-6'>
                <h5 className='mb-3 text-lg font-bold text-white'>EDITORIAL INDEPENDENCE</h5>
                <p className='text-slate-300'>
                  No corporate sponsors means we answer only to you and the truth. Your support
                  keeps us free.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className='border-t-4 border-untele bg-gradient-to-b from-untele/20 to-black py-16'>
        <div className='mx-auto max-w-4xl px-4 text-center'>
          <h3 className='mb-4 text-3xl font-black uppercase tracking-widest text-white'>
            EVERY DOLLAR COUNTS
          </h3>
          <p className='mb-8 text-lg text-slate-300'>
            Whether it&rsquo;s $5 or $500, your contribution directly funds the truth. No executive
            bonuses, no shareholder profits—just fearless journalism.
          </p>
          <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
            <a
              href='https://cash.app/$UnTelevisedMedia'
              className='bg-untele px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
              target='_blank'
              rel='noopener noreferrer'
            >
              DONATE NOW
            </a>
            <Link
              href='/secure-contact'
              className='border-2 border-white bg-transparent px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black'
            >
              SECURE CONTACT
            </Link>
          </div>

          <div className='mt-6 text-center'>
            <p className='mb-4 text-sm text-slate-400'>Have sensitive information to share?</p>
            <Link
              href='/whistleblower'
              className='inline-block border border-untele bg-transparent px-6 py-3 text-xs font-black uppercase tracking-widest text-untele transition-colors hover:bg-untele hover:text-white'
            >
              WHISTLEBLOWER PORTAL
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
