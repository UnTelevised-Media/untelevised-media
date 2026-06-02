import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Thank You — UnTelevised Media',
  description: 'Thank you for supporting independent journalism.',
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-black text-slate-100">
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-950 to-black py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mb-8 inline-block bg-untele px-4 py-2">
            <span className="text-sm font-black uppercase tracking-widest text-white">
              Donation Received
            </span>
          </div>
          <h1 className="mb-6 text-4xl font-black uppercase tracking-wide text-white md:text-5xl">
            Thank You
          </h1>
          <p className="mb-4 text-xl leading-relaxed text-slate-300">
            Your one-time donation goes directly to funding independent, uncensored reporting.
            We&rsquo;re grateful for your support.
          </p>
          <p className="mb-12 text-sm text-zinc-400">
            A receipt has been sent to your email.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="bg-untele px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600"
            >
              READ THE LATEST
            </Link>
            <Link
              href="/newsletter-subscribe"
              className="border-2 border-white bg-transparent px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
            >
              JOIN THE NEWSLETTER
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
