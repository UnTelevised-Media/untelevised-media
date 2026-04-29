// src/app/(portal)/portal/books/page.tsx
// My Books dashboard — product list, sales summary, inventory alerts, payout history.
// Author-gated: only literary authors and admins access this route.

import Link from 'next/link';
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryBooksByAuthorClerkId } from '@/lib/sanity/lib/queries';
import { shopServiceClient } from '@/lib/bookstore/supabase';
import PortalNav from '@/components/portal/PortalNav';
import type { SanityBook, OrderItem, Payout } from '@/lib/bookstore/types';

export const metadata = {
  title: 'My Books — Author Portal',
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

interface OrderItemWithOrder extends OrderItem {
  order: { status: string; created_at: string } | null;
}

export default async function PortalBooksPage() {
  const { id: clerkUserId, role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');

  // Fetch author's books from Sanity
  const books = await sanityFetch<SanityBook[]>({
    query: queryBooksByAuthorClerkId,
    params: { clerkId: clerkUserId },
    tags: ['book'],
  });

  const bookList = books ?? [];
  const bookIds = bookList.map((b) => b._id);

  // Fetch order items + payouts from Supabase (graceful degradation if not configured)
  let orderItems: OrderItemWithOrder[] = [];
  let payouts: Payout[] = [];
  let supabaseAvailable = true;

  try {
    if (!process.env.SUPABASE_SHOP_URL) throw new Error('Supabase shop not configured');

    const [itemsResult, payoutsResult] = await Promise.all([
      bookIds.length > 0
        ? shopServiceClient
            .from('order_items')
            .select('*, order:orders(status, created_at)')
            .in('sanity_book_id', bookIds)
        : { data: [], error: null },
      shopServiceClient
        .from('payouts')
        .select('*')
        .eq('author_clerk_id', clerkUserId)
        .order('period_end', { ascending: false }),
    ]);

    orderItems = ((itemsResult.data as OrderItemWithOrder[]) ?? []).filter(
      (i) => !['cancelled', 'refunded'].includes(i.order?.status ?? ''),
    );
    payouts = (payoutsResult.data as Payout[]) ?? [];
  } catch {
    supabaseAvailable = false;
  }

  // Compute overall stats
  const totalUnits = orderItems.reduce((s, i) => s + i.quantity, 0);
  const totalRevenueCents = orderItems.reduce((s, i) => s + i.unit_price_cents * i.quantity, 0);

  const thisMonthItems = orderItems.filter((i) => isThisMonth(i.order?.created_at ?? ''));
  const lastMonthItems = orderItems.filter((i) => isLastMonth(i.order?.created_at ?? ''));
  const thisMonthRevenue = thisMonthItems.reduce((s, i) => s + i.unit_price_cents * i.quantity, 0);
  const lastMonthRevenue = lastMonthItems.reduce((s, i) => s + i.unit_price_cents * i.quantity, 0);

  // Per-book stats
  const bookStats = bookList.map((book) => {
    const items = orderItems.filter((i) => i.sanity_book_id === book._id);
    const units = items.reduce((s, i) => s + i.quantity, 0);
    const revenue = items.reduce((s, i) => s + i.unit_price_cents * i.quantity, 0);
    const digital = items.filter((i) => i.is_digital).reduce((s, i) => s + i.quantity, 0);
    const physical = units - digital;
    return { book, units, revenue, digital, physical };
  });

  // Inventory alerts — formats where trackInventory && quantity <= lowStockThreshold
  const inventoryAlerts = bookList.flatMap((book) =>
    (book.formats ?? [])
      .filter(
        (f) =>
          f.inventory?.trackInventory &&
          f.inventory.quantity <= (f.inventory.lowStockThreshold ?? 5),
      )
      .map((f) => ({ book, format: f })),
  );

  // Payout stats
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
                  My Books
                </span>
              </div>
            </div>
            <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
              Bookstore Dashboard
            </h1>
          </div>
          <a
            href={`${process.env.NEXT_PUBLIC_PRODUCTION_URL ?? ''}/studio/desk/book`}
            target='_blank'
            rel='noopener noreferrer'
            className='border border-slate-300 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:border-untele hover:text-untele dark:border-slate-700 dark:text-slate-400'
          >
            Manage in Studio →
          </a>
        </div>

        {/* No books state */}
        {bookList.length === 0 && (
          <div className='border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900'>
            <p className='mb-2 text-sm font-bold uppercase tracking-widest text-slate-400'>
              No books found
            </p>
            <p className='text-xs text-slate-400'>
              Add a book in Sanity Studio and set your author profile as the author.
            </p>
          </div>
        )}

        {bookList.length > 0 && (
          <>
            {/* Supabase unavailable notice */}
            {!supabaseAvailable && (
              <div className='mb-6 border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950'>
                <p className='text-xs font-bold text-amber-700 dark:text-amber-300'>
                  Sales data unavailable — Supabase shop database is not connected.
                  {/* TODO: set SUPABASE_SHOP_URL, SUPABASE_SHOP_ANON_KEY, SUPABASE_SHOP_SERVICE_ROLE_KEY */}
                </p>
              </div>
            )}

            {/* Sales summary cards */}
            {supabaseAvailable && (
              <section className='mb-8'>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='bg-untele px-2 py-0.5'>
                    <span className='text-[10px] font-black uppercase tracking-widest text-white'>
                      Sales Summary
                    </span>
                  </div>
                  <div className='h-px flex-1 bg-slate-200 dark:bg-slate-800' />
                </div>
                <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                  <StatCard label='Total Units Sold' value={String(totalUnits)} />
                  <StatCard label='Total Revenue' value={centsToUsd(totalRevenueCents)} />
                  <StatCard
                    label='This Month'
                    value={centsToUsd(thisMonthRevenue)}
                    sub={
                      lastMonthRevenue > 0
                        ? `Last month: ${centsToUsd(lastMonthRevenue)}`
                        : 'No sales last month'
                    }
                  />
                  <StatCard
                    label='Next Payout'
                    value={nextPayoutTotal > 0 ? centsToUsd(nextPayoutTotal) : '—'}
                    sub={pendingPayouts.length > 0 ? 'Pending' : 'No pending payouts'}
                  />
                </div>
              </section>
            )}

            {/* Product list */}
            <section className='mb-8'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='bg-untele px-2 py-0.5'>
                  <span className='text-[10px] font-black uppercase tracking-widest text-white'>
                    Products
                  </span>
                </div>
                <div className='h-px flex-1 bg-slate-200 dark:bg-slate-800' />
              </div>
              <div className='border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-slate-200 dark:border-slate-700'>
                      <Th>Title</Th>
                      <Th>Status</Th>
                      <Th>Formats</Th>
                      {supabaseAvailable && <Th>Units</Th>}
                      {supabaseAvailable && <Th>Revenue</Th>}
                      {supabaseAvailable && <Th>Digital / Physical</Th>}
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookStats.map(({ book, units, revenue, digital, physical }) => (
                      <tr
                        key={book._id}
                        className='border-b border-slate-100 last:border-0 dark:border-slate-800'
                      >
                        <td className='px-4 py-3'>
                          <Link
                            href={`/bookstore/book/${book.slug.current}`}
                            target='_blank'
                            className='font-bold text-slate-900 hover:text-untele dark:text-slate-100'
                          >
                            {book.title}
                          </Link>
                        </td>
                        <td className='px-4 py-3'>
                          <StatusBadge status={book.status} />
                        </td>
                        <td className='px-4 py-3 text-xs text-slate-500'>
                          {(book.formats ?? []).map((f) => f.formatType).join(', ') || '—'}
                        </td>
                        {supabaseAvailable && (
                          <td className='px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300'>
                            {units}
                          </td>
                        )}
                        {supabaseAvailable && (
                          <td className='px-4 py-3 text-xs font-bold text-untele'>
                            {centsToUsd(revenue)}
                          </td>
                        )}
                        {supabaseAvailable && (
                          <td className='px-4 py-3 text-xs text-slate-500'>
                            {digital}d / {physical}p
                          </td>
                        )}
                        <td className='px-4 py-3'>
                          <a
                            href={`${process.env.NEXT_PUBLIC_PRODUCTION_URL ?? ''}/studio/desk/book;${book._id}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-untele'
                          >
                            Edit in Studio
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Per-book sales chart */}
            {supabaseAvailable && bookStats.some((b) => b.units > 0) && (
              <section className='mb-8'>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='bg-untele px-2 py-0.5'>
                    <span className='text-[10px] font-black uppercase tracking-widest text-white'>
                      Per-Book Breakdown
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
                          {/* Total units bar */}
                          <div className='mb-1 h-3 w-full bg-slate-100 dark:bg-slate-800'>
                            <div
                              className='h-full bg-untele transition-all'
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {/* Physical / Digital split */}
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
                            {physical > 0 && <span className='text-slate-500'>{physical} Physical</span>}
                            {digital > 0 && <span className='text-blue-500'>{digital} Digital</span>}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>
            )}

            {/* Inventory alerts */}
            {inventoryAlerts.length > 0 && (
              <section className='mb-8'>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='bg-amber-500 px-2 py-0.5'>
                    <span className='text-[10px] font-black uppercase tracking-widest text-white'>
                      Inventory Alerts
                    </span>
                  </div>
                  <div className='h-px flex-1 bg-slate-200 dark:bg-slate-800' />
                </div>
                <div className='flex flex-col gap-2'>
                  {inventoryAlerts.map(({ book, format }) => (
                    <div
                      key={`${book._id}-${format._key}`}
                      className='flex items-center justify-between border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950'
                    >
                      <div>
                        <span className='text-sm font-bold text-amber-800 dark:text-amber-200'>
                          {book.title}
                        </span>
                        <span className='ml-2 text-xs text-amber-600 dark:text-amber-400'>
                          {format.formatType}
                        </span>
                      </div>
                      <span className='text-xs font-black text-amber-700 dark:text-amber-300'>
                        {format.inventory?.quantity === 0
                          ? 'Out of stock'
                          : `${format.inventory?.quantity} left`}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Payout history */}
            {supabaseAvailable && (
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
                            <td className='px-4 py-3 text-xs text-slate-500'>
                              {centsToUsd(p.platform_fee_cents)}
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
            )}
          </>
        )}
      </main>
    </div>
  );
}

// --- Sub-components ---

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className='px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest text-slate-400'>
      {children}
    </th>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className='border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900'>
      <p className='mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400'>
        {label}
      </p>
      <p className='text-2xl font-black text-slate-900 dark:text-slate-100'>{value}</p>
      {sub && <p className='mt-1 text-[10px] text-slate-400'>{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    draft: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    'out-of-stock': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    discontinued: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${map[status] ?? 'bg-slate-100 text-slate-500'}`}
    >
      {status}
    </span>
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
