// src/app/(portal)/portal/page.tsx
// Staff dashboard — overview of content and inbox stats, scoped by role.
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { getSanityAuthorIdForCurrentUser } from '@/lib/portal/author-actions';
import { portalClient } from '@/lib/portal/fetch';
import {
  queryPortalArticlesByAuthor,
  queryPortalAllArticles,
  queryPortalContactSubmissions,
  queryPortalSecureContacts,
  queryPortalWhistleblowers,
  queryPortalJobApplications,
  queryPortalNewsletterSubscribers,
} from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard — Author Portal',
  robots: { index: false, follow: false },
};

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group block border bg-white p-5 transition-colors hover:border-untele dark:bg-slate-900 ${
        accent ? 'border-untele' : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <p className={`text-3xl font-black ${accent ? 'text-untele' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
      <p className='mt-1 text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-untele'>
        {label}
      </p>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ label }: { label: string }) {
  return (
    <div className='mb-4 flex items-center gap-3'>
      <div className='bg-untele px-3 py-1'>
        <span className='text-xs font-black uppercase tracking-widest text-white'>{label}</span>
      </div>
      <div className='h-px flex-1 bg-slate-200 dark:bg-slate-800' />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PortalDashboardPage() {
  const { id: clerkUserId, role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');

  // Fetch article data
  const sanityAuthorId = await getSanityAuthorIdForCurrentUser(clerkUserId);

  const [myArticles, allArticles] = await Promise.all([
    sanityAuthorId
      ? portalClient.fetch<{ publishedAt?: string; needsReview?: boolean; deletionRequest?: unknown }[]>(
          queryPortalArticlesByAuthor,
          { sanityAuthorId },
        )
      : Promise.resolve([]),
    isEditorPlus
      ? portalClient.fetch<{ publishedAt?: string; needsReview?: boolean; deletionRequest?: unknown }[]>(
          queryPortalAllArticles,
        )
      : Promise.resolve([]),
  ]);

  // My article stats
  const myPublished = myArticles.filter((a) => !!a.publishedAt).length;
  const myInReview = myArticles.filter((a) => !a.publishedAt && (a.needsReview || !!a.deletionRequest)).length;
  const myDrafts = myArticles.filter((a) => !a.publishedAt && !a.needsReview && !a.deletionRequest).length;

  // Editor-wide article stats
  const allPublished = allArticles.filter((a) => !!a.publishedAt).length;
  const allInReview = allArticles.filter((a) => !a.publishedAt && (a.needsReview || !!a.deletionRequest)).length;
  const allDrafts = allArticles.filter((a) => !a.publishedAt && !a.needsReview && !a.deletionRequest).length;

  // Inbox counts (editor+ only)
  let contactCount = 0;
  let secureCount = 0;
  let newSecureCount = 0;
  let whistleblowerCount = 0;
  let criticalWhistleCount = 0;
  let applicationsCount = 0;
  let subscribersCount = 0;

  if (isEditorPlus) {
    const [contacts, secureContacts, whistleblowers, applications, subscribers] = await Promise.all([
      portalClient.fetch<{ _id: string }[]>(queryPortalContactSubmissions),
      portalClient.fetch<{ _id: string; status?: string }[]>(queryPortalSecureContacts),
      portalClient.fetch<{ _id: string; severity?: string }[]>(queryPortalWhistleblowers),
      portalClient.fetch<{ _id: string }[]>(queryPortalJobApplications),
      portalClient.fetch<{ _id: string }[]>(queryPortalNewsletterSubscribers),
    ]);

    contactCount = contacts?.length ?? 0;
    secureCount = secureContacts?.length ?? 0;
    newSecureCount = secureContacts?.filter((c) => (c.status ?? 'new') === 'new').length ?? 0;
    whistleblowerCount = whistleblowers?.length ?? 0;
    criticalWhistleCount = whistleblowers?.filter((w) => w.severity === 'critical').length ?? 0;
    applicationsCount = applications?.length ?? 0;
    subscribersCount = subscribers?.length ?? 0;
  }

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} />

      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        {/* Page heading */}
        <div className='mb-8'>
          <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
            Staff Dashboard
          </h1>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400 capitalize'>
            {role ?? 'Author'} view
          </p>
        </div>

        {/* ── My Articles ─────────────────────────────────────────────── */}
        <section className='mb-10'>
          <SectionHeader label='My Articles' />
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <StatCard label='Total' value={myArticles.length} href='/portal/articles' />
            <StatCard label='Published' value={myPublished} href='/portal/articles' />
            <StatCard label='In Review' value={myInReview} href='/portal/articles' accent={myInReview > 0} />
            <StatCard label='Drafts' value={myDrafts} href='/portal/articles' />
          </div>
        </section>

        {/* ── Newsroom Overview (editor+) ──────────────────────────────── */}
        {isEditorPlus && (
          <section className='mb-10'>
            <SectionHeader label='Newsroom' />
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <StatCard label='All Articles' value={allArticles.length} href='/portal/articles' />
              <StatCard label='Published' value={allPublished} href='/portal/articles' />
              <StatCard
                label='Pending Review'
                value={allInReview}
                href='/portal/articles'
                accent={allInReview > 0}
              />
              <StatCard label='Drafts' value={allDrafts} href='/portal/articles' />
            </div>
          </section>
        )}

        {/* ── Inbox (editor+) ──────────────────────────────────────────── */}
        {isEditorPlus && (
          <section className='mb-10'>
            <SectionHeader label='Inbox' />
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <StatCard label='Applications' value={applicationsCount} href='/portal/applications' />
              <StatCard label='Contact Submissions' value={contactCount} href='/portal/contact' />
              <StatCard
                label={`Secure Contact${newSecureCount > 0 ? ` (${newSecureCount} new)` : ''}`}
                value={secureCount}
                href='/portal/secure-contact'
                accent={newSecureCount > 0}
              />
              <StatCard
                label={`Whistleblower${criticalWhistleCount > 0 ? ` (${criticalWhistleCount} critical)` : ''}`}
                value={whistleblowerCount}
                href='/portal/whistleblower'
                accent={criticalWhistleCount > 0}
              />
              <StatCard label='Subscribers' value={subscribersCount} href='/portal/subscribers' />
            </div>
          </section>
        )}

        {/* ── Quick links ───────────────────────────────────────────────── */}
        <section>
          <SectionHeader label='Quick Links' />
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/portal/articles/new'
              className='bg-untele px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:opacity-90'
            >
              + New Article
            </Link>
            <Link
              href='/portal/sources/new'
              className='border border-slate-300 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-untele hover:text-untele dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            >
              + New Source
            </Link>
            <Link
              href='/portal/profile'
              className='border border-slate-300 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-untele hover:text-untele dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            >
              Edit Profile
            </Link>
            {isEditorPlus && (
              <a
                href='/studio'
                target='_blank'
                rel='noopener noreferrer'
                className='border border-slate-300 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-untele hover:text-untele dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              >
                Open Studio ↗
              </a>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
