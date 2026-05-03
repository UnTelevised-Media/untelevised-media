'use client';
// src/components/portal/TipsWidget.tsx
// Standalone widget showing tip transactions in the portal sidebar.

import Link from 'next/link';

export interface TipRow {
  id: string;
  order_number: string;
  book_title: string;
  amount_cents: number;
  created_at: string;
  customer_email?: string;
}

interface Props {
  tips: TipRow[];
}

function centsToUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function TipsWidget({ tips }: Props) {
  const totalCents = tips.reduce((s, t) => s + t.amount_cents, 0);

  return (
    <div className='flex flex-col border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'>
      {/* Header bar */}
      <div className='flex items-center justify-between border-b border-slate-200 px-4 py-2.5 dark:border-slate-700'>
        <span className='text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>
          Tips Received
          {tips.length > 0 && (
            <span className='ml-1.5 bg-slate-100 px-1 py-0.5 text-[9px] dark:bg-slate-800'>
              {tips.length}
            </span>
          )}
        </span>
        {tips.length > 0 && (
          <span className='text-xs font-black text-green-600 dark:text-green-400'>
            {centsToUsd(totalCents)}
          </span>
        )}
      </div>

      {/* List */}
      <div className='overflow-y-auto' style={{ maxHeight: 260 }}>
        {tips.length === 0 ? (
          <div className='flex items-center justify-center px-4 py-10'>
            <p className='text-xs font-bold uppercase tracking-widest text-slate-400'>
              No tips yet
            </p>
          </div>
        ) : (
          <ul className='divide-y divide-slate-100 dark:divide-slate-800'>
            {tips.map((tip) => (
              <li key={tip.id} className='flex items-center justify-between gap-3 px-4 py-2.5'>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-xs font-bold text-slate-900 dark:text-slate-100'>
                    {tip.book_title}
                  </p>
                  {tip.customer_email && (
                    <p className='truncate text-[10px] text-slate-400'>{tip.customer_email}</p>
                  )}
                  <p className='text-[10px] text-slate-300 dark:text-slate-600'>
                    {new Date(tip.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className='shrink-0 text-right'>
                  <p className='text-sm font-black text-green-600 dark:text-green-400'>
                    {centsToUsd(tip.amount_cents)}
                  </p>
                  <Link
                    href='/portal/orders'
                    className='block text-[10px] font-black text-untele hover:underline'
                  >
                    #{tip.order_number}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className='border-t border-slate-200 px-4 py-2.5 dark:border-slate-700'>
        <Link
          href='/portal/orders'
          className='text-[10px] font-black uppercase tracking-widest text-untele hover:underline'
        >
          View All Orders →
        </Link>
      </div>
    </div>
  );
}
