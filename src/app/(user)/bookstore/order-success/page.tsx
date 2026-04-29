// src/app/(user)/bookstore/order-success/page.tsx
// Post-checkout success page — reads Stripe session via session_id searchParam.

import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import Stripe from 'stripe';

export const metadata: Metadata = {
  title: 'Order Confirmed — UnTelevised Media',
  robots: { index: false, follow: false },
};

async function OrderSummary({ sessionId }: { sessionId: string }) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    apiVersion: '2026-04-22.dahlia',
  });

  let session: Stripe.Checkout.Session | null = null;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });
  } catch {
    return (
      <p className='text-sm text-slate-500'>
        Could not retrieve order details. Your purchase was recorded — check{' '}
        <Link href='/bookstore/orders' className='text-untele hover:underline'>
          My Orders
        </Link>{' '}
        for confirmation.
      </p>
    );
  }

  const total = session.amount_total ? (session.amount_total / 100).toFixed(2) : null;
  const items = session.line_items?.data ?? [];
  const hasDigital = session.metadata?.has_digital === 'true';

  return (
    <div>
      <p className='mb-4 text-sm text-slate-600 dark:text-slate-400'>
        Thank you, {session.customer_details?.name ?? 'valued customer'}! Your payment was
        successful.
      </p>

      {items.length > 0 && (
        <div className='mb-4 border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'>
          {items.map((item) => (
            <div key={item.id} className='flex justify-between gap-4 border-b border-slate-100 p-4 last:border-0 dark:border-slate-800'>
              <span className='text-sm text-slate-700 dark:text-slate-300'>
                {item.description} × {item.quantity}
              </span>
              <span className='text-sm font-black text-slate-900 dark:text-white'>
                ${((item.amount_total ?? 0) / 100).toFixed(2)}
              </span>
            </div>
          ))}
          {total && (
            <div className='flex justify-between gap-4 bg-slate-50 p-4 dark:bg-slate-800'>
              <span className='text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-400'>
                Total
              </span>
              <span className='text-sm font-black text-untele'>${total}</span>
            </div>
          )}
        </div>
      )}

      {hasDigital && (
        <div className='mb-4 border border-untele bg-red-50 px-4 py-3 dark:bg-slate-900'>
          <p className='text-xs font-bold text-slate-700 dark:text-slate-300'>
            Your digital files are ready — check your email for download instructions, or visit your{' '}
            <Link href='/bookstore/downloads' className='font-black text-untele hover:underline'>
              Download Vault
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <main className='mx-auto max-w-2xl px-4 py-12 sm:px-6'>
      <div className='mb-6 flex items-center gap-3'>
        <div className='bg-untele px-3 py-1'>
          <span className='text-sm font-black uppercase tracking-widest text-white'>
            Order Confirmed
          </span>
        </div>
      </div>

      {session_id ? (
        <Suspense
          fallback={
            <p className='text-sm text-slate-500'>Loading order details...</p>
          }
        >
          <OrderSummary sessionId={session_id} />
        </Suspense>
      ) : (
        <p className='text-sm text-slate-500'>
          Order confirmation unavailable. Please check{' '}
          <Link href='/bookstore/orders' className='text-untele hover:underline'>
            My Orders
          </Link>
          .
        </p>
      )}

      <div className='mt-6 flex flex-wrap gap-3'>
        <Link
          href='/bookstore/orders'
          className='border border-slate-300 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-untele hover:text-untele dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300'
        >
          My Orders
        </Link>
        <Link
          href='/bookstore'
          className='border border-slate-300 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-untele hover:text-untele dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300'
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
