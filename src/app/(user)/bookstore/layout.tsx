// src/app/(user)/bookstore/layout.tsx
// Bookstore section layout.
// Includes the main UnTelevised header + Hurriya Publications sub-brand bar + footer.
// Does NOT include the article category NavWrapper — bookstore has its own context.

import Image from 'next/image';
import Header from '@/components/global/Header';
import HeaderLogo from '@/components/global/HeaderLogo';
import Footer from '@/components/global/Footer';
import { SanityLive } from '@/lib/sanity/lib/live';

// Palestine flag green
const HP_GREEN = '#009736';

export default function BookstoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* ── Main UnTelevised header ── */}
      <Header logoSlot={<HeaderLogo />} />

      {/* ── Hurriya Publications sub-brand ── */}
      <section
        className='relative overflow-hidden border-b-2'
        style={{ borderColor: HP_GREEN, background: 'linear-gradient(110deg, #f4ede0 0%, #ede4d0 60%, #e4d8c0 100%)' }}
        aria-label='Hurriya Publications'
      >
        <div className='mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>

          {/* Left — logo + identity */}
          <div className='flex items-center gap-5 py-5'>
            <div className='relative h-[88px] w-[88px] shrink-0'>
              <Image
                src='/hurriya-pub/Logo-alt.png'
                alt='Hurriya Publications'
                fill
                className='object-contain'
                priority
                sizes='88px'
              />
            </div>

            <div>
              <p
                className='mb-0.5 text-[10px] font-black uppercase tracking-widest'
                style={{ color: HP_GREEN }}
              >
                An UnTelevised Media Imprint
              </p>
              <h2 className='text-xl font-black uppercase leading-none tracking-widest text-slate-900 sm:text-2xl'>
                Hurriya Publications
              </h2>
              <p className='mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500'>
                Stories from the Frontlines&nbsp;·&nbsp;Words that Endure
              </p>
              <p className='mt-0.5 text-[10px] uppercase tracking-widest text-slate-400'>
                Gaza&nbsp;·&nbsp;Palestine&nbsp;·&nbsp;The World
              </p>
            </div>
          </div>

          {/* Right — Banner cropped to top */}
          <div className='relative hidden h-40 w-40 shrink-0 overflow-hidden sm:block lg:h-44 lg:w-44'>
            <Image
              src='/hurriya-pub/Banner.png'
              alt=''
              fill
              className='object-cover object-top'
              priority
              sizes='176px'
              aria-hidden='true'
            />
          </div>
        </div>

        {/* Subtle green left accent bar */}
        <div
          className='absolute bottom-0 left-0 top-0 w-1'
          style={{ background: HP_GREEN }}
          aria-hidden='true'
        />
      </section>

      {/* ── Page content ── */}
      {children}

      <Footer />
      <SanityLive />
    </div>
  );
}
