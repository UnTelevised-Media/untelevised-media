import type { Metadata } from 'next';
import Link from 'next/link';
import { MembershipTiers } from '@/components/membership/MembershipTiers';
import { OneTimeDonation } from '@/components/membership/OneTimeDonation';
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup';
import DonateLink from '@/components/donate/DonateLink';
import { membershipAnonClient } from '@/lib/membership/supabase';

export const metadata: Metadata = {
  title: 'Support UnTelevised Media — Memberships, Donations & More',
  description:
    'Fund independent journalism from $5. Choose a recurring membership, make a one-time donation, or support us in other ways.',
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

export default async function SupportPage() {
  const memberCount = await getActiveMemberCount();

  return (
    <div className="min-h-screen bg-black text-slate-100">

      {/* ── HERO ── */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-950 to-black py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-center space-x-4">
            <div className="bg-untele px-4 py-2">
              <h1 className="text-3xl font-black uppercase tracking-widest text-white">
                SUPPORT THE MISSION
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
              runs on readers like you. Choose how you want to make a difference.
            </p>
            {memberCount > 0 && (
              <p className="text-sm text-zinc-400">
                Join{' '}
                <span className="font-black text-white">{memberCount.toLocaleString()}</span>{' '}
                supporters already funding uncensored reporting.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── RECURRING MEMBERSHIPS ── */}
      <section className="border-b border-slate-800 bg-black py-16" id="membership">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-4 flex items-center space-x-4">
            <div className="bg-untele px-4 py-2">
              <h3 className="text-xl font-black uppercase tracking-widest text-white">
                RECURRING MEMBERSHIP
              </h3>
            </div>
            <div className="h-px flex-1 bg-slate-700" />
          </div>
          <p className="mb-10 text-sm text-zinc-400">
            The most sustainable way to support us. Cancel any time.
          </p>
          <MembershipTiers />
        </div>
      </section>

      {/* ── ONE-TIME DONATION ── */}
      <section className="border-b border-slate-800 bg-slate-950 py-16" id="donate">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 flex items-center space-x-4">
            <div className="bg-untele px-4 py-2">
              <h3 className="text-xl font-black uppercase tracking-widest text-white">
                ONE-TIME DONATION
              </h3>
            </div>
            <div className="h-px flex-1 bg-slate-700" />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Stripe NYOP */}
            <div className="md:col-span-1">
              <OneTimeDonation />
            </div>

            {/* CashApp */}
            <div className="flex flex-col border border-slate-700 bg-black p-6 transition-all hover:border-untele">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white">
                $
              </div>
              <h4 className="mb-3 text-lg font-bold uppercase tracking-wide text-white">
                CASHAPP
              </h4>
              <p className="mb-4 flex-1 text-sm text-slate-300">
                Quick and secure mobile payments.
              </p>
              <DonateLink
                href="https://cash.app/$UnTelevisedMedia"
                platform="cashapp"
                className="bg-untele px-4 py-3 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600"
              >
                $UnTelevisedMedia
              </DonateLink>
            </div>

            {/* Venmo */}
            <div className="flex flex-col border border-slate-700 bg-black p-6 transition-all hover:border-untele">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white">
                V
              </div>
              <h4 className="mb-3 text-lg font-bold uppercase tracking-wide text-white">VENMO</h4>
              <p className="mb-4 flex-1 text-sm text-slate-300">
                Social payment platform.
              </p>
              <DonateLink
                href="https://venmo.com/UnTelevised"
                platform="venmo"
                className="bg-untele px-4 py-3 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600"
              >
                @UnTelevised
              </DonateLink>
            </div>
          </div>

          {/* Large donations */}
          <div className="mt-8 flex flex-col border border-slate-700 bg-black p-6 transition-all hover:border-untele sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="mb-1 text-lg font-bold uppercase tracking-wide text-white">
                LARGE DONATIONS & EQUIPMENT
              </h4>
              <p className="text-sm text-slate-300">
                For larger contributions or equipment donations (cameras, laptops, safety gear),
                contact us directly.
              </p>
            </div>
            <a
              href="mailto:support@untelevised.media"
              className="mt-4 shrink-0 bg-untele px-6 py-3 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600 sm:ml-8 sm:mt-0"
            >
              CONTACT US
            </a>
          </div>
        </div>
      </section>

      {/* ── MORE WAYS TO HELP ── */}
      <section className="border-b border-slate-800 bg-black py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 flex items-center space-x-4">
            <div className="bg-untele px-4 py-2">
              <h3 className="text-xl font-black uppercase tracking-widest text-white">
                MORE WAYS TO HELP
              </h3>
            </div>
            <div className="h-px flex-1 bg-slate-700" />
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex h-full flex-col border border-slate-700 bg-slate-950 p-6 transition-all hover:border-untele">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white">S</div>
              <h4 className="mb-3 text-lg font-bold uppercase tracking-wide text-white">SHARE OUR WORK</h4>
              <p className="flex-1 text-sm text-slate-300">
                Amplify our stories on social media. Every share helps break through the noise and
                reaches people who need to see the truth.
              </p>
            </div>

            <div className="flex h-full flex-col border border-slate-700 bg-slate-950 p-6 transition-all hover:border-untele">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white">T</div>
              <h4 className="mb-3 text-lg font-bold uppercase tracking-wide text-white">SEND A TIP</h4>
              <p className="mb-4 flex-1 text-sm text-slate-300">
                Have information the public needs to know? We protect our sources and investigate
                every credible lead with the utmost care.
              </p>
              <Link
                href="/whistleblower"
                className="border border-untele px-4 py-2 text-center text-xs font-black uppercase tracking-widest text-untele transition-colors hover:bg-untele hover:text-white"
              >
                WHISTLEBLOWER PORTAL
              </Link>
            </div>

            <div className="flex h-full flex-col border border-slate-700 bg-slate-950 p-6 transition-all hover:border-untele">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white">V</div>
              <h4 className="mb-3 text-lg font-bold uppercase tracking-wide text-white">VOLUNTEER</h4>
              <p className="mb-4 flex-1 text-sm text-slate-300">
                Contribute your skills in research, translation, social media, or technical
                support. Every talent strengthens the mission.
              </p>
              <a
                href="mailto:support@untelevised.media"
                className="border border-untele px-4 py-2 text-center text-xs font-black uppercase tracking-widest text-untele transition-colors hover:bg-untele hover:text-white"
              >
                GET INVOLVED
              </a>
            </div>

            <div className="flex h-full flex-col border border-slate-700 bg-slate-950 p-6 transition-all hover:border-untele">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white">C</div>
              <h4 className="mb-3 text-lg font-bold uppercase tracking-wide text-white">SUBSCRIBE & ENGAGE</h4>
              <p className="flex-1 text-sm text-slate-300">
                Follow our updates, comment thoughtfully, and engage with our content. Active
                communities make stronger journalism.
              </p>
            </div>

            <div className="flex h-full flex-col border border-slate-700 bg-slate-950 p-6 transition-all hover:border-untele">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white">A</div>
              <h4 className="mb-3 text-lg font-bold uppercase tracking-wide text-white">SPREAD AWARENESS</h4>
              <p className="flex-1 text-sm text-slate-300">
                Tell friends, family, and colleagues about independent media. Word of mouth is
                powerful in building a truth-seeking community.
              </p>
            </div>

            <div className="flex h-full flex-col border border-slate-700 bg-slate-950 p-6 transition-all hover:border-untele">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-untele text-xl font-black text-white">W</div>
              <h4 className="mb-3 text-lg font-bold uppercase tracking-wide text-white">SECURE CONTACT</h4>
              <p className="mb-4 flex-1 text-sm text-slate-300">
                Need to reach us privately? Use our encrypted contact channel for sensitive
                communications.
              </p>
              <Link
                href="/secure-contact"
                className="border border-untele px-4 py-2 text-center text-xs font-black uppercase tracking-widest text-untele transition-colors hover:bg-untele hover:text-white"
              >
                SECURE CONTACT
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY INDEPENDENCE MATTERS ── */}
      <section className="border-b border-slate-800 bg-slate-950 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 flex items-center space-x-4">
                <div className="bg-untele px-3 py-1">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">
                    WHY INDEPENDENCE MATTERS
                  </h3>
                </div>
                <div className="h-px flex-1 bg-slate-700" />
              </div>
              <h4 className="mb-4 text-2xl font-bold text-white">FREE FROM CORPORATE CONTROL</h4>
              <p className="mb-4 leading-relaxed text-slate-300">
                Corporate media serves advertisers and shareholders, not the public interest. When
                news organizations depend on corporate funding, they can&rsquo;t bite the hand that feeds
                them.
              </p>
              <p className="leading-relaxed text-slate-300">
                Independent media funded by readers like you can investigate anyone, question
                everything, and report without fear of losing advertising revenue.
              </p>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-untele bg-black p-6">
                <h5 className="mb-3 text-lg font-bold text-white">NO CORPORATE SPONSORS</h5>
                <p className="text-slate-300">
                  We don&rsquo;t take money from corporations, so we can investigate them without
                  conflict of interest.
                </p>
              </div>
              <div className="border-l-4 border-untele bg-black p-6">
                <h5 className="mb-3 text-lg font-bold text-white">NO GOVERNMENT FUNDING</h5>
                <p className="text-slate-300">
                  Government funding comes with strings attached. We remain free to criticize any
                  administration.
                </p>
              </div>
              <div className="border-l-4 border-untele bg-black p-6">
                <h5 className="mb-3 text-lg font-bold text-white">READER-SUPPORTED</h5>
                <p className="text-slate-300">
                  When readers fund journalism, journalists serve readers — not advertisers or
                  politicians.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRANSPARENCY ── */}
      <section className="border-b border-slate-800 bg-black py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <div className="mb-6 inline-block bg-untele px-4 py-2">
              <h3 className="text-xl font-black uppercase tracking-widest text-white">
                TRANSPARENCY
              </h3>
            </div>
            <h4 className="mb-4 text-3xl font-bold text-white">HOW WE OPERATE</h4>
            <p className="mx-auto max-w-3xl text-lg text-slate-300">
              We practice what we preach. Here&rsquo;s how we maintain transparency in our operations.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 text-4xl font-black text-untele">100%</div>
              <h5 className="mb-2 text-lg font-bold uppercase tracking-wide text-white">
                FUNDING TRANSPARENCY
              </h5>
              <p className="text-sm text-slate-400">
                All funding sources are publicly disclosed. No hidden corporate sponsors.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 text-4xl font-black text-untele">OPEN</div>
              <h5 className="mb-2 text-lg font-bold uppercase tracking-wide text-white">
                EDITORIAL PROCESS
              </h5>
              <p className="text-sm text-slate-400">
                Our editorial decisions are made independently, without outside influence.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 text-4xl font-black text-untele">ZERO</div>
              <h5 className="mb-2 text-lg font-bold uppercase tracking-wide text-white">
                CONFLICTS OF INTEREST
              </h5>
              <p className="text-sm text-slate-400">
                We disclose any potential conflicts and maintain strict ethical standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="border-b border-slate-800 bg-slate-950 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <NewsletterSignup list="news" source="support" />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t-4 border-untele bg-gradient-to-b from-untele/20 to-black py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h3 className="mb-4 text-3xl font-black uppercase tracking-widest text-white">
            EVERY DOLLAR COUNTS
          </h3>
          <p className="mb-8 text-lg text-slate-300">
            Whether it&rsquo;s $5 or $500, your contribution directly funds the truth. No executive
            bonuses, no shareholder profits — just fearless journalism.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href="#membership"
              className="bg-untele px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600"
            >
              BECOME A MEMBER
            </a>
            <a
              href="#donate"
              className="border-2 border-white bg-transparent px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
            >
              ONE-TIME DONATION
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
