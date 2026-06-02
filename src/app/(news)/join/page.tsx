import type { Metadata } from 'next';
import Link from 'next/link';
import { MembershipTiers } from '@/components/membership/MembershipTiers';
import { membershipAnonClient } from '@/lib/membership/supabase';

export const metadata: Metadata = {
  title: 'Join UnTelevised Media — Support Independent Journalism',
  description:
    'Become a member and fund uncensored, independent journalism. Recurring memberships from $5/month directly support our reporters and mission.',
};

async function getActiveMemberCount(): Promise<number> {
  try {
    const { count, error } = await membershipAnonClient
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function JoinPage() {
  const memberCount = await getActiveMemberCount();

  return (
    <div className="min-h-screen bg-black text-slate-100">
      {/* HERO */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-950 to-black py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-center space-x-4">
            <div className="bg-untele px-4 py-2">
              <h1 className="text-3xl font-black uppercase tracking-widest text-white">
                JOIN THE MISSION
              </h1>
            </div>
            <div className="h-px flex-1 bg-slate-700" />
          </div>

          <div className="max-w-4xl">
            <h2 className="mb-6 text-4xl font-black uppercase tracking-wide text-white md:text-5xl">
              FUND FEARLESS JOURNALISM
            </h2>
            <p className="mb-4 text-xl leading-relaxed text-slate-300">
              Independent journalism doesn&rsquo;t run on algorithms or corporate sponsorships. It
              runs on readers like you.
            </p>
            {memberCount > 0 && (
              <p className="text-sm text-zinc-400">
                Join{' '}
                <span className="font-black text-white">{memberCount.toLocaleString()}</span>{' '}
                supporters funding uncensored reporting.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* TIERS */}
      <section className="border-b border-slate-800 bg-black py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 flex items-center space-x-4">
            <div className="bg-untele px-4 py-2">
              <h3 className="text-xl font-black uppercase tracking-widest text-white">
                MEMBERSHIP TIERS
              </h3>
            </div>
            <div className="h-px flex-1 bg-slate-700" />
          </div>
          <MembershipTiers />
          <p className="mt-6 text-center text-xs text-zinc-500">
            Recurring monthly billing. Cancel any time from your account dashboard.
            Powered by Stripe — your card details are never stored by us.
          </p>
        </div>
      </section>

      {/* WHY */}
      <section className="border-b border-slate-800 bg-slate-950 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 flex items-center space-x-4">
            <div className="bg-untele px-3 py-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                WHY IT MATTERS
              </h3>
            </div>
            <div className="h-px flex-1 bg-slate-700" />
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div className="border-l-4 border-untele bg-black p-6">
                <h4 className="mb-3 text-lg font-bold text-white">NO CORPORATE OWNERS</h4>
                <p className="text-slate-300">
                  We answer to our readers — not advertisers, not hedge funds, not political
                  donors. Membership revenue lets us say no to compromises.
                </p>
              </div>
              <div className="border-l-4 border-untele bg-black p-6">
                <h4 className="mb-3 text-lg font-bold text-white">FIELD REPORTING</h4>
                <p className="text-slate-300">
                  Your subscription funds travel, equipment, and safety gear for correspondents
                  covering stories where mainstream media won&rsquo;t go.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="border-l-4 border-untele bg-black p-6">
                <h4 className="mb-3 text-lg font-bold text-white">INVESTIGATIVE WORK</h4>
                <p className="text-slate-300">
                  Deep-dive investigations take time and resources. Recurring memberships give us
                  the runway to pursue stories that matter, not just what clicks.
                </p>
              </div>
              <div className="border-l-4 border-untele bg-black p-6">
                <h4 className="mb-3 text-lg font-bold text-white">SUSTAINABLE JOURNALISM</h4>
                <p className="text-slate-300">
                  One-time donations are unpredictable. A $5/month membership creates a stable
                  foundation that lets us plan, hire, and invest in long-form coverage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t-4 border-untele bg-gradient-to-b from-untele/20 to-black py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h3 className="mb-4 text-3xl font-black uppercase tracking-widest text-white">
            PREFER A ONE-TIME DONATION?
          </h3>
          <p className="mb-8 text-lg text-slate-300">
            Every contribution helps. If a recurring membership isn&rsquo;t right for you, a
            one-time donation is always welcome.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/donate"
              className="bg-untele px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600"
            >
              ONE-TIME DONATION
            </Link>
            <Link
              href="/secure-contact"
              className="border-2 border-white bg-transparent px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
            >
              CONTACT US
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
