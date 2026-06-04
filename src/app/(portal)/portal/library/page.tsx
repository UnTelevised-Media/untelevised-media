// src/app/(portal)/portal/library/page.tsx
// Book Library — manage your book listings, formats, and inventory.
// Earnings data lives at /portal/earnings.

import Link from 'next/link';
import AddBookModal from '@/components/portal/AddBookModal';
import EditBookModal from '@/components/portal/EditBookModal';
import { requireAuthor } from '@/lib/auth/roles';
import { hasRole } from '@/lib/auth/roles-utils';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryBooksByAuthorClerkId } from '@/lib/sanity/lib/queries';
import { shopServiceClient } from '@/lib/bookstore/supabase';
import PortalNav from '@/components/portal/PortalNav';
import type { SanityBook } from '@/lib/bookstore/types';

export const metadata = {
  title: 'Book Library — Author Portal',
  robots: { index: false, follow: false },
};

interface EarningRow {
  sanity_book_id: string;
  gross_cents: number;
  stripe_fee_cents: number;
  is_tip: boolean;
  order_item: { quantity: number; is_digital: boolean } | null;
  order: { status: string } | null;
}

function centsToUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function PortalLibraryPage() {
  const { id: clerkUserId, role } = await requireAuthor();
  const isEditorPlus = hasRole(role, 'editor');

  const books = await sanityFetch<SanityBook[]>({
    query: queryBooksByAuthorClerkId,
    params: { clerkId: clerkUserId },
    tags: ['book'],
  });
  const bookList = books ?? [];

  let authorEarnings: EarningRow[] = [];
  let supabaseAvailable = true;

  try {
    if (!process.env.SUPABASE_SHOP_URL) throw new Error('Supabase shop not configured');

    const { data, error } = await shopServiceClient
      .from('author_earnings')
      .select(
        'sanity_book_id, gross_cents, stripe_fee_cents, is_tip, order_item:order_items(quantity, is_digital), order:orders(status)'
      )
      .eq('author_clerk_id', clerkUserId);

    if (error) console.error('[portal/library] author_earnings query failed:', error.message);

    authorEarnings = ((data as EarningRow[]) ?? []).filter(
      (s) => !['cancelled', 'refunded'].includes(s.order?.status ?? '')
    );
  } catch {
    supabaseAvailable = false;
  }

  const bookEarnings = authorEarnings.filter((s) => !s.is_tip);

  const bookStats = bookList.map((book) => {
    const items = bookEarnings.filter((s) => s.sanity_book_id === book._id);
    const units = items.reduce((s, i) => s + (i.order_item?.quantity ?? 1), 0);
    const revenue = items.reduce((s, i) => s + (i.gross_cents - i.stripe_fee_cents), 0);
    const digital = items
      .filter((i) => i.order_item?.is_digital)
      .reduce((s, i) => s + (i.order_item?.quantity ?? 1), 0);
    const physical = units - digital;
    return { book, units, revenue, digital, physical };
  });

  const inventoryAlerts = bookList.flatMap((book) =>
    (book.formats ?? [])
      .filter(
        (f) =>
          f.inventory?.trackInventory &&
          f.inventory.quantity <= (f.inventory.lowStockThreshold ?? 5)
      )
      .map((f) => ({ book, format: f }))
  );

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
                  Book Library
                </span>
              </div>
            </div>
            <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
              My Books
            </h1>
          </div>
          <div className='flex items-center gap-3'>
            <Link
              href='/portal/earnings'
              className='border border-slate-300 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:border-untele hover:text-untele dark:border-slate-700 dark:text-slate-400'
            >
              Earnings →
            </Link>
            <AddBookModal label='+ Add Book' variant='primary' />
          </div>
        </div>

        {bookList.length === 0 && (
          <div className='border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900'>
            <p className='mb-2 text-sm font-bold uppercase tracking-widest text-slate-400'>
              No books yet
            </p>
            <p className='mb-4 text-xs text-slate-400'>
              Add your first book using the button above.
            </p>
            <AddBookModal label='+ Add Your First Book' variant='primary' />
          </div>
        )}

        {bookList.length > 0 && (
          <>
            {!supabaseAvailable && (
              <div className='mb-6 border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950'>
                <p className='text-xs font-bold text-amber-700 dark:text-amber-300'>
                  Sales data unavailable — Supabase shop database is not connected.
                </p>
              </div>
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

            {/* Products table */}
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
                      {supabaseAvailable && <Th>Earnings</Th>}
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
                          <EditBookModal book={book} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
