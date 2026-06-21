// src/app/(user)/bookstore/returns/page.tsx
// Hurriya Publications — Returns & Refunds Policy

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Returns & Refunds — Hurriya Publications',
  description:
    'Refund and returns policy for Hurriya Publications. Digital purchases, physical books, and tip payments — what is covered, how to request a refund, and how long it takes.',
  openGraph: {
    title: 'Returns & Refunds — Hurriya Publications',
    description: 'Refund and returns policy for the Hurriya Publications bookstore.',
    type: 'website',
    images: [
      {
        url: '/hurriya-pub/Logo-alt.png',
        width: 1200,
        height: 630,
        alt: 'Hurriya Publications — Returns & Refunds',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Returns & Refunds — Hurriya Publications',
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

function PolicyBlock({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className='border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900'>
      <p className='mb-3 text-2xl'>{icon}</p>
      <p className='mb-3 text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white'>
        {title}
      </p>
      <div className='space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400'>
        {children}
      </div>
    </div>
  );
}

export default function ReturnsPage() {
  return (
    <main className='mx-auto max-w-4xl px-4 py-12 sm:px-6'>
      {/* ── Header ── */}
      <section className='mb-16'>
        <SectionLabel>Returns & Refunds</SectionLabel>

        <h1 className='mb-4 text-4xl font-black uppercase leading-none tracking-tight text-slate-900 dark:text-white sm:text-5xl'>
          Fair Returns.
          <br />
          <span className='text-[#009736]'>No Runaround.</span>
        </h1>

        <div className='mb-8 h-1 w-16 bg-[#009736]' />

        <div className='space-y-4 text-base leading-relaxed text-slate-700 dark:text-slate-300'>
          <p>
            We built this platform to put authors first — and that means being honest with readers
            too. This policy is written in plain language. If something goes wrong with your
            purchase, here is exactly what we will do about it.
          </p>
          <p className='border-l-4 border-[#009736] pl-5 italic text-slate-600 dark:text-slate-400'>
            Every refund we issue is a deduction from an author&apos;s earnings. We take that
            seriously. We will always try to resolve issues before processing a refund — but we
            will never trap a reader in a purchase that genuinely did not deliver what was
            promised.
          </p>
        </div>
      </section>

      {/* ── Policy Blocks ── */}
      <section className='mb-16'>
        <SectionLabel>By Purchase Type</SectionLabel>

        <div className='grid gap-6 sm:grid-cols-2'>
          <PolicyBlock icon='📄' title='Digital Downloads (PDF)'>
            <p>
              Digital files are generally{' '}
              <strong className='text-slate-800 dark:text-slate-200'>
                non-refundable once downloaded
              </strong>{' '}
              — the file cannot be returned in any meaningful sense.
            </p>
            <p>We will issue a full refund without question if:</p>
            <ul className='mt-1 space-y-1 pl-4'>
              <li className='before:mr-2 before:text-[#009736] before:content-["▸"]'>
                The file is corrupt or fails to open
              </li>
              <li className='before:mr-2 before:text-[#009736] before:content-["▸"]'>
                The wrong file was delivered
              </li>
              <li className='before:mr-2 before:text-[#009736] before:content-["▸"]'>
                The file is materially different from what was described
              </li>
              <li className='before:mr-2 before:text-[#009736] before:content-["▸"]'>
                You were charged but never received download access
              </li>
            </ul>
            <p className='mt-2'>
              Requests must be made within{' '}
              <strong className='text-slate-800 dark:text-slate-200'>14 days</strong> of purchase.
            </p>
          </PolicyBlock>

          <PolicyBlock icon='📦' title='Physical Books'>
            <p>
              Physical books may be returned within{' '}
              <strong className='text-slate-800 dark:text-slate-200'>30 days</strong> of the
              delivery date, provided the book is in its original, unread condition.
            </p>
            <p>We cover return shipping costs if the return is due to:</p>
            <ul className='mt-1 space-y-1 pl-4'>
              <li className='before:mr-2 before:text-[#009736] before:content-["▸"]'>
                A damaged or defective copy
              </li>
              <li className='before:mr-2 before:text-[#009736] before:content-["▸"]'>
                An incorrect item sent
              </li>
              <li className='before:mr-2 before:text-[#009736] before:content-["▸"]'>
                Significant delay beyond the estimated shipping window
              </li>
            </ul>
            <p className='mt-2'>
              For change-of-mind returns, the buyer is responsible for return shipping. Refunds are
              issued once the book is received and inspected.
            </p>
          </PolicyBlock>

          <PolicyBlock icon='♥' title='Tips'>
            <p>
              Tip payments go{' '}
              <strong className='text-slate-800 dark:text-slate-200'>
                directly to the author
              </strong>{' '}
              and are non-refundable.
            </p>
            <p>
              Tips are voluntary contributions — not a purchase of goods or services. Once
              processed, they cannot be reversed. Please tip only what you intend to give.
            </p>
            <p>
              If you were charged a tip amount you did not authorize (e.g. due to a technical
              error), contact us immediately and we will investigate.
            </p>
          </PolicyBlock>

          <PolicyBlock icon='🎁' title='Bundles'>
            <p>
              Bundle purchases (physical + digital) are treated according to the individual
              components: the digital portion follows the digital policy, the physical portion
              follows the physical returns policy.
            </p>
            <p>
              If the digital component of a bundle has been downloaded, a partial refund for the
              physical component only may be issued if the physical book is returned in original
              condition.
            </p>
          </PolicyBlock>
        </div>
      </section>

      {/* ── Process ── */}
      <section className='mb-16'>
        <SectionLabel>How to Request a Refund</SectionLabel>

        <div className='space-y-4'>
          {[
            {
              step: '01',
              title: 'Contact us',
              body: 'Email us at bookstore@untelevised.media or use the secure contact form. Include your order number, the item in question, and a brief description of the issue.',
            },
            {
              step: '02',
              title: 'We respond within 2 business days',
              body: 'We will confirm receipt and let you know whether we need any additional information — for example, a screenshot of a file error or confirmation of a delivery address for physical returns.',
            },
            {
              step: '03',
              title: 'Resolution',
              body: 'For approved refunds, the amount is returned to your original payment method within 5–10 business days depending on your bank. Stripe processing fees (2.9% + $0.30) are non-recoverable and will be deducted from refunds where applicable.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className='flex gap-5 border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900'
            >
              <span className='shrink-0 text-2xl font-black text-[#009736]'>{item.step}</span>
              <div>
                <p className='mb-1 text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white'>
                  {item.title}
                </p>
                <p className='text-sm leading-relaxed text-slate-600 dark:text-slate-400'>
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Disputes ── */}
      <section className='mb-16'>
        <SectionLabel>Disputes & Chargebacks</SectionLabel>

        <div className='space-y-4 text-base leading-relaxed text-slate-700 dark:text-slate-300'>
          <p>
            If you are considering filing a chargeback with your bank or card issuer, please
            contact us first. We resolve legitimate disputes quickly and without friction.
            Chargebacks that are filed without prior contact are treated as fraud and will be
            contested.
          </p>
          <p>
            We log download activity, delivery confirmations, and session data for all purchases.
            This information is used solely to resolve disputes — not for marketing or profiling.
          </p>
        </div>
      </section>

      {/* ── Contact CTA ── */}
      <section className='border border-[#009736] p-6'>
        <p className='mb-1 text-[10px] font-black uppercase tracking-widest text-[#009736]'>
          Need help with an order?
        </p>
        <p className='mb-4 text-sm text-slate-600 dark:text-slate-400'>
          We read every message and respond within 2 business days. Bring your order number and we
          will sort it out.
        </p>
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/secure-contact'
            className='inline-block bg-[#009736] px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white hover:opacity-90'
          >
            Contact Us &rarr;
          </Link>
          <Link
            href='/bookstore/orders'
            className='inline-block border border-slate-300 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-700 hover:border-[#009736] hover:text-[#009736] dark:border-slate-600 dark:text-slate-300'
          >
            View My Orders
          </Link>
        </div>
      </section>

      {/* ── Last updated ── */}
      <p className='mt-10 text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-600'>
        Last updated: May 2026 · Hurriya Publications, an imprint of UnTelevised Media
      </p>
    </main>
  );
}
