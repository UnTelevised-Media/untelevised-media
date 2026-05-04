// src/app/(portal)/portal/sales/page.tsx
// Sales — order management accessible to admin, sales role, and authors (own book orders).

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
  title: 'Sales — Author Portal',
  robots: { index: false, follow: false },
};

interface EarningRow {
  order_id: string;
  gross_cents: number;
  stripe_fee_cents: number;
  net_after_stripe_cents: number;
  author_cents: number;
  platform_cents: number;
  publisher_cents: number;
  is_tip: boolean;
}

export default async function PortalSalesPage() {
  const { id: clerkUserId, role } = await requireAnyPortalRole();
  const isEditorPlus = hasRole(role, 'editor');
  const isAdmin = role === 'admin';
  const isSales = isSalesOnly(role);

  let orders: OrderWithItems[] = [];
  let supabaseAvailable = true;
  let supabaseError: string | null = null;

  let earningsBreakdown = {
    gross: 0, stripeFees: 0, netAfterStripe: 0,
    authorCents: 0, platformCents: 0, publisherCents: 0,
  };
  let earningsByOrderId: Record<string, { author_cents: number; stripe_fee_cents: number; net_after_stripe_cents: number }> = {};

  try {
    if (!process.env.SUPABASE_SHOP_URL) throw new Error('SUPABASE_SHOP_URL is not set');

    let bookIds: string[] = [];
    if (role === 'author') {
      const books = await sanityFetch<SanityBook[]>({
        query: queryBooksByAuthorClerkId,
        params: { clerkId: clerkUserId },
        tags: ['book'],
      });
      bookIds = (books ?? []).map((b) => b._id);
    }

    const ordersQueryBuilder = shopServiceClient
      .from('orders')
      .select(
        `*, customer:customers(email, full_name), shipping_address:addresses(line1, line2, city, state, postal_code, country), items:order_items(book_title, format_label, sanity_format_type, quantity, is_digital, sanity_book_id, unit_price_cents)`,
      )
      .order('created_at', { ascending: false })
      .limit(500);

    const earningsQueryBuilder = role === 'author'
      ? shopServiceClient
          .from('author_earnings')
          .select('order_id, gross_cents, stripe_fee_cents, net_after_stripe_cents, author_cents, platform_cents, publisher_cents, is_tip')
          .eq('author_clerk_id', clerkUserId)
      : shopServiceClient
          .from('author_earnings')
          .select('order_id, gross_cents, stripe_fee_cents, net_after_stripe_cents, author_cents, platform_cents, publisher_cents, is_tip');

    const [{ data: rawOrders, error }, { data: rawEarnings }] = await Promise.all([
      ordersQueryBuilder,
      earningsQueryBuilder,
    ]);

    if (error) throw new Error(error.message);

    const allEarnings = (rawEarnings as EarningRow[]) ?? [];
    for (const e of allEarnings) {
      earningsBreakdown.gross           += e.gross_cents;
      earningsBreakdown.stripeFees      += e.stripe_fee_cents;
      earningsBreakdown.netAfterStripe  += e.net_after_stripe_cents;
      earningsBreakdown.authorCents     += e.author_cents;
      earningsBreakdown.platformCents   += e.platform_cents;
      earningsBreakdown.publisherCents  += e.publisher_cents;
    }

    if (role === 'author') {
      for (const e of allEarnings) {
        if (!earningsByOrderId[e.order_id]) {
          earningsByOrderId[e.order_id] = { author_cents: 0, stripe_fee_cents: 0, net_after_stripe_cents: 0 };
        }
        earningsByOrderId[e.order_id].author_cents           += e.author_cents;
        earningsByOrderId[e.order_id].stripe_fee_cents       += e.stripe_fee_cents;
        earningsByOrderId[e.order_id].net_after_stripe_cents += e.net_after_stripe_cents;
      }
    }

    const allOrders = (rawOrders ?? []) as Array<{
      id: string; order_number: string; status: string; total_cents: number;
      subtotal_cents: number; tax_cents: number; shipping_cents: number;
      stripe_fee_cents: number; currency: string; created_at: string;
      updated_at: string; fulfilled_at: string | null; notes: string | null;
      customer_id: string | null; stripe_payment_intent_id: string | null;
      stripe_checkout_session_id: string | null; shipping_address_id: string | null;
      shipping_tracking_number: string | null; shipping_tracking_url: string | null;
      shipped_at: string | null;
      customer: { email: string; full_name: string | null } | null;
      shipping_address: { line1: string; line2: string | null; city: string; state: string; postal_code: string; country: string } | null;
      items: { book_title: string; format_label: string; sanity_format_type: string; quantity: number; is_digital: boolean; sanity_book_id: string; unit_price_cents: number }[];
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
        stripe_fee_cents: o.stripe_fee_cents ?? 0,
        currency: o.currency,
        shipping_address_id: o.shipping_address_id,
        notes: o.notes,
        created_at: o.created_at,
        updated_at: o.updated_at,
        fulfilled_at: o.fulfilled_at,
        shipping_tracking_number: o.shipping_tracking_number,
        shipping_tracking_url: o.shipping_tracking_url,
        shipped_at: o.shipped_at,
        customer_email: o.customer?.email,
        customer_name: o.customer?.full_name ?? undefined,
        shipping_address: o.shipping_address ?? null,
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

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PortalNav isEditorPlus={isEditorPlus} role={role} />

      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
        <div className='mb-8'>
          <div className='mb-2 flex items-center gap-3'>
            <div className='bg-untele px-3 py-1'>
              <span className='text-xs font-black uppercase tracking-widest text-white'>
                {isSales ? 'Sales Portal' : 'Sales'}
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
          </div>
        ) : (
          <>
            {(() => {
              const active = orders.filter((o) => !['cancelled', 'refunded'].includes(o.status));
              const bookItemCents = (o: OrderWithItems) =>
                o.items.filter((i) => i.sanity_format_type !== 'tip').reduce((s, i) => s + i.unit_price_cents * i.quantity, 0);
              const tipItemCents = (o: OrderWithItems) =>
                o.items.filter((i) => i.sanity_format_type === 'tip').reduce((s, i) => s + i.unit_price_cents * i.quantity, 0);
              const tipOnlyOrders = active.filter((o) => o.items.length > 0 && o.items.every((i) => i.sanity_format_type === 'tip'));
              const bookOrders = active.filter((o) => o.items.some((i) => i.sanity_format_type !== 'tip'));
              const grossBookCents = bookOrders.reduce((s, o) => s + bookItemCents(o), 0);
              const grossTipsCents = active.reduce((s, o) => s + tipItemCents(o), 0);
              const avgCents = bookOrders.length > 0 ? Math.round(grossBookCents / bookOrders.length) : 0;
              const now = new Date();
              const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
              const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              const thisMonthBookCents = bookOrders.filter((o) => new Date(o.created_at) >= monthStart).reduce((s, o) => s + bookItemCents(o), 0);
              const lastMonthBookCents = bookOrders.filter((o) => { const d = new Date(o.created_at); return d >= lastMonthStart && d < monthStart; }).reduce((s, o) => s + bookItemCents(o), 0);
              const monthDelta = lastMonthBookCents > 0 ? Math.round(((thisMonthBookCents - lastMonthBookCents) / lastMonthBookCents) * 100) : null;
              const needsShipping = orders.filter((o) => ['paid', 'processing'].includes(o.status) && !o.fulfilled_at && o.items.some((i) => !i.is_digital && i.sanity_format_type !== 'tip')).length;
              const shippedDelivered = orders.filter((o) => ['shipped', 'delivered', 'fulfilled'].includes(o.status)).length;
              const digitalSold = active.reduce((s, o) => s + o.items.filter((i) => i.is_digital).reduce((ss, i) => ss + i.quantity, 0), 0);
              const refundCount = orders.filter((o) => o.status === 'refunded').length;
              return (
                <>
                  <div className='mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4'>
                    <MiniStat label='Active Orders' value={String(active.length)} sub={tipOnlyOrders.length > 0 ? `${bookOrders.length} book · ${tipOnlyOrders.length} tip-only` : `${orders.length} total`} />
                    <MiniStat label='Book Revenue' value={fmt(grossBookCents)} sub='excl. tips & cancelled' accent='green' />
                    <MiniStat label='This Month' value={fmt(thisMonthBookCents)} sub={monthDelta !== null ? `${monthDelta >= 0 ? '+' : ''}${monthDelta}% vs last month` : 'first month of data'} accent={monthDelta !== null && monthDelta >= 0 ? 'green' : 'red'} />
                    <MiniStat label='Avg Book Order' value={fmt(avgCents)} sub={`across ${bookOrders.length} order${bookOrders.length !== 1 ? 's' : ''}`} />
                  </div>
                  <div className='mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4'>
                    <MiniStat label='Needs Shipping' value={String(needsShipping)} sub={`${shippedDelivered} shipped / delivered`} accent={needsShipping > 0 ? 'amber' : undefined} />
                    <MiniStat label='Digital Sold' value={String(digitalSold)} sub='items (all time)' />
                    <MiniStat label='Tips' value={fmt(grossTipsCents)} sub={tipOnlyOrders.length > 0 ? `${tipOnlyOrders.length} standalone order${tipOnlyOrders.length !== 1 ? 's' : ''}` : 'from book orders'} accent='green' />
                    <MiniStat label='Refunds' value={String(refundCount)} sub={refundCount > 0 ? 'review required' : 'none issued'} accent={refundCount > 0 ? 'red' : undefined} />
                  </div>
                </>
              );
            })()}

            {(isAdmin || isSales) && earningsBreakdown.gross > 0 && (
              <section className='mb-6'>
                <div className='mb-3 flex items-center gap-3'>
                  <div className='bg-untele px-2 py-0.5'>
                    <span className='text-[10px] font-black uppercase tracking-widest text-white'>
                      Earnings Breakdown · After Stripe
                    </span>
                  </div>
                  <div className='h-px flex-1 bg-slate-200 dark:bg-slate-800' />
                </div>
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'>
                  <MiniStat label='Gross Revenue' value={fmt(earningsBreakdown.gross)} sub='What customers paid' />
                  <MiniStat label='Stripe Fees' value={`− ${fmt(earningsBreakdown.stripeFees)}`} sub='Processing (all cards)' accent='red' />
                  <MiniStat label='Net to Platform' value={fmt(earningsBreakdown.netAfterStripe)} sub='After Stripe deduction' accent='green' />
                  <MiniStat label='Author Payouts' value={fmt(earningsBreakdown.authorCents)} sub='All authors combined' />
                  {isAdmin && <MiniStat label='Platform Revenue' value={fmt(earningsBreakdown.platformCents)} sub='Our cut (after Stripe)' accent='green' />}
                  {isAdmin && <MiniStat label='Publisher Share' value={fmt(earningsBreakdown.publisherCents)} sub='Publisher cut (after Stripe)' />}
                </div>
              </section>
            )}

            <OrdersTable
              orders={orders}
              role={role!}
              earningsByOrderId={role === 'author' ? earningsByOrderId : undefined}
            />
          </>
        )}
      </main>
    </div>
  );
}

function MiniStat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: 'green' | 'red' | 'amber' }) {
  const valueColor =
    accent === 'green' ? 'text-green-600 dark:text-green-400' :
    accent === 'red'   ? 'text-red-500 dark:text-red-400' :
    accent === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                         'text-slate-900 dark:text-slate-100';
  return (
    <div className='border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900'>
      <p className='mb-0.5 text-[10px] font-black uppercase tracking-widest text-slate-400'>{label}</p>
      <p className={`text-xl font-black ${valueColor}`}>{value}</p>
      {sub && <p className='mt-0.5 text-[10px] text-slate-400 dark:text-slate-500'>{sub}</p>}
    </div>
  );
}
