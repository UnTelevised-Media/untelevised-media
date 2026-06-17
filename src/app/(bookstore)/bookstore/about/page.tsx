// src/app/(user)/bookstore/about/page.tsx
// Hurriya Publications — Our Story

import type { Metadata } from 'next';
import Link from 'next/link';
import BookstoreNewsletter from '@/components/bookstore/BookstoreNewsletter';

export const metadata: Metadata = {
  title: 'Our Story — Hurriya Publications',
  description:
    'Hurriya Publications was born from a partnership between a survivor of the genocide in Gaza and an independent journalist who has covered Palestine for eighteen years. An independent publisher built to put authors first.',
  openGraph: {
    title: 'Our Story — Hurriya Publications',
    description:
      'Born in solidarity. Built to endure. Hurriya Publications exists to put authors first and amplify voices the world cannot afford to ignore.',
    type: 'website',
    images: [
      {
        url: '/hurriya-pub/Logo-alt.png',
        width: 1200,
        height: 630,
        alt: 'Hurriya Publications — Born in Solidarity. Built to Endure.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Story — Hurriya Publications',
    description:
      'Born in solidarity. Built to endure. An independent publisher under UnTelevised Media, built to put authors first.',
    images: ['/hurriya-pub/Logo-alt.png'],
  },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className='mb-6 flex items-center gap-3'>
      <div className='bg-[#009736] px-3 py-1'>
        <span className='text-[10px] font-black uppercase tracking-widest text-white'>
          {children}
        </span>
      </div>
      <div className='h-px flex-1 bg-slate-200 dark:bg-slate-800' />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className='border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900'>
      <p className='text-3xl font-black text-[#009736]'>{value}</p>
      <p className='mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400'>
        {label}
      </p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className='mx-auto max-w-4xl px-4 py-12 sm:px-6'>
      {/* ── Origin ── */}
      <section className='mb-16'>
        <SectionLabel>Our Story</SectionLabel>

        <h1 className='mb-4 text-4xl font-black uppercase leading-none tracking-tight text-slate-900 dark:text-white sm:text-5xl'>
          Born in Solidarity.
          <br />
          <span className='text-[#009736]'>Built to Endure.</span>
        </h1>

        <div className='mb-8 h-1 w-16 bg-[#009736]' />

        <div className='space-y-5 text-base leading-relaxed text-slate-700 dark:text-slate-300'>
          <p>
            Hurriya Publications did not begin as a business plan. It began as an act of witness.
          </p>
          <p>
            When <strong className='text-slate-900 dark:text-white'>Salah Akram</strong> — a
            Palestinian survivor of the ongoing genocide in Gaza — completed his memoir,{' '}
            <em>Between Life and Death in Gaza</em>, he needed more than a publisher. He needed a
            platform that understood what was at stake: that the economic rights to the story of
            survival should never be surrendered to the institutions that failed to prevent the
            catastrophe in the first place.
          </p>
          <p>
            <strong className='text-slate-900 dark:text-white'>Edward Tivrusky</strong>, founder
            and Editor-in-Chief of UnTelevised Media — an independent journalist and activist who
            has covered Palestine and fought for the cause for over eighteen years — answered that
            call. Together, they built something different.
          </p>
          <p className='border-l-4 border-[#009736] pl-5 italic text-slate-600 dark:text-slate-400'>
            Half of this company has its roots in Gaza. That is not background information — it is
            the foundation.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className='mb-16'>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          <Stat value='18+' label='Years covering Palestine' />
          <Stat value='50%' label='Of our founders from Gaza' />
          <Stat value='70%+' label='Revenue returned to authors' />
          <Stat value='0' label='Gatekeepers. Ever.' />
        </div>
      </section>

      {/* ── The Founders ── */}
      <section className='mb-16'>
        <SectionLabel>The Partnership</SectionLabel>

        <div className='grid gap-6 sm:grid-cols-2'>
          {/* Salah */}
          <div className='border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900'>
            <p className='mb-1 text-[10px] font-black uppercase tracking-widest text-[#009736]'>
              Author &amp; Co-Founder
            </p>
            <h2 className='mb-3 text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white'>
              Salah Akram
            </h2>
            <div className='mb-3 h-px bg-slate-100 dark:bg-slate-800' />
            <p className='text-sm leading-relaxed text-slate-600 dark:text-slate-400'>
              Palestinian author and survivor of the genocide in Gaza. His debut memoir,{' '}
              <em>Between Life and Death in Gaza</em>, is a first-hand account of living through
              one of the most documented atrocities of the twenty-first century — written from
              inside it. Salah&apos;s book is the reason Hurriya exists, and the standard against
              which we measure everything we do.
            </p>
            <div className='mt-4 flex items-center gap-2'>
              <div className='h-2 w-2 bg-[#009736]' />
              <span className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                Gaza, Palestine
              </span>
            </div>
          </div>

          {/* Edward */}
          <div className='border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900'>
            <p className='mb-1 text-[10px] font-black uppercase tracking-widest text-[#009736]'>
              Publisher &amp; Co-Founder
            </p>
            <h2 className='mb-3 text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white'>
              Edward Tivrusky
            </h2>
            <div className='mb-3 h-px bg-slate-100 dark:bg-slate-800' />
            <p className='text-sm leading-relaxed text-slate-600 dark:text-slate-400'>
              Founder and Editor-in-Chief of UnTelevised Media. Independent journalist, activist,
              and the architect of this platform. Edward has spent eighteen years covering
              Palestine — not as a career move, but as a commitment. Hurriya Publications is his
              answer to the question every journalist eventually faces: reporting is not enough.
              Sometimes you have to build the infrastructure that gives the story somewhere to
              live.
            </p>
            <div className='mt-4 flex items-center gap-2'>
              <div className='h-2 w-2 bg-[#D70606]' />
              <span className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                UnTelevised Media
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className='mb-16'>
        <SectionLabel>Our Mission</SectionLabel>

        <div className='mb-8 border-l-4 border-[#009736] bg-white p-6 dark:bg-slate-900'>
          <p className='text-lg font-black uppercase leading-tight tracking-tight text-slate-900 dark:text-white sm:text-xl'>
            To collectivize the publishing structure — shifting power from gatekeepers to the
            writers who actually have something to say.
          </p>
        </div>

        <div className='space-y-5 text-base leading-relaxed text-slate-700 dark:text-slate-300'>
          <p>
            Traditional publishers and storefronts routinely take cuts that leave authors with a
            fraction of the value their work generates. Hurriya was built to invert that. We are a
            far-left independent publisher and bookseller, and our economics reflect our politics.
          </p>
          <p>
            We return significantly more revenue to our authors than any traditional publishing
            house — and we use sliding-scale revenue adjustments based on socio-economic context,
            because we understand that not all authors start from the same place. A writer
            surviving genocide should not be negotiating from a position of desperation. We remove
            that leverage from the table entirely.
          </p>
          <p>
            We run grassroots campaigns to grow the reach and discovery of our authors&apos; works
            — because a great book that no one can find is not a published book, it is a buried
            one.
          </p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className='mb-16'>
        <SectionLabel>How We Work</SectionLabel>

        <div className='grid gap-4 sm:grid-cols-3'>
          {[
            {
              icon: '✦',
              title: 'Author-First Revenue',
              body: 'Authors keep the majority of every sale. We take a smaller cut than any traditional publisher or marketplace — full stop. Revenue splits are transparent and negotiated honestly.',
            },
            {
              icon: '◆',
              title: 'Sliding Scale Terms',
              body: 'We adjust our terms based on socio-economic context. If the circumstances of your life have made the standard deal unjust, we talk about it. No exploitation disguised as standard practice.',
            },
            {
              icon: '●',
              title: 'Reader Tipping',
              body: 'Our integrated tipping system lets readers send direct support to the writers whose words matter to them — outside of the standard purchase flow. A reader moved by a book should be able to say so in a concrete way.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className='border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900'
            >
              <p className='mb-3 text-xl font-black text-[#009736]'>{item.icon}</p>
              <p className='mb-2 text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white'>
                {item.title}
              </p>
              <p className='text-xs leading-relaxed text-slate-500 dark:text-slate-400'>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Expanding ── */}
      <section className='mb-16'>
        <SectionLabel>Where We&apos;re Going</SectionLabel>

        <div className='space-y-5 text-base leading-relaxed text-slate-700 dark:text-slate-300'>
          <p>
            Hurriya Publications launched with one book and one mission. We are building it to hold
            many more. We are actively seeking independent authors — particularly those whose
            stories are underrepresented, whose economics are precarious, and whose voices deserve
            a global audience without compromise or condition.
          </p>
          <p>
            We are not interested in authors who fit the market. We are interested in authors who
            have something true to say.
          </p>
        </div>

        <div className='mt-8 border border-[#009736] p-6'>
          <p className='mb-1 text-[10px] font-black uppercase tracking-widest text-[#009736]'>
            Interested in publishing with us?
          </p>
          <p className='mb-4 text-sm text-slate-600 dark:text-slate-400'>
            If you are a writer with a manuscript and a story that the world needs, reach out. We
            read everything.
          </p>
          <Link
            href='/secure-contact'
            className='inline-block bg-[#009736] px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white hover:opacity-90'
          >
            Get in Touch &rarr;
          </Link>
        </div>
      </section>

      {/* ── Newsletter signup ── */}
      <section className='mb-12'>
        <BookstoreNewsletter source='bookstore-about' />
      </section>

      {/* ── What hurriya means ── */}
      <section className='border-t border-slate-200 pt-12 dark:border-slate-800'>
        <div className='flex items-start gap-6'>
          <div className='shrink-0'>
            <p className='text-5xl font-black text-[#009736]'>ح</p>
          </div>
          <div>
            <p className='mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400'>
              حرية — Hurriya
            </p>
            <p className='text-sm leading-relaxed text-slate-600 dark:text-slate-400'>
              <em>Freedom</em> in Arabic. It is not a coincidence that it is our name. Freedom of
              voice. Freedom of authorship. Freedom from the structures that decide whose stories
              are worth telling. This is what we are building toward — one book at a time, starting
              from Gaza.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
