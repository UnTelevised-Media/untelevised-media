// src/app/(user)/bookstore/layout.tsx
// Bookstore section layout — main header + Hurriya Publications sub-brand + footer.
// No article category NavWrapper (bookstore has its own context).

import type { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/components/global/Header';
import HeaderLogo from '@/components/global/HeaderLogo';
import Footer from '@/components/global/Footer';
import BookstoreNav from '@/components/bookstore/BookstoreNav';
import { SanityLive } from '@/lib/sanity/lib/live';

export const metadata: Metadata = {
  openGraph: {
    siteName: 'Hurriya Publications — UnTelevised Media',
    images: [
      {
        url: '/hurriya-pub/Logo-alt.png',
        width: 1200,
        height: 630,
        alt: 'Hurriya Publications — An UnTelevised Media Imprint',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@untelevised',
    images: ['/hurriya-pub/Logo-alt.png'],
  },
};

export default function BookstoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-hp-sand text-slate-900 dark:bg-hp-dark dark:text-hp-cream'>
      {/* ── Main UnTelevised header ── */}
      <Header logoSlot={<HeaderLogo />} />

      {/* ── Hurriya Publications sub-brand ── */}
      <section
        className='relative overflow-hidden border-b border-slate-200 bg-gradient-to-r from-hp-sand to-hp-sand-mid dark:border-slate-700 dark:from-hp-dark dark:to-hp-dark-card'
        aria-label='Hurriya Publications'
      >
        <div className='mx-auto flex max-w-7xl items-stretch px-4 sm:px-6 lg:px-8'>
          {/* Left — logo + identity */}
          <div className='flex shrink-0 items-center gap-5 py-5'>
            <div className='relative h-[108px] w-[108px] shrink-0'>
              {/* Light mode logo */}
              <Image
                src='/hurriya-pub/Logo-invert.png'
                alt='Hurriya Publications'
                fill
                className='object-contain dark:hidden'
                priority
                sizes='108px'
              />
              {/* Dark mode logo */}
              <Image
                src='/hurriya-pub/Logo.png'
                alt='Hurriya Publications'
                fill
                className='object-contain hidden dark:block'
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

          {/* Right — Banner filling remaining width, full section height */}
          <div className='relative hidden flex-1 overflow-hidden sm:block'>
            {/* Light mode banner */}
            <Image
              src='/hurriya-pub/Banner.png'
              alt=''
              fill
              className='object-contain object-right dark:hidden'
              priority
              sizes='(max-width: 640px) 0px, 50vw'
              aria-hidden='true'
            />
            {/* Dark mode banner */}
            <Image
              src='/hurriya-pub/Banner-invert.png'
              alt=''
              fill
              className='object-contain object-right hidden dark:block'
              priority
              sizes='(max-width: 640px) 0px, 50vw'
              aria-hidden='true'
            />
          </div>
        </div>
      </section>

      {/* ── Bookstore nav — outside overflow-hidden so dropdowns aren't clipped ── */}
      <BookstoreNav />

      {/* ── Page content ── */}
      {children}

      <Footer />
      <SanityLive />
    </div>
  );
}
