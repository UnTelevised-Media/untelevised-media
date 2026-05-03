// src/app/(portal)/portal/page.tsx
// Staff dashboard — overview of content and inbox stats, scoped by role.
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import { getSanityAuthorIdForCurrentUser } from '@/lib/portal/author-actions';
import { portalSanityFetch } from '@/lib/portal/live';
import {
  queryPortalArticlesByAuthor,
  queryPortalAllArticles,
  queryPortalContactSubmissions,
  queryPortalSecureContacts,
  queryPortalWhistleblowers,
  queryPortalJobApplications,
  queryPortalNewsletterSubscribers,
  queryPortalLatestBrief,
  queryPortalAuthors,
  queryPortalMyPitchesForBrief,
  queryPortalMyClaimedPitches,
  queryPortalAllClaimedPitches,
  queryPortalAllBriefs,
} from '@/lib/portal/queries';
import PortalNav from '@/components/portal/PortalNav';
import { BriefPanel, type Brief, type PortalAuthor, type BriefSummary } from '@/components/portal/BriefPanel';
import { type ClaimedPitchSummary } from '@/components/portal/ClaimedPitchCard';
import { ClaimedPitchesPanel } from '@/components/portal/ClaimedPitchesPanel';
import BookstoreOrdersWidget, {
  type DigitalSaleRow,
  type ShipmentPendingRow,
} from '@/components/portal/BookstoreOrdersWidget';
import AddBookModal from '@/components/portal/AddBookModal';
import PendingPayoutsWidget, { type PayoutRow } from '@/components/portal/PendingPayoutsWidget';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryBooksByAuthorClerkId } from '@/lib/sanity/lib/queries';
import { shopServiceClient } from '@/lib/bookstore/supabase';
import type { SanityBook } from '@/lib/bookstore/types';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard — Author Portal',
  robots: { index: false, follow: false },
};

// ---------------------------------------------------------------------------
// Inline stat strip — compact horizontal row, used for My Articles / Newsroom
// ---------------------------------------------------------------------------

function StatStrip({
  stats,
  href,
}: {
  stats: { label: string; value: number; accent?: boolean }[];
  href: string;
}) {
  return (
    <Link
      href={href}
      className='group flex flex-wrap items-center gap-x-6 gap-y-1 border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-untele dark:border-slate-700 dark:bg-slate-900'
    >
      {stats.map(({ label, value, accent }) => (
        <div key={label} className='flex items-baseline gap-1.5'>
          <span
            className={`text-xl font-black leading-none ${accent ? 'text-untele' : 'text-slate-900 group-hover:text-untele dark:text-white'}`}
          >
            {value}
          </span>
          <span className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>{label}</span>
        </div>
      ))}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Stat card — used for Inbox items
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
      className={`group block border bg-white px-3 py-2.5 transition-colors hover:border-untele dark:bg-slate-900 ${
        accent ? 'border-untele' : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <p className={`text-xl font-black leading-none ${accent ? 'text-untele' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
      <p className='mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-untele'>
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
    <div className='mb-2 flex items-center gap-3'>
      <div className='bg-untele px-2 py-0.5'>
        <span className='text-[10px] font-black uppercase tracking-widest text-white'>{label}</span>
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

  type ArticleRow = { _id: string; needsReview?: boolean; deletionRequest?: unknown };

  const [briefRes, allBriefsRes] = await Promise.all([
    portalSanityFetch({ query: queryPortalLatestBrief }),
    portalSanityFetch({ query: queryPortalAllBriefs }),
  ]);
  const latestBrief = briefRes.data as Brief | null;
  const allBriefs = (allBriefsRes.data ?? []) as BriefSummary[];

  // Fetch author's claimed pitches for this brief (storyKey → pitchId map)
  const myPitchesRes = sanityAuthorId && latestBrief
    ? await portalSanityFetch({
        query: queryPortalMyPitchesForBrief,
        params: { authorId: sanityAuthorId, briefId: latestBrief._id },
      })
    : null;
  const myPitchesRaw = (myPitchesRes?.data ?? []) as Array<{ _id: string; storyKey: string }>;
  const myPitchMap: Record<string, string> = {};
  for (const p of myPitchesRaw) myPitchMap[p.storyKey] = p._id;

  const [myArticlesRes, allArticlesRes, authorsRes, claimedPitchesRes] = await Promise.all([
    sanityAuthorId
      ? portalSanityFetch({ query: queryPortalArticlesByAuthor, params: { sanityAuthorId } })
      : null,
    isEditorPlus ? portalSanityFetch({ query: queryPortalAllArticles }) : null,
    isEditorPlus ? portalSanityFetch({ query: queryPortalAuthors }) : null,
    isEditorPlus
      ? portalSanityFetch({ query: queryPortalAllClaimedPitches })
      : sanityAuthorId
        ? portalSanityFetch({ query: queryPortalMyClaimedPitches, params: { authorId: sanityAuthorId } })
        : null,
  ]);
  const myArticles = ((myArticlesRes?.data ?? []) as ArticleRow[]);
  const allArticles = ((allArticlesRes?.data ?? []) as ArticleRow[]);
  const authors = ((authorsRes?.data ?? []) as PortalAuthor[]);
  const claimedPitches = ((claimedPitchesRes?.data ?? []) as ClaimedPitchSummary[]);

  // My article stats — "drafts." prefix is the authoritative published/draft signal
  const myPublished = myArticles.filter((a) => !a._id.startsWith('drafts.')).length;
  const myInReview = myArticles.filter((a) => a._id.startsWith('drafts.') && (a.needsReview || !!a.deletionRequest)).length;
  const myDrafts = myArticles.filter((a) => a._id.startsWith('drafts.') && !a.needsReview && !a.deletionRequest).length;

  // Editor-wide article stats
  const allPublished = allArticles.filter((a) => !a._id.startsWith('drafts.')).length;
  const allInReview = allArticles.filter((a) => a._id.startsWith('drafts.') && (a.needsReview || !!a.deletionRequest)).length;
  const allDrafts = allArticles.filter((a) => a._id.startsWith('drafts.') && !a.needsReview && !a.deletionRequest).length;

  // ── Bookstore data for dashboard widget ────────────────────────────────────
  let bookCount = 0;
  let bookUnitsSold = 0;
  let digitalSales: DigitalSaleRow[] = [];
  let shipmentsPending: ShipmentPendingRow[] = [];
  let pendingPayouts: PayoutRow[] = [];
  let bookstoreAvailable = false;
  const isAdmin = role === 'admin';

  try {
    if (process.env.SUPABASE_SHOP_URL) {
      const myBooks = await sanityFetch<SanityBook[]>({
        query: queryBooksByAuthorClerkId,
        params: { clerkId: clerkUserId },
        tags: ['book'],
      });
      const myBookList = myBooks ?? [];
      bookCount = myBookList.length;
      const myBookIds = myBookList.map((b) => b._id);

      type ItemRow = {
        book_title: string;
        quantity: number;
        is_digital: boolean;
        order: {
          id: string;
          order_number: string;
          status: string;
          created_at: string;
          fulfilled_at: string | null;
          customer: { email: string; full_name: string | null } | null;
        } | null;
      };

      let query = shopServiceClient
        .from('order_items')
        .select(
          'book_title, quantity, is_digital, order:orders(id, order_number, status, created_at, fulfilled_at, customer:customers(email, full_name))',
        )
        .order('created_at', { ascending: false })
        .limit(200);

      if (myBookIds.length > 0 && !isEditorPlus) {
        query = query.in('sanity_book_id', myBookIds);
      }

      // author_sales gives an accurate unit count scoped by clerk ID —
      // unaffected by whether Sanity book IDs are populated in myBookIds
      const unitsSoldQuery = isEditorPlus
        ? shopServiceClient.from('author_sales').select('order_item:order_items(quantity)', { count: 'exact' })
        : shopServiceClient
            .from('author_sales')
            .select('order_item:order_items(quantity)')
            .eq('author_clerk_id', clerkUserId)
            .eq('is_tip', false);

      const [{ data: rawItems, error: itemsError }, { data: unitRows }] = await Promise.all([
        query,
        unitsSoldQuery,
      ]);
      if (itemsError) console.error('[portal/dashboard] order_items query failed:', itemsError.message);
      const items = ((rawItems ?? []) as ItemRow[]).filter(
        (i) => i.order && !['cancelled', 'refunded'].includes(i.order.status),
      );

      bookUnitsSold = ((unitRows ?? []) as Array<{ order_item: { quantity: number } | null }>)
        .reduce((s, r) => s + (r.order_item?.quantity ?? 0), 0);

      digitalSales = items
        .filter((i) => i.is_digital)
        .slice(0, 50)
        .map((i, idx) => ({
          id: `d-${idx}`,
          order_number: i.order!.order_number,
          book_title: i.book_title,
          quantity: i.quantity,
          created_at: i.order!.created_at,
          customer_email: i.order!.customer?.email,
        }));

      shipmentsPending = items
        .filter(
          (i) =>
            !i.is_digital &&
            ['paid', 'processing'].includes(i.order!.status) &&
            !i.order!.fulfilled_at,
        )
        .slice(0, 50)
        .map((i, idx) => ({
          id: `s-${idx}`,
          order_number: i.order!.order_number,
          book_title: i.book_title,
          quantity: i.quantity,
          created_at: i.order!.created_at,
          status: i.order!.status,
          customer_email: i.order!.customer?.email,
          customer_name: i.order!.customer?.full_name,
        }));

      // Pending payouts — scoped by role
      const payoutsQuery = isAdmin
        ? shopServiceClient
            .from('payouts')
            .select('id, author_clerk_id, period_start, period_end, gross_cents, net_cents, notes, created_at')
            .eq('status', 'pending')
            .order('period_end', { ascending: false })
            .limit(50)
        : shopServiceClient
            .from('payouts')
            .select('id, author_clerk_id, period_start, period_end, gross_cents, net_cents, notes, created_at')
            .eq('status', 'pending')
            .eq('author_clerk_id', clerkUserId)
            .order('period_end', { ascending: false });

      const { data: payoutsData } = await payoutsQuery;
      pendingPayouts = (payoutsData ?? []) as PayoutRow[];

      bookstoreAvailable = true;
    }
  } catch {
    // Supabase unavailable — widgets degrade gracefully
  }

  // Inbox counts (editor+ only)
  let contactCount = 0;
  let secureCount = 0;
  let newSecureCount = 0;
  let whistleblowerCount = 0;
  let criticalWhistleCount = 0;
  let applicationsCount = 0;
  let subscribersCount = 0;

  if (isEditorPlus) {
    const [contactsRes, secureRes, whistleRes, appsRes, subsRes] = await Promise.all([
      portalSanityFetch({ query: queryPortalContactSubmissions }),
      portalSanityFetch({ query: queryPortalSecureContacts }),
      portalSanityFetch({ query: queryPortalWhistleblowers }),
      portalSanityFetch({ query: queryPortalJobApplications }),
      portalSanityFetch({ query: queryPortalNewsletterSubscribers }),
    ]);
    const contacts = (contactsRes.data ?? []) as { _id: string }[];
    const secureContacts = (secureRes.data ?? []) as { _id: string; status?: string }[];
    const whistleblowers = (whistleRes.data ?? []) as { _id: string; severity?: string }[];
    const applications = (appsRes.data ?? []) as { _id: string }[];
    const subscribers = (subsRes.data ?? []) as { _id: string }[];

    contactCount = contacts.length;
    secureCount = secureContacts.length;
    newSecureCount = secureContacts.filter((c) => (c.status ?? 'new') === 'new').length;
    whistleblowerCount = whistleblowers.length;
    criticalWhistleCount = whistleblowers.filter((w) => w.severity === 'critical').length;
    applicationsCount = applications.length;
    subscribersCount = subscribers.length;
  }

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} role={role} />

      <main className='mx-auto max-w-7xl px-4 py-5 sm:px-6'>
        {/* Page heading */}
        <div className='mb-4'>
          <h1 className='text-base font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
            Staff Dashboard
            <span className='ml-2 text-xs font-bold tracking-normal text-slate-400 capitalize'>
              — {role ?? 'Author'}
            </span>
          </h1>
        </div>

        {/* ── My Articles ─────────────────────────────────────────────── */}
        <section className='mb-3'>
          <SectionHeader label='My Articles' />
          <StatStrip
            href='/portal/articles'
            stats={[
              { label: 'Total', value: myArticles.length },
              { label: 'Published', value: myPublished },
              { label: 'In Review', value: myInReview, accent: myInReview > 0 },
              { label: 'Drafts', value: myDrafts },
            ]}
          />
        </section>

        {/* ── My Books ─────────────────────────────────────────────────── */}
        <section className='mb-3'>
          <SectionHeader label='My Books' />
          <Link
            href='/portal/books'
            className='group flex flex-wrap items-center gap-x-6 gap-y-1 border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-untele dark:border-slate-700 dark:bg-slate-900'
          >
            <div className='flex items-baseline gap-1.5'>
              <span className='text-xl font-black leading-none text-slate-900 group-hover:text-untele dark:text-white'>
                {bookCount}
              </span>
              <span className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>
                {bookCount === 1 ? 'Book' : 'Books'}
              </span>
            </div>
            {bookstoreAvailable && (
              <div className='flex items-baseline gap-1.5'>
                <span className='text-xl font-black leading-none text-slate-900 group-hover:text-untele dark:text-white'>
                  {bookUnitsSold}
                </span>
                <span className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>
                  Units Sold
                </span>
              </div>
            )}
            {bookstoreAvailable && shipmentsPending.length > 0 && (
              <div className='flex items-baseline gap-1.5'>
                <span className='text-xl font-black leading-none text-untele'>
                  {shipmentsPending.length}
                </span>
                <span className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>
                  To Ship
                </span>
              </div>
            )}
          </Link>
        </section>

        {/* ── Newsroom Overview (editor+) ──────────────────────────────── */}
        {isEditorPlus && (
          <section className='mb-3'>
            <SectionHeader label='Newsroom' />
            <StatStrip
              href='/portal/articles'
              stats={[
                { label: 'All Articles', value: allArticles.length },
                { label: 'Published', value: allPublished },
                { label: 'Pending Review', value: allInReview, accent: allInReview > 0 },
                { label: 'Drafts', value: allDrafts },
              ]}
            />
          </section>
        )}

        {/* ── Inbox (editor+) ──────────────────────────────────────────── */}
        {isEditorPlus && (
          <section className='mb-5'>
            <SectionHeader label='Inbox' />
            <div className='grid gap-2 sm:grid-cols-3 lg:grid-cols-5'>
              <StatCard label='Applications' value={applicationsCount} href='/portal/applications' />
              <StatCard label='Contact' value={contactCount} href='/portal/contact' />
              <StatCard
                label={`Secure${newSecureCount > 0 ? ` · ${newSecureCount} new` : ''}`}
                value={secureCount}
                href='/portal/secure-contact'
                accent={newSecureCount > 0}
              />
              <StatCard
                label={`Whistleblower${criticalWhistleCount > 0 ? ` · ${criticalWhistleCount} crit` : ''}`}
                value={whistleblowerCount}
                href='/portal/whistleblower'
                accent={criticalWhistleCount > 0}
              />
              <StatCard label='Subscribers' value={subscribersCount} href='/portal/subscribers' />
            </div>
          </section>
        )}

        {/* ── Quick links ───────────────────────────────────────────────── */}
        <section className='mb-8'>
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
            <AddBookModal label='+ Add Book' variant='outline' />
            <Link
              href='/portal/profile'
              className='border border-slate-300 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-untele hover:text-untele dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            >
              Edit Profile
            </Link>
          </div>
        </section>

        {/* ── Claimed Pitches ──────────────────────────────────────────── */}
        {claimedPitches && claimedPitches.length > 0 && (
          <section className='mb-8'>
            <SectionHeader label={isEditorPlus ? 'Claimed Pitches — Newsroom' : 'My Pitches'} />
            <ClaimedPitchesPanel
              pitches={claimedPitches}
              currentSanityAuthorId={sanityAuthorId ?? undefined}
              isEditorPlus={isEditorPlus}
            />
          </section>
        )}

        {/* ── Bottom: Brief + right sidebar (Orders + Payouts) ────────── */}
        <div className='grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]'>
          {/* Latest Brief */}
          <section>
            <SectionHeader label='Latest Brief' />
            {latestBrief ? (
              <BriefPanel
                brief={latestBrief}
                briefList={allBriefs ?? []}
                currentSanityAuthorId={sanityAuthorId ?? undefined}
                myPitchMap={myPitchMap}
                authors={authors}
                isEditorPlus={isEditorPlus}
              />
            ) : (
              <div className='border border-slate-200 bg-white px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-900'>
                <p className='text-xs font-bold uppercase tracking-widest text-slate-400'>
                  No briefs posted yet
                </p>
                <p className='mt-1 text-xs text-slate-400'>
                  The AI agent will post briefs here once configured.
                </p>
              </div>
            )}
          </section>

          {/* Right sidebar — stacked widgets */}
          <div className='flex flex-col gap-6'>
            {/* Bookstore Orders */}
            <section>
              <SectionHeader label='Bookstore Orders' />
              {bookstoreAvailable ? (
                <BookstoreOrdersWidget
                  digitalSales={digitalSales}
                  shipmentsPending={shipmentsPending}
                />
              ) : (
                <div className='border border-slate-200 bg-white px-4 py-6 text-center dark:border-slate-700 dark:bg-slate-900'>
                  <p className='text-xs font-bold uppercase tracking-widest text-slate-400'>
                    Bookstore not connected
                  </p>
                  <Link
                    href='/portal/books'
                    className='mt-2 inline-block text-[10px] font-black uppercase tracking-widest text-untele hover:underline'
                  >
                    My Books →
                  </Link>
                </div>
              )}
            </section>

            {/* Pending Payouts */}
            <section>
              <SectionHeader label={isAdmin ? 'All Pending Payouts' : 'My Pending Payouts'} />
              {bookstoreAvailable ? (
                <PendingPayoutsWidget payouts={pendingPayouts} isAdmin={isAdmin} />
              ) : (
                <div className='border border-slate-200 bg-white px-4 py-6 text-center dark:border-slate-700 dark:bg-slate-900'>
                  <p className='text-xs font-bold uppercase tracking-widest text-slate-400'>
                    Bookstore not connected
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
