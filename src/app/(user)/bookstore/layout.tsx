// src/app/(user)/bookstore/layout.tsx
// Bookstore section layout — main header + Hurriya Publications sub-brand + footer.
// No article category NavWrapper (bookstore has its own context).

import Image from 'next/image';
import Header from '@/components/global/Header';
import HeaderLogo from '@/components/global/HeaderLogo';
import Footer from '@/components/global/Footer';
import { SanityLive } from '@/lib/sanity/lib/live';

export default function BookstoreLayout({ children }: { children: React.ReactNode }) {
  return (
    // Warm sand (light) / deep warm brown (dark) — base for all bookstore pages
    <div className='min-h-screen bg-hp-sand text-slate-900 dark:bg-hp-dark dark:text-hp-cream'>
      {/* ── Main UnTelevised header ── */}
      <Header logoSlot={<HeaderLogo />} />

      {/* ── Hurriya Publications sub-brand ── */}
      <section
        className='relative overflow-hidden border-b-2 border-[#009736] bg-gradient-to-r from-hp-sand to-hp-sand-mid dark:from-hp-dark dark:to-hp-dark-card'
        aria-label='Hurriya Publications'
      >
        <div className='mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>

          {/* Left — logo + identity */}
          <div className='flex items-center gap-5 py-5'>
            {/* Cream pad keeps Logo.png consistent in both modes */}
            <div className='relative h-[108px] w-[108px] shrink-0 bg-hp-sand p-1.5 shadow-sm dark:bg-hp-sand'>
              <Image
                src='/hurriya-pub/Logo.png'
                alt='Hurriya Publications'
                fill
                className='object-contain'
                priority
                sizes='108px'
              />
            </div>

            <div>
              <p className='mb-0.5 text-[10px] font-black uppercase tracking-widest text-[#009736]'>
                An UnTelevised Media Imprint
              </p>
              <h2 className='text-xl font-black uppercase leading-none tracking-widest text-slate-900 dark:text-hp-cream sm:text-2xl'>
                Hurriya Publications
              </h2>
              <p className='mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-hp-muted'>
                Stories from the Frontlines&nbsp;·&nbsp;Words that Endure
              </p>
              <p className='mt-0.5 text-[10px] uppercase tracking-widest text-slate-400 dark:text-hp-muted/70'>
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

        {/* Left accent bar */}
        <div className='absolute bottom-0 left-0 top-0 w-1 bg-[#009736]' aria-hidden='true' />
      </section>

      {/* ── Page content ── */}
      {children}

      <Footer />
      <SanityLive />
    </div>
  );
}
