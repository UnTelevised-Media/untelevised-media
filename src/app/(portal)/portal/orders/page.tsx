// src/app/(portal)/portal/orders/page.tsx
// Order Management — accessible to admin, sales, and authors (own book orders only).
// Fetches all orders from Supabase with customer info and order items.

import { requireAnyPortalRole } from '@/lib/auth/roles';
import { hasRole, isSalesOnly } from '@/lib/auth/roles-utils';
import { shopServiceClient } from '@/lib/bookstore/supabase';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryBooksByAuthorClerkId } from '@/lib/sanity/lib/queries';
import PortalNav from '@/components/portal/PortalNav';
import OrdersTable from '@/components/portal/OrdersTable';
import type { OrderWithItems } from '@/components/portal/OrdersTable';
import type { SanityBook } from '@/lib/bookstore/types';

export const metadata = {
  title: 'Order Management — Author Portal',
  robots: { index: false, follow: false },
};

export default async function PortalOrdersPage() {
  const { id: clerkUserId, role } = await requireAnyPortalRole();
  const isEditorPlus = hasRole(role, 'editor');
  const isAdmin = role === 'admin';
  const isSales = isSalesOnly(role);

  let orders: OrderWithItems[] = [];
  let supabaseAvailable = true;
  let supabaseError: string | null = null;

  try {
    if (!process.env.SUPABASE_SHOP_URL) throw new Error('SUPABASE_SHOP_URL is not set');

    // For authors: scope to their own books only
    let bookIds: string[] = [];
    if (role === 'author') {
      const books = await sanityFetch<SanityBook[]>({
        query: queryBooksByAuthorClerkId,
        params: { clerkId: clerkUserId },
        tags: ['book'],
      });
      bookIds = (books ?? []).map((b) => b._id);
    }

    // Fetch orders with customer info and items
    let ordersQuery = shopServiceClient
      .from('orders')
      .select(
        `
        *,
        customer:customers(email, full_name),
        items:order_items(book_title, format_label, sanity_format_type, quantity, is_digital, sanity_book_id, unit_price_cents)
      `,
      )
      .order('created_at', { ascending: false })
      .limit(500);

    const { data: rawOrders, error } = await ordersQuery;

    if (error) throw new Error(error.message);

    // For authors: filter to orders containing their books
    const allOrders = (rawOrders ?? []) as Array<{
      id: string;
      order_number: string;
      status: string;
      total_cents: number;
      subtotal_cents: number;
      tax_cents: number;
      shipping_cents: number;
      currency: string;
      created_at: string;
      updated_at: string;
      fulfilled_at: string | null;
      notes: string | null;
      customer_id: string | null;
      stripe_payment_intent_id: string | null;
      stripe_checkout_session_id: string | null;
      shipping_address_id: string | null;
      customer: { email: string; full_name: string | null } | null;
      items: {
        book_title: string;
        format_label: string;
        sanity_format_type: string;
        quantity: number;
        is_digital: boolean;
        sanity_book_id: string;
        unit_price_cents: number;
      }[];
    }>;

    orders = allOrders
      .filter((o) => {
        if (role === 'author' && bookIds.length > 0) {
          return o.items.some((i) => bookIds.includes(i.sanity_book_id));
        }
        return true;
      })
      .map((o) => ({
        id: o.id,
        order_number: o.order_number,
        customer_id: o.customer_id,
        stripe_payment_intent_id: o.stripe_payment_intent_id,
        stripe_checkout_session_id: o.stripe_checkout_session_id,
        status: o.status as OrderWithItems['status'],
        subtotal_cents: o.subtotal_cents,
        tax_cents: o.tax_cents,
        shipping_cents: o.shipping_cents,
        total_cents: o.total_cents,
        currency: o.currency,
        shipping_address_id: o.shipping_address_id,
        notes: o.notes,
        created_at: o.created_at,
        updated_at: o.updated_at,
        fulfilled_at: o.fulfilled_at,
        customer_email: o.customer?.email,
        customer_name: o.customer?.full_name ?? undefined,
        items: o.items.map((i) => ({
          book_title: i.book_title,
          format_label: i.format_label,
          sanity_format_type: i.sanity_format_type as OrderWithItems['items'][0]['sanity_format_type'],
          quantity: i.quantity,
          is_digital: i.is_digital,
          unit_price_cents: i.unit_price_cents,
        })),
      }));
  } catch (err) {
    supabaseAvailable = false;
    supabaseError = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} role={role} />

      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        {/* Header */}
        <div className='mb-8'>
          <div className='mb-2 flex items-center gap-3'>
            <div className='bg-untele px-3 py-1'>
              <span className='text-xs font-black uppercase tracking-widest text-white'>
                {isSales ? 'Sales Portal' : 'Order Management'}
              </span>
            </div>
          </div>
          <h1 className='text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100'>
            Orders
          </h1>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            {isAdmin
              ? 'All orders across the bookstore.'
              : isSales
                ? 'All customer orders — you can update status and mark shipments.'
                : 'Orders containing your books.'}
          </p>
        </div>

        {!supabaseAvailable ? (
          <div className='border border-amber-200 bg-amber-50 px-6 py-8 dark:border-amber-800 dark:bg-amber-950'>
            <p className='mb-2 text-sm font-bold text-amber-700 dark:text-amber-300'>
              Order data unavailable — database query failed.
            </p>
            {supabaseError && (
              <p className='font-mono text-xs text-amber-600 dark:text-amber-400'>{supabaseError}</p>
            )}
            <p className='mt-3 text-xs text-amber-600 dark:text-amber-400'>
              If this is a &ldquo;relation does not exist&rdquo; error, run{' '}
              <code className='rounded bg-amber-100 px-1 dark:bg-amber-900'>supabase db push</code>{' '}
              to apply the bookstore schema migrations to your Supabase project.
            </p>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4'>
              <MiniStat label='Total Orders' value={String(orders.length)} />
              <MiniStat
                label='Revenue'
                value={`$${(orders.filter(o => !['cancelled','refunded'].includes(o.status)).reduce((s, o) => s + o.total_cents, 0) / 100).toFixed(2)}`}
              />
              <MiniStat
                label='Pending'
                value={String(orders.filter((o) => o.status === 'paid' || o.status === 'processing').length)}
              />
              <MiniStat
                label='Shipped'
                value={String(orders.filter((o) => o.status === 'shipped').length)}
              />
            </div>

            <OrdersTable orders={orders} canAdmin={isAdmin} />
          </>
        )}
      </main>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className='border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900'>
      <p className='mb-0.5 text-[10px] font-black uppercase tracking-widest text-slate-400'>
        {label}
      </p>
      <p className='text-xl font-black text-slate-900 dark:text-slate-100'>{value}</p>
    </div>
  );
}
