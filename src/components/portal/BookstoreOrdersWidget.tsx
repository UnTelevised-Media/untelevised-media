'use client';
// src/components/portal/BookstoreOrdersWidget.tsx
// 2-panel switchable order widget for the portal dashboard.

import { useState } from 'react';
import Link from 'next/link';

export interface DigitalSaleRow {
  id: string;
  order_number: string;
  book_title: string;
  quantity: number;
  created_at: string;
  customer_email?: string;
}

export interface ShipmentPendingRow {
  id: string;
  order_number: string;
  book_title: string;
  quantity: number;
  created_at: string;
  status: string;
  customer_email?: string;
  customer_name?: string | null;
}

export interface TipRow {
  id: string;
  order_number: string;
  book_title: string;
  amount_cents: number;
  created_at: string;
  customer_email?: string;
}

interface Props {
  digitalSales: DigitalSaleRow[];
  shipmentsPending: ShipmentPendingRow[];
  tips: TipRow[];
}

function centsToUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function BookstoreOrdersWidget({ digitalSales, shipmentsPending, tips }: Props) {
  const [panel, setPanel] = useState<'ship' | 'tips' | 'digital'>('ship');

  const emptyLabel =
    panel === 'ship' ? 'No pending shipments' :
    panel === 'tips' ? 'No tips yet' :
    'No digital sales yet';

  return (
    <div className='flex flex-col border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'>
      {/* Tab bar — 3 equal columns */}
      <div className='grid grid-cols-3'>
        <TabBtn
          active={panel === 'ship'}
          onClick={() => setPanel('ship')}
          label='Needs Shipping'
          count={shipmentsPending.length}
          urgent={shipmentsPending.length > 0}
        />
        <TabBtn
          active={panel === 'tips'}
          onClick={() => setPanel('tips')}
          label='Tips'
          count={tips.length}
          bordered
        />
        <TabBtn
          active={panel === 'digital'}
          onClick={() => setPanel('digital')}
          label='Digital Sales'
          count={digitalSales.length}
          bordered
        />
      </div>

      {/* List */}
      <div className='flex-1 overflow-y-auto' style={{ maxHeight: 360 }}>
        {panel === 'ship' && (
          shipmentsPending.length === 0 ? (
            <Empty label={emptyLabel} />
          ) : (
            <ul className='divide-y divide-slate-100 dark:divide-slate-800'>
              {shipmentsPending.map((item) => (
                <li key={item.id} className='flex items-start justify-between gap-3 px-4 py-3'>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-xs font-bold text-slate-900 dark:text-slate-100'>
                      {item.book_title}
                    </p>
                    {item.customer_email && (
                      <p className='truncate text-[10px] text-slate-400'>{item.customer_email}</p>
                    )}
                    {item.customer_name && (
                      <p className='text-[10px] text-slate-500 dark:text-slate-400'>
                        {item.customer_name}
                      </p>
                    )}
                    <p className='text-[10px] text-slate-300 dark:text-slate-600'>
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className='shrink-0 text-right'>
                    <Link
                      href='/portal/orders'
                      className='block text-[10px] font-black text-untele hover:underline'
                    >
                      #{item.order_number}
                    </Link>
                    <p className='text-[10px] text-slate-400'>× {item.quantity}</p>
                    <span className='text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400'>
                      {item.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}

        {panel === 'tips' && (
          tips.length === 0 ? (
            <Empty label={emptyLabel} />
          ) : (
            <ul className='divide-y divide-slate-100 dark:divide-slate-800'>
              {tips.map((item) => (
                <li key={item.id} className='flex items-start justify-between gap-3 px-4 py-3'>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-xs font-bold text-slate-900 dark:text-slate-100'>
                      {item.book_title}
                    </p>
                    {item.customer_email && (
                      <p className='truncate text-[10px] text-slate-400'>{item.customer_email}</p>
                    )}
                    <p className='text-[10px] text-slate-300 dark:text-slate-600'>
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className='shrink-0 text-right'>
                    <Link
                      href='/portal/orders'
                      className='block text-[10px] font-black text-untele hover:underline'
                    >
                      #{item.order_number}
                    </Link>
                    <p className='text-xs font-black text-green-600 dark:text-green-400'>
                      {centsToUsd(item.amount_cents)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}

        {panel === 'digital' && (
          digitalSales.length === 0 ? (
            <Empty label={emptyLabel} />
          ) : (
            <ul className='divide-y divide-slate-100 dark:divide-slate-800'>
              {digitalSales.map((item) => (
                <li key={item.id} className='flex items-start justify-between gap-3 px-4 py-3'>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-xs font-bold text-slate-900 dark:text-slate-100'>
                      {item.book_title}
                    </p>
                    {item.customer_email && (
                      <p className='truncate text-[10px] text-slate-400'>{item.customer_email}</p>
                    )}
                    <p className='text-[10px] text-slate-300 dark:text-slate-600'>
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className='shrink-0 text-right'>
                    <Link
                      href='/portal/orders'
                      className='block text-[10px] font-black text-untele hover:underline'
                    >
                      #{item.order_number}
                    </Link>
                    <p className='text-[10px] text-slate-400'>× {item.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>
          )
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

function Empty({ label }: { label: string }) {
  return (
    <div className='flex items-center justify-center px-4 py-12'>
      <p className='text-xs font-bold uppercase tracking-widest text-slate-400'>{label}</p>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  label,
  count,
  urgent,
  bordered,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  urgent?: boolean;
  bordered?: boolean; // adds left border (for middle + right tabs)
}) {
  const badge =
    count > 0 ? (
      <span
        className={`ml-1.5 px-1 py-0.5 text-[9px] font-black ${
          active
            ? 'bg-white/20'
            : urgent
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
        }`}
      >
        {count}
      </span>
    ) : null;

  return (
    <button
      onClick={onClick}
      className={`border-b px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
        bordered ? 'border-l border-l-slate-200 dark:border-l-slate-700' : ''
      } ${
        active
          ? 'border-b-untele bg-untele text-white'
          : urgent && count > 0
            ? 'border-b-slate-200 text-amber-600 hover:bg-amber-50 dark:border-b-slate-700 dark:hover:bg-amber-950/30'
            : 'border-b-slate-200 text-slate-500 hover:text-untele dark:border-b-slate-700'
      }`}
    >
      {label}
      {badge}
    </button>
  );
}
