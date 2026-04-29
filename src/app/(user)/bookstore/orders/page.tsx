// src/app/(user)/bookstore/orders/page.tsx
// Customer order history — requires Clerk auth. Pulls from Supabase.

import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { auth, currentUser } from '@clerk/nextjs/server';
import { shopServiceClient } from '@/lib/bookstore/supabase';
import type { Order, OrderItem } from '@/lib/bookstore/types';

export const metadata: Metadata = {
  title: 'My Orders — UnTelevised Media',
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
  fulfilled: 'Fulfilled',
  shipped: 'Shipped',
  delivered: 'Delivered',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-slate-500',
  paid: 'text-green-600',
  processing: 'text-blue-600',
  fulfilled: 'text-green-600',
  shipped: 'text-blue-600',
  delivered: 'text-green-700',
  refunded: 'text-slate-400',
  cancelled: 'text-red-500',
};

export default async function OrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/bookstore/orders');

  // Look up customer by clerk user id
  const { data: customer } = await shopServiceClient
    .from('customers')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (!customer) {
    return (
      <main className='mx-auto max-w-4xl px-4 py-8 sm:px-6'>
        <div className='mb-6 flex items-center gap-3'>
          <div className='bg-untele px-3 py-1'>
            <span className='text-sm font-black uppercase tracking-widest text-white'>
              My Orders
            </span>
          </div>
        </div>
        <div className='border border-slate-200 bg-white px-4 py-12 text-center dark:border-slate-700 dark:bg-slate-900'>
          <p className='text-xs font-bold uppercase tracking-widest text-slate-400'>
            No orders yet
          </p>
          <Link href='/bookstore' className='mt-4 inline-block text-xs text-untele hover:underline'>
            Browse the Bookstore
          </Link>
        </div>
      </main>
    );
  }

  const { data: orders } = await shopServiceClient
    .from('orders')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  const orderIds = (orders ?? []).map((o) => o.id);
  const { data: allItems } = orderIds.length
    ? await shopServiceClient.from('order_items').select('*').in('order_id', orderIds)
    : { data: [] };

  const itemsByOrder: Record<string, OrderItem[]> = {};
  for (const item of allItems ?? []) {
    if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
    itemsByOrder[item.order_id].push(item as OrderItem);
  }

  return (
    <main className='mx-auto max-w-4xl px-4 py-8 sm:px-6'>
      <div className='mb-6 flex items-center gap-3'>
        <div className='bg-untele px-3 py-1'>
          <span className='text-sm font-black uppercase tracking-widest text-white'>
            My Orders
          </span>
        </div>
        <div className='h-px flex-1 bg-slate-200 dark:bg-slate-800' />
      </div>

      {(orders ?? []).length === 0 ? (
        <div className='border border-slate-200 bg-white px-4 py-12 text-center dark:border-slate-700 dark:bg-slate-900'>
          <p className='mb-4 text-xs font-bold uppercase tracking-widest text-slate-400'>
            No orders yet
          </p>
          <Link
            href='/bookstore'
            className='inline-block bg-untele px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:opacity-90'
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className='flex flex-col gap-4'>
          {(orders as Order[]).map((order) => {
            const items = itemsByOrder[order.id] ?? [];
            const hasDigital = items.some((i) => i.is_digital);
            return (
              <div
                key={order.id}
                className='border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
              >
                <div className='flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800'>
                  <div>
                    <span className='text-xs font-black text-slate-900 dark:text-white'>
                      {order.order_number}
                    </span>
                    <span className='ml-3 text-[10px] text-slate-400'>
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[order.status] ?? 'text-slate-500'}`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                    <span className='text-sm font-black text-untele'>
                      ${(order.total_cents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className='px-4 py-3'>
                  {items.map((item) => (
                    <div key={item.id} className='flex items-center justify-between py-1'>
                      <span className='text-sm text-slate-700 dark:text-slate-300'>
                        {item.book_title}
                        <span className='ml-2 text-[10px] text-slate-400'>
                          ({item.format_label})
                        </span>
                      </span>
                      <span className='text-xs text-slate-500'>× {item.quantity}</span>
                    </div>
                  ))}
                  {hasDigital && (
                    <div className='mt-2'>
                      <Link
                        href='/bookstore/downloads'
                        className='text-[10px] font-black uppercase tracking-widest text-untele hover:underline'
                      >
                        Download Files →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
