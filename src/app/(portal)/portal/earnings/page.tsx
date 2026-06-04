// src/app/(portal)/portal/earnings/page.tsx
// Earnings dashboard — sales stats, tips breakdown, and payout history for the author.
// Book management lives at /portal/library.

import Link from 'next/link';
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryBooksByAuthorClerkId } from '@/lib/sanity/lib/queries';
import { shopServiceClient } from '@/lib/bookstore/supabase';
import PortalNav from '@/components/portal/PortalNav';
import type { SanityBook, Payout } from '@/lib/bookstore/types';

export const metadata = {
  title: 'Earnings — Author Portal',
  robots: { index: false, follow: false },
};

function centsToUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function isLastMonth(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.getFullYear() === last.getFullYear() && d.getMonth() === last.getMonth();
}

function getCurrentPayoutPeriodStart(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = now.getUTCDate();
  return d <= 15 ? `${y}-${m}-01` : `${y}-${m}-16`;
}

function getNextPayoutDate(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  const next = d <= 15 ? new Date(Date.UTC(y, m, 16)) : new Date(Date.UTC(y, m + 1, 1));
  return next.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface AuthorEarningRow {
  sanity_book_id: string;
  gross_cents: number;
  stripe_fee_cents: number;
  net_after_stripe_cents: number;
  author_cents: number;
  is_tip: boolean;
  payout_period_start: string;
  order_item: { quantity: number; is_digital: boolean } | null;
  order: { status: string; created_at: string } | null;
}

export default async function PortalEarningsPage() {
  const { id: clerkUserId, role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');

  const books = await sanityFetch<SanityBook[]>({
    query: queryBooksByAuthorClerkId,
    params: { clerkId: clerkUserId },
    tags: ['book'],
  });
  const bookList = books ?? [];

  let authorEarnings: AuthorEarningRow[] = [];
  let payouts: Payout[] = [];
  let supabaseAvailable = true;

  try {
    if (!process.env.SUPABASE_SHOP_URL) throw new Error('Supabase shop not configured');

    const [earningsResult, payoutsResult] = await Promise.all([
      shopServiceClient
        .from('author_earnings')
        .select(
          'sanity_book_id, gross_cents, stripe_fee_cents, net_after_stripe_cents, author_cents, is_tip, payout_period_start, order_item:order_items(quantity, is_digital), order:orders(status, created_at)'
        )
        .eq('author_clerk_id', clerkUserId),
      shopServiceClient
        .from('payouts')
        .select('*')
        .eq('author_clerk_id', clerkUserId)
        .order('period_end', { ascending: false }),
    ]);

    if (earningsResult.error)
      console.error(
        '[portal/earnings] author_earnings query failed:',
        earningsResult.error.message
      );
    if (payoutsResult.error)
      console.error('[portal/earnings] payouts query failed:', payoutsResult.error.message);

    authorEarnings = ((earningsResult.data as AuthorEarningRow[]) ?? []).filter(
      (s) => !['cancelled', 'refunded'].includes(s.order?.status ?? '')
    );
    payouts = (payoutsResult.data as Payout[]) ?? [];
  } catch {
    supabaseAvailable = false;
  }

  const bookEarnings = authorEarnings.filter((s) => !s.is_tip);
  const tipEarnings = authorEarnings.filter((s) => s.is_tip);

  const netCents = (i: AuthorEarningRow) => i.gross_cents - i.stripe_fee_cents;

  // Units from book sales only
  const totalUnits = bookEarnings.reduce((s, i) => s + (i.order_item?.quantity ?? 1), 0);

  // Monthly earnings — all (books + tips), net of Stripe
  const thisMonthItems = authorEarnings.filter((i) => isThisMonth(i.order?.created_at ?? ''));
  const lastMonthItems = authorEarnings.filter((i) => isLastMonth(i.order?.created_at ?? ''));
  const thisMonthAuthor = thisMonthItems.reduce((s, i) => s + netCents(i), 0);
  const lastMonthAuthor = lastMonthItems.reduce((s, i) => s + netCents(i), 0);

  // Accruing this payout period
  const currentPeriodStart = getCurrentPayoutPeriodStart();
  const currentPeriodEarnings = authorEarnings.filter(
    (e) => e.payout_period_start === currentPeriodStart
  );
  const currentPeriodAuthorCents = currentPeriodEarnings.reduce((s, e) => s + netCents(e), 0);

  // Tips
  const tipGrossCents = tipEarnings.reduce((s, i) => s + i.gross_cents, 0);
  const tipStripeFeeCents = tipEarnings.reduce((s, i) => s + i.stripe_fee_cents, 0);
  const tipAuthorCents = tipEarnings.reduce((s, i) => s + netCents(i), 0);
  const tipsByBook = bookList
    .map((book) => {
      const items = tipEarnings.filter((s) => s.sanity_book_id === book._id);
      return {
        book,
        count: items.length,
        grossCents: items.reduce((s, i) => s + i.gross_cents, 0),
        feeCents: items.reduce((s, i) => s + i.stripe_fee_cents, 0),
        authorCents: items.reduce((s, i) => s + netCents(i), 0),
      };
    })
    .filter((b) => b.count > 0);

  // Combined totals (books + tips)
  const totalGrossCents = authorEarnings.reduce((s, i) => s + i.gross_cents, 0);
  const totalStripeFeeCents = authorEarnings.reduce((s, i) => s + i.stripe_fee_cents, 0);
  const totalAuthorCents = totalGrossCents - totalStripeFeeCents;

  // Per-book revenue for chart
  const bookStats = bookList.map((book) => {
    const items = bookEarnings.filter((s) => s.sanity_book_id === book._id);
    const units = items.reduce((s, i) => s + (i.order_item?.quantity ?? 1), 0);
    const revenue = items.reduce((s, i) => s + netCents(i), 0);
    const digital = items
      .filter((i) => i.order_item?.is_digital)
      .reduce((s, i) => s + (i.order_item?.quantity ?? 1), 0);
    const physical = units - digital;
    return { book, units, revenue, digital, physical };
  });

  const pendingPayouts = payouts.filter((p) => p.status === 'pending');
  const nextPayoutTotal = pendingPayouts.reduce((s, p) => s + p.net_cents, 0);

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} role={role} />

      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        {/* Header */}
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <div className='mb-2 flex items-center gap-3'>
              <div className='bg-untele px-3 py-1'>
                <span className='text-xs font-black uppercase tracking-widest text-white'>
                  Earnings
                </span>
              </div>
            </div>
            <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
              My Earnings
            </h1>
          </div>
          <Link
            href='/portal/library'
            className='border border-slate-300 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:border-untele hover:text-untele dark:border-slate-700 dark:text-slate-400'
          >
            ← Library
          </Link>
        </div>

        {!supabaseAvailable && (
          <div className='mb-6 border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950'>
            <p className='text-xs font-bold text-amber-700 dark:text-amber-300'>
              Earnings data unavailable — Supabase shop database is not connected.
            </p>
          </div>
        )}

        {supabaseAvailable && (
          <>
            {/* Sales Summary */}
            <section className='mb-8'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='bg-untele px-2 py-0.5'>
                  <span className='text-[10px] font-black uppercase tracking-widest text-white'>
                    Sales Summary
                  </span>
                </div>
                <div className='h-px flex-1 bg-slate-200 dark:bg-slate-800' />
              </div>

              <div className='mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4'>
                <StatCard label='Total Units Sold' value={String(totalUnits)} />
                <StatCard
                  label='This Month'
                  value={centsToUsd(thisMonthAuthor)}
                  sub={
                    lastMonthAuthor > 0
                      ? `Last month: ${centsToUsd(lastMonthAuthor)}`
                      : 'No sales last month'
                  }
                />
                <StatCard
                  label='Accruing This Period'
                  value={currentPeriodAuthorCents > 0 ? centsToUsd(currentPeriodAuthorCents) : '—'}
                  sub='Your cut so far this period'
                />
                <StatCard
                  label='Next Payout'
                  value={
                    nextPayoutTotal > 0
                      ? centsToUsd(nextPayoutTotal)
                      : currentPeriodAuthorCents > 0
                        ? centsToUsd(currentPeriodAuthorCents)
                        : '—'
                  }
                  sub={
                    pendingPayouts.length > 0
                      ? 'Pending approval'
                      : `Scheduled ${getNextPayoutDate()}`
                  }
                  accent={
                    currentPeriodAuthorCents > 0 && nextPayoutTotal === 0 ? 'green' : undefined
                  }
                />
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <StatCard
                  label='Gross Revenue'
                  value={centsToUsd(totalGrossCents)}
                  sub='What customers paid (all time)'
                />
                <StatCard
                  label='Stripe Fees'
                  value={totalStripeFeeCents > 0 ? `− ${centsToUsd(totalStripeFeeCents)}` : '—'}
                  sub='Processing costs (all-time)'
                  accent='red'
                />
                <StatCard
                  label='Your Earnings'
                  value={centsToUsd(totalAuthorCents)}
                  sub='After Stripe, books + tips'
                  accent='green'
                />
              </div>
            </section>

            {/* Sales by Title */}
            {bookStats.some((b) => b.units > 0) && (
              <section className='mb-8'>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='bg-untele px-2 py-0.5'>
                    <span className='text-[10px] font-black uppercase tracking-widest text-white'>
                      Sales by Title
                    </span>
                  </div>
                  <div className='h-px flex-1 bg-slate-200 dark:bg-slate-800' />
                </div>
                <div className='space-y-4'>
                  {bookStats
                    .filter((b) => b.units > 0)
                    .map(({ book, units, revenue, digital, physical }) => {
                      const maxUnits = Math.max(...bookStats.map((b) => b.units), 1);
                      const pct = Math.round((units / maxUnits) * 100);
                      const physPct = units > 0 ? Math.round((physical / units) * 100) : 0;
                      const digPct = 100 - physPct;
                      return (
                        <div
                          key={book._id}
                          className='border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900'
                        >
                          <div className='mb-2 flex items-center justify-between'>
                            <span className='text-sm font-black text-slate-900 dark:text-slate-100'>
                              {book.title}
                            </span>
                            <span className='text-xs font-bold text-untele'>
                              {centsToUsd(revenue)} — {units} unit{units !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className='mb-1 h-3 w-full bg-slate-100 dark:bg-slate-800'>
                            <div
                              className='h-full bg-untele transition-all'
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {units > 0 && (
                            <div className='flex h-2 w-full overflow-hidden'>
                              <div
                                className='bg-slate-400 dark:bg-slate-600'
                                style={{ width: `${physPct}%` }}
                              />
                              <div
                                className='bg-blue-400 dark:bg-blue-600'
                                style={{ width: `${digPct}%` }}
                              />
                            </div>
                          )}
                          <div className='mt-1 flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                            {physical > 0 && (
                              <span className='text-slate-500'>{physical} Physical</span>
                            )}
                            {digital > 0 && (
                              <span className='text-blue-500'>{digital} Digital</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>
            )}

            {/* Tips Received */}
            {tipAuthorCents > 0 && (
              <section className='mb-8'>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='bg-untele px-2 py-0.5'>
                    <span className='text-[10px] font-black uppercase tracking-widest text-white'>
                      Tips Received
                    </span>
                  </div>
                  <div className='h-px flex-1 bg-slate-200 dark:bg-slate-800' />
                </div>
                <div className='space-y-3'>
                  {tipsByBook.map(({ book, count, grossCents, feeCents, authorCents }) => (
                    <div
                      key={book._id}
                      className='border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900'
                    >
                      <div className='flex items-start justify-between'>
                        <div>
                          <p className='text-sm font-black text-slate-900 dark:text-slate-100'>
                            {book.title}
                          </p>
                          <p className='text-[10px] text-slate-400'>
                            {count} tip{count !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-sm font-black text-green-600 dark:text-green-400'>
                            {centsToUsd(authorCents)}
                          </p>
                          <p className='text-[10px] text-slate-400'>
                            Gross {centsToUsd(grossCents)} · Stripe −{centsToUsd(feeCents)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className='grid grid-cols-3 gap-3 border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800'>
                    <div>
                      <p className='text-[10px] font-black uppercase tracking-widest text-slate-500'>
                        Gross Tips
                      </p>
                      <p className='text-sm font-black text-slate-700 dark:text-slate-300'>
                        {centsToUsd(tipGrossCents)}
                      </p>
                    </div>
                    <div>
                      <p className='text-[10px] font-black uppercase tracking-widest text-slate-500'>
                        Stripe Fees
                      </p>
                      <p className='text-sm font-black text-red-500'>
                        − {centsToUsd(tipStripeFeeCents)}
                      </p>
                    </div>
                    <div>
                      <p className='text-[10px] font-black uppercase tracking-widest text-slate-500'>
                        Your Tips
                      </p>
                      <p className='text-sm font-black text-green-600 dark:text-green-400'>
                        {centsToUsd(tipAuthorCents)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Payout History */}
            <section className='mb-8'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='bg-untele px-2 py-0.5'>
                  <span className='text-[10px] font-black uppercase tracking-widest text-white'>
                    Payout History
                  </span>
                </div>
                <div className='h-px flex-1 bg-slate-200 dark:bg-slate-800' />
              </div>
              {payouts.length === 0 ? (
                <div className='border border-slate-200 bg-white px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-900'>
                  <p className='text-xs font-bold uppercase tracking-widest text-slate-400'>
                    No payouts recorded yet
                  </p>
                </div>
              ) : (
                <div className='border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b border-slate-200 dark:border-slate-700'>
                        <Th>Period</Th>
                        <Th>Gross</Th>
                        <Th>Stripe Fees</Th>
                        <Th>Platform Fee</Th>
                        <Th>Net</Th>
                        <Th>Status</Th>
                        <Th>Paid At</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((p) => (
                        <tr
                          key={p.id}
                          className='border-b border-slate-100 last:border-0 dark:border-slate-800'
                        >
                          <td className='px-4 py-3 text-xs text-slate-600 dark:text-slate-300'>
                            {p.period_start} → {p.period_end}
                          </td>
                          <td className='px-4 py-3 text-xs'>{centsToUsd(p.gross_cents)}</td>
                          <td className='px-4 py-3 text-xs text-red-500'>
                            {p.stripe_fee_cents > 0 ? `− ${centsToUsd(p.stripe_fee_cents)}` : '—'}
                          </td>
                          <td className='px-4 py-3 text-xs text-slate-500'>
                            {p.platform_fee_cents > 0 ? centsToUsd(p.platform_fee_cents) : '—'}
                          </td>
                          <td className='px-4 py-3 text-xs font-bold text-untele'>
                            {centsToUsd(p.net_cents)}
                          </td>
                          <td className='px-4 py-3'>
                            <PayoutStatusBadge status={p.status} />
                          </td>
                          <td className='px-4 py-3 text-xs text-slate-500'>
                            {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className='px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest text-slate-400'>
      {children}
    </th>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: 'green' | 'red';
}) {
  const valueColor =
    accent === 'green'
      ? 'text-green-600 dark:text-green-400'
      : accent === 'red'
        ? 'text-red-500 dark:text-red-400'
        : 'text-slate-900 dark:text-slate-100';
  return (
    <div className='border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900'>
      <p className='mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400'>
        {label}
      </p>
      <p className={`text-2xl font-black ${valueColor}`}>{value}</p>
      {sub && <p className='mt-1 text-[10px] text-slate-400'>{sub}</p>}
    </div>
  );
}

function PayoutStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    cancelled: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${map[status] ?? 'bg-slate-100 text-slate-500'}`}
    >
      {status}
    </span>
  );
}
