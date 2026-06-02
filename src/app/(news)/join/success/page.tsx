import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Welcome to UnTelevised Media',
  description: 'Thank you for becoming a member.',
  robots: { index: false, follow: false },
};

const TIER_LABELS: Record<string, string> = {
  supporter: 'Supporter',
  contributor: 'Contributor',
  patron: 'Patron',
};

export default async function JoinSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let tier: string | null = null;

  if (session_id && process.env.STRIPE_MEMBERSHIP_SECRET_KEY) {
    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_MEMBERSHIP_SECRET_KEY, {
        apiVersion: '2026-04-22.dahlia',
      });
      const session = await stripe.checkout.sessions.retrieve(session_id);
      tier = session.metadata?.tier ?? null;
    } catch {
      // Non-fatal — page renders without tier-specific copy
    }
  }

  const tierLabel = tier ? TIER_LABELS[tier] : null;

  return (
    <div className="min-h-screen bg-black text-slate-100">
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-950 to-black py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mb-8 inline-block bg-untele px-4 py-2">
            <span className="text-sm font-black uppercase tracking-widest text-white">
              Membership Confirmed
            </span>
          </div>

          <h1 className="mb-6 text-4xl font-black uppercase tracking-wide text-white md:text-5xl">
            {tierLabel ? `Welcome, ${tierLabel}` : 'Welcome to the Mission'}
          </h1>

          <p className="mb-4 text-xl leading-relaxed text-slate-300">
            Thank you for supporting UnTelevised Media. Your membership directly funds
            independent journalism free from corporate influence.
          </p>

          <p className="mb-12 text-sm text-zinc-400">
            A receipt has been sent to your email. You can manage or cancel your subscription
            at any time via the Stripe customer portal.
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

      <section className="bg-slate-950 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="mb-6 text-sm text-zinc-400 uppercase tracking-widest font-black">
            What happens next
          </p>
          <div className="grid gap-6 text-left sm:grid-cols-3">
            <div className="border border-slate-700 p-5">
              <div className="mb-3 text-2xl font-black text-untele">01</div>
              <p className="text-sm text-slate-300">
                Your membership is active immediately. No delays, no approvals.
              </p>
            </div>
            <div className="border border-slate-700 p-5">
              <div className="mb-3 text-2xl font-black text-untele">02</div>
              <p className="text-sm text-slate-300">
                You&rsquo;ll be billed monthly on today&rsquo;s date. Cancel anytime — no questions asked.
              </p>
            </div>
            <div className="border border-slate-700 p-5">
              <div className="mb-3 text-2xl font-black text-untele">03</div>
              <p className="text-sm text-slate-300">
                Member benefits (ad-free reading, exclusive articles) activate within minutes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
