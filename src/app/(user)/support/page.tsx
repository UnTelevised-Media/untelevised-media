/* eslint-disable react/function-component-definition */
// src/app/(user)/support/page.tsx
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support Options — UnTelevised Media',
  description:
    'Support UnTelevised Media through donations, volunteering, sharing our work, or providing tips.',
};

export default function SupportPage() {
  return (
    <div className='min-h-screen bg-black text-slate-100'>
      {/* HERO SECTION */}
      <section className='border-b border-slate-800 bg-gradient-to-b from-slate-950 to-black py-16'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                SUPPORT INDEPENDENT MEDIA
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-700' />
          </div>
          
          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-white md:text-5xl'>
              MORE THAN MONEY
            </h2>
            <p className='text-xl text-slate-300 leading-relaxed'>
              There are many ways to support independent journalism beyond financial contributions. 
              Learn how you can be part of the movement for truth.
            </p>
          </div>
        </div>
      </section>

      {/* WAYS TO SUPPORT */}
      <section className='border-b border-slate-800 bg-slate-950 py-16'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                WAYS TO HELP
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-700' />
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {/* Share Our Work */}
            <div className='flex h-full flex-col border border-slate-700 bg-black p-6 transition-all hover:border-untele'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white'>
                📢
              </div>
              <h4 className='mb-3 text-lg font-bold uppercase tracking-wide text-white'>
                SHARE OUR WORK
              </h4>
              <p className='flex-1 text-sm text-slate-300'>
                Amplify our stories on social media. Every share helps break through the noise 
                and reaches people who need to see the truth.
              </p>
            </div>

            {/* Become a Source */}
            <div className='flex h-full flex-col border border-slate-700 bg-black p-6 transition-all hover:border-untele'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white'>
                🔍
              </div>
              <h4 className='mb-3 text-lg font-bold uppercase tracking-wide text-white'>
                BECOME A SOURCE
              </h4>
              <p className='flex-1 text-sm text-slate-300'>
                Have information the public needs to know? We protect our sources and investigate 
                every credible lead with the utmost care.
              </p>
            </div>

            {/* Volunteer */}
            <div className='flex h-full flex-col border border-slate-700 bg-black p-6 transition-all hover:border-untele'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white'>
                🤝
              </div>
              <h4 className='mb-3 text-lg font-bold uppercase tracking-wide text-white'>
                VOLUNTEER
              </h4>
              <p className='flex-1 text-sm text-slate-300'>
                Contribute your skills in research, translation, social media, or technical support. 
                Every talent helps strengthen our mission.
              </p>
            </div>

            {/* Equipment Donations */}
            <div className='flex h-full flex-col border border-slate-700 bg-black p-6 transition-all hover:border-untele'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white'>
                📹
              </div>
              <h4 className='mb-3 text-lg font-bold uppercase tracking-wide text-white'>
                EQUIPMENT DONATIONS
              </h4>
              <p className='flex-1 text-sm text-slate-300'>
                Cameras, recording equipment, laptops, and safety gear help our correspondents 
                work safely and effectively in the field.
              </p>
            </div>

            {/* Spread Awareness */}
            <div className='flex h-full flex-col border border-slate-700 bg-black p-6 transition-all hover:border-untele'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white'>
                💬
              </div>
              <h4 className='mb-3 text-lg font-bold uppercase tracking-wide text-white'>
                SPREAD AWARENESS
              </h4>
              <p className='flex-1 text-sm text-slate-300'>
                Tell friends, family, and colleagues about independent media. Word of mouth 
                is powerful in building our community.
              </p>
            </div>

            {/* Subscribe & Engage */}
            <div className='flex h-full flex-col border border-slate-700 bg-black p-6 transition-all hover:border-untele'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white'>
                📧
              </div>
              <h4 className='mb-3 text-lg font-bold uppercase tracking-wide text-white'>
                SUBSCRIBE & ENGAGE
              </h4>
              <p className='flex-1 text-sm text-slate-300'>
                Follow our updates, comment thoughtfully, and engage with our content. 
                Active communities make stronger journalism.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY INDEPENDENCE MATTERS */}
      <section className='border-b border-slate-800 bg-black py-16'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='grid gap-12 lg:grid-cols-2'>
            <div>
              <div className='mb-6 flex items-center space-x-4'>
                <div className='bg-untele px-3 py-1'>
                  <h3 className='text-sm font-black uppercase tracking-widest text-white'>
                    WHY INDEPENDENCE MATTERS
                  </h3>
                </div>
                <div className='h-px flex-1 bg-slate-700' />
              </div>
              <h4 className='mb-4 text-2xl font-bold text-white'>
                FREE FROM CORPORATE CONTROL
              </h4>
              <p className='mb-4 text-slate-300 leading-relaxed'>
                Corporate media serves advertisers and shareholders, not the public interest. 
                When news organizations depend on corporate funding, they can&rsquo;t bite the hand that feeds them.
              </p>
              <p className='text-slate-300 leading-relaxed'>
                Independent media funded by readers like you can investigate anyone, 
                question everything, and report without fear of losing advertising revenue.
              </p>
            </div>
            
            <div className='space-y-6'>
              <div className='border-l-4 border-untele bg-slate-950 p-6'>
                <h5 className='mb-3 text-lg font-bold text-white'>NO CORPORATE SPONSORS</h5>
                <p className='text-slate-300'>
                  We don&rsquo;t take money from corporations, so we can investigate them without conflict of interest.
                </p>
              </div>

              <div className='border-l-4 border-untele bg-slate-950 p-6'>
                <h5 className='mb-3 text-lg font-bold text-white'>NO GOVERNMENT FUNDING</h5>
                <p className='text-slate-300'>
                  Government funding comes with strings attached. We remain free to criticize any administration.
                </p>
              </div>

              <div className='border-l-4 border-untele bg-slate-950 p-6'>
                <h5 className='mb-3 text-lg font-bold text-white'>READER-SUPPORTED</h5>
                <p className='text-slate-300'>
                  When readers fund journalism, journalists serve readers—not advertisers or politicians.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRANSPARENCY */}
      <section className='border-b border-slate-800 bg-slate-950 py-16'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 text-center'>
            <div className='mb-6 inline-block bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                TRANSPARENCY
              </h3>
            </div>
            <h4 className='mb-4 text-3xl font-bold text-white'>
              HOW WE OPERATE
            </h4>
            <p className='mx-auto max-w-3xl text-lg text-slate-300'>
              We practice what we preach. Here&rsquo;s how we maintain transparency in our operations.
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-3'>
            <div className='text-center'>
              <div className='mb-4 text-4xl font-black text-untele'>100%</div>
              <h5 className='mb-2 text-lg font-bold uppercase tracking-wide text-white'>
                FUNDING TRANSPARENCY
              </h5>
              <p className='text-sm text-slate-400'>
                All funding sources are publicly disclosed. No hidden corporate sponsors.
              </p>
            </div>

            <div className='text-center'>
              <div className='mb-4 text-4xl font-black text-untele'>OPEN</div>
              <h5 className='mb-2 text-lg font-bold uppercase tracking-wide text-white'>
                EDITORIAL PROCESS
              </h5>
              <p className='text-sm text-slate-400'>
                Our editorial decisions are made independently, without outside influence.
              </p>
            </div>

            <div className='text-center'>
              <div className='mb-4 text-4xl font-black text-untele'>ZERO</div>
              <h5 className='mb-2 text-lg font-bold uppercase tracking-wide text-white'>
                CONFLICTS OF INTEREST
              </h5>
              <p className='text-sm text-slate-400'>
                We disclose any potential conflicts and maintain strict ethical standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className='border-t-4 border-untele bg-gradient-to-b from-untele/20 to-black py-16'>
        <div className='mx-auto max-w-4xl px-4 text-center'>
          <h3 className='mb-4 text-3xl font-black uppercase tracking-widest text-white'>
            JOIN THE MOVEMENT
          </h3>
          <p className='mb-8 text-lg text-slate-300'>
            Ready to support independent journalism? Choose how you want to make a difference.
          </p>
          <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
            <Link
              href='/donate'
              className='bg-untele px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'
            >
              DONATE NOW
            </Link>
            <a
              href='mailto:support@untelevised.media'
              className='border-2 border-white bg-transparent px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black'
            >
              VOLUNTEER
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
