/* eslint-disable react/function-component-definition */
// src/app/(user)/about/page.tsx
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About UnTelevised Media',
  description:
    "Learn about UnTelevised Media — independent journalism covering stories mainstream media won't touch.",
};

export default function AboutPage() {
  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* HERO SECTION */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-16 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                ABOUT US
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-5xl'>
              UNFILTERED. UNCENSORED. UNCOMPROMISING.
            </h2>
            <p className='text-xl leading-relaxed text-slate-700 dark:text-slate-300'>
              We are the voice that refuses to be silenced. Where mainstream media fears to tread,
              we charge forward with cameras rolling and questions blazing.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='grid gap-12 lg:grid-cols-2'>
            <div>
              <div className='mb-6 flex items-center space-x-4'>
                <div className='bg-untele px-3 py-1'>
                  <h3 className='text-sm font-black uppercase tracking-widest text-white'>
                    OUR MISSION
                  </h3>
                </div>
                <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
              </div>
              <h4 className='mb-4 text-2xl font-bold text-slate-900 dark:text-white'>
                EXPOSING TRUTH IN A WORLD OF LIES
              </h4>
              <p className='mb-4 leading-relaxed text-slate-700 dark:text-slate-300'>
                In an era where corporate media serves power instead of people, we stand as the
                last bastion of independent journalism. Our mission is simple: report the truth, no
                matter how uncomfortable it makes those in power.
              </p>
              <p className='leading-relaxed text-slate-700 dark:text-slate-300'>
                We don&rsquo;t just report the news—we uncover the stories they don&rsquo;t want
                you to see. From war zones to corporate boardrooms, from government cover-ups to
                grassroots movements, we go where others won&rsquo;t.
              </p>
            </div>

            <div className='border-l-4 border-untele bg-slate-100 p-6 dark:bg-black'>
              <blockquote className='text-lg italic text-slate-800 dark:text-slate-200'>
                &ldquo;The truth is not afraid of questions. It&rsquo;s lies that fear
                investigation. That&rsquo;s why we never stop asking, never stop digging, and never
                stop reporting.&rdquo;
              </blockquote>
              <cite className='mt-4 block text-sm font-bold uppercase tracking-wide text-untele'>
                — Editorial Team
              </cite>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES SECTION */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                OUR PRINCIPLES
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {/* Independence */}
            <div className='flex h-full flex-col border border-slate-300 bg-slate-50 p-6 transition-all hover:border-untele dark:border-slate-700 dark:bg-slate-950'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white'>
                1
              </div>
              <h4 className='mb-3 text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                INDEPENDENCE
              </h4>
              <p className='flex-1 text-sm text-slate-700 dark:text-slate-300'>
                We answer to no corporation, government, or special interest. Our only allegiance
                is to the truth and the people who deserve to know it.
              </p>
            </div>

            {/* Courage */}
            <div className='flex h-full flex-col border border-slate-300 bg-slate-50 p-6 transition-all hover:border-untele dark:border-slate-700 dark:bg-slate-950'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white'>
                2
              </div>
              <h4 className='mb-3 text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                COURAGE
              </h4>
              <p className='flex-1 text-sm text-slate-700 dark:text-slate-300'>
                Real journalism requires courage. We go to dangerous places, ask difficult
                questions, and publish stories that powerful people would prefer to keep buried.
              </p>
            </div>

            {/* Transparency */}
            <div className='flex h-full flex-col border border-slate-300 bg-slate-50 p-6 transition-all hover:border-untele dark:border-slate-700 dark:bg-slate-950'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white'>
                3
              </div>
              <h4 className='mb-3 text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                TRANSPARENCY
              </h4>
              <p className='flex-1 text-sm text-slate-700 dark:text-slate-300'>
                We practice what we preach. Our funding sources, editorial decisions, and
                methodologies are open for scrutiny. Transparency builds trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE DO SECTION */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                WHAT WE DO
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>

          <div className='grid gap-8 md:grid-cols-2'>
            <div className='flex h-full flex-col border-l-4 border-untele bg-slate-100 p-6 dark:bg-black'>
              <h4 className='mb-3 text-lg font-bold text-slate-900 dark:text-white'>
                INVESTIGATIVE REPORTING
              </h4>
              <p className='flex-1 text-slate-700 dark:text-slate-300'>
                Deep-dive investigations that take months or years to complete. We follow the
                money, connect the dots, and expose corruption wherever we find it.
              </p>
            </div>

            <div className='flex h-full flex-col border-l-4 border-untele bg-slate-100 p-6 dark:bg-black'>
              <h4 className='mb-3 text-lg font-bold text-slate-900 dark:text-white'>
                BREAKING NEWS COVERAGE
              </h4>
              <p className='flex-1 text-slate-700 dark:text-slate-300'>
                When news breaks, we&rsquo;re already there. Our network of correspondents provides
                real-time coverage from the ground up, not from corporate boardrooms.
              </p>
            </div>

            <div className='flex h-full flex-col border-l-4 border-untele bg-slate-100 p-6 dark:bg-black'>
              <h4 className='mb-3 text-lg font-bold text-slate-900 dark:text-white'>
                DOCUMENTARY PRODUCTION
              </h4>
              <p className='flex-1 text-slate-700 dark:text-slate-300'>
                Long-form documentaries that tell the stories mainstream media won&rsquo;t touch.
                Visual storytelling that brings complex issues to life.
              </p>
            </div>

            <div className='flex h-full flex-col border-l-4 border-untele bg-slate-100 p-6 dark:bg-black'>
              <h4 className='mb-3 text-lg font-bold text-slate-900 dark:text-white'>
                CITIZEN JOURNALISM
              </h4>
              <p className='flex-1 text-slate-700 dark:text-slate-300'>
                Training and supporting citizen journalists worldwide. Everyone with a camera and
                courage can be part of the truth-telling revolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT SECTION */}
      <section className='border-b border-slate-300 bg-white py-16 dark:border-slate-800 dark:bg-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 text-center'>
            <div className='mb-6 inline-block bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                OUR IMPACT
              </h3>
            </div>
            <h4 className='mb-4 text-3xl font-bold text-slate-900 dark:text-white'>
              STORIES THAT CHANGED THE WORLD
            </h4>
            <p className='mx-auto max-w-3xl text-lg text-slate-700 dark:text-slate-300'>
              Real journalism creates real change. Here&rsquo;s how our reporting has made a
              difference.
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-3'>
            <div className='text-center'>
              <div className='mb-4 text-4xl font-black text-untele'>500+</div>
              <h5 className='mb-2 text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                INVESTIGATIONS PUBLISHED
              </h5>
              <p className='text-sm text-slate-600 dark:text-slate-400'>
                Deep-dive reports exposing corruption and holding power accountable
              </p>
            </div>

            <div className='text-center'>
              <div className='mb-4 text-4xl font-black text-untele'>50+</div>
              <h5 className='mb-2 text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                COUNTRIES COVERED
              </h5>
              <p className='text-sm text-slate-600 dark:text-slate-400'>
                Global network of correspondents reporting from every continent
              </p>
            </div>

            <div className='text-center'>
              <div className='mb-4 text-4xl font-black text-untele'>24/7</div>
              <h5 className='mb-2 text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white'>
                BREAKING NEWS COVERAGE
              </h5>
              <p className='text-sm text-slate-600 dark:text-slate-400'>
                Round-the-clock monitoring and reporting of developing stories
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT SECTION */}
      <section className='border-b border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='grid gap-12 lg:grid-cols-2'>
            <div>
              <div className='mb-6 flex items-center space-x-4'>
                <div className='bg-untele px-3 py-1'>
                  <h3 className='text-sm font-black uppercase tracking-widest text-white'>
                    SUPPORT INDEPENDENT MEDIA
                  </h3>
                </div>
                <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
              </div>
              <h4 className='mb-4 text-2xl font-bold text-slate-900 dark:text-white'>
                JOURNALISM THAT SERVES PEOPLE, NOT PROFIT
              </h4>
              <p className='mb-4 leading-relaxed text-slate-700 dark:text-slate-300'>
                We don&rsquo;t have corporate sponsors or government funding. We&rsquo;re supported
                by people like you who believe that independent journalism is essential for
                democracy.
              </p>
              <p className='mb-6 leading-relaxed text-slate-700 dark:text-slate-300'>
                Every dollar goes directly to our reporting. No executive bonuses, no shareholder
                profits— just fearless journalism that holds power accountable.
              </p>

              <div className='space-y-4'>
                <div className='flex items-center space-x-3'>
                  <div className='h-2 w-2 bg-untele' />
                  <span className='text-slate-700 dark:text-slate-300'>
                    Fund investigative reporting
                  </span>
                </div>
                <div className='flex items-center space-x-3'>
                  <div className='h-2 w-2 bg-untele' />
                  <span className='text-slate-700 dark:text-slate-300'>
                    Support correspondent safety
                  </span>
                </div>
                <div className='flex items-center space-x-3'>
                  <div className='h-2 w-2 bg-untele' />
                  <span className='text-slate-700 dark:text-slate-300'>
                    Expand global coverage
                  </span>
                </div>
                <div className='flex items-center space-x-3'>
                  <div className='h-2 w-2 bg-untele' />
                  <span className='text-slate-700 dark:text-slate-300'>
                    Maintain editorial independence
                  </span>
                </div>
              </div>
            </div>

            <div className='border-2 border-untele bg-gradient-to-b from-untele/20 to-slate-100 p-8 dark:to-black'>
              <h5 className='mb-4 text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white'>
                JOIN THE RESISTANCE
              </h5>
              <p className='mb-6 text-slate-700 dark:text-slate-300'>
                Be part of the movement for independent journalism. Your support keeps us free from
                corporate influence and government pressure.
              </p>
              <div className='space-y-4'>
                <Link
                  href='/support#membership'
                  className='block w-full bg-untele py-4 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
                >
                  BECOME A SUPPORTER
                </Link>
                <Link
                  href='/support'
                  className='block w-full border-2 border-black dark:border-white bg-transparent py-4 text-center text-sm font-black uppercase tracking-widest text-black dark:text-white transition-colors hover:bg-white hover:text-black'
                >
                  LEARN MORE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className='border-t-4 border-untele bg-gradient-to-b from-untele/20 to-white py-16 dark:to-black'>
        <div className='mx-auto max-w-4xl px-4 text-center'>
          <h3 className='mb-4 text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-white'>
            HAVE A STORY TIP?
          </h3>
          <p className='mb-8 text-lg text-slate-700 dark:text-slate-300'>
            We protect our sources and investigate every credible lead. If you have information the
            public needs to know, we want to hear from you.
          </p>
          <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
            <Link
              href='/secure-contact'
              className='bg-untele px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
            >
              SECURE CONTACT
            </Link>
            <Link
              href='/whistleblower'
              className='border-2 border-black dark:border-white bg-transparent px-8 py-4 text-center text-sm font-black uppercase tracking-widest dark:text-white transition-colors hover:bg-white hover:text-black'
            >
              WHISTLEBLOWER PORTAL
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
