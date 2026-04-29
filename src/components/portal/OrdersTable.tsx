'use client';
// src/components/portal/OrdersTable.tsx
// Client component: paginated, filterable, sortable order table with status update.

import { useState, useTransition, useRef } from 'react';
import type { Order, OrderItem, OrderStatus } from '@/lib/bookstore/types';

export interface OrderWithItems extends Order {
  customer_email?: string;
  customer_name?: string;
  items: Pick<OrderItem, 'book_title' | 'sanity_format_type' | 'quantity' | 'is_digital'>[];
}

const STATUS_FLOW_PHYSICAL = ['paid', 'processing', 'shipped', 'delivered'] as const;
const ALL_STATUSES: OrderStatus[] = [
  'pending', 'paid', 'processing', 'fulfilled', 'shipped', 'delivered', 'refunded', 'cancelled',
];

function statusColor(s: string) {
  const map: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    processing: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    fulfilled: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    delivered: 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200',
    refunded: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    cancelled: 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  };
  return map[s] ?? 'bg-slate-100 text-slate-500';
}

const PAGE_SIZE = 20;

interface Props {
  orders: OrderWithItems[];
  canAdmin: boolean; // admin can refund; sales+admin can update status
}

export default function OrdersTable({ orders, canAdmin }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);
  const [localOrders, setLocalOrders] = useState<OrderWithItems[]>(orders);
  const [, startTransition] = useTransition();
  // Tracking number: map of orderId → input value (shown when advancing to 'shipped')
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [showTrackingFor, setShowTrackingFor] = useState<string | null>(null);

  // Filter
  const filtered = localOrders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      o.order_number.toLowerCase().includes(q) ||
      (o.customer_email ?? '').toLowerCase().includes(q) ||
      o.items.some((i) => i.book_title.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  async function updateStatus(orderId: string, newStatus: OrderStatus, trackingNumber?: string) {
    setUpdating(orderId);
    setShowTrackingFor(null);
    try {
      const res = await fetch(`/api/portal/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, tracking_number: trackingNumber }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert((err as { error?: string }).error ?? 'Failed to update status');
        return;
      }
      startTransition(() => {
        setLocalOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        );
        setTrackingInputs((prev) => { const n = { ...prev }; delete n[orderId]; return n; });
      });
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center'>
        <input
          type='search'
          placeholder='Search by order #, email, or book title…'
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className='flex-1 border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className='border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-700 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
        >
          <option value='all'>All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <div className='border border-slate-200 bg-white px-4 py-12 text-center dark:border-slate-700 dark:bg-slate-900'>
          <p className='text-xs font-bold uppercase tracking-widest text-slate-400'>
            No orders found
          </p>
        </div>
      ) : (
        <div className='border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-slate-200 dark:border-slate-700'>
                  <Th>Order #</Th>
                  <Th>Customer</Th>
                  <Th>Items</Th>
                  <Th>Total</Th>
                  <Th>Format</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((order) => {
                  const hasPhysical = order.items.some((i) => !i.is_digital);
                  const hasDigital = order.items.some((i) => i.is_digital);
                  const formatLabel = hasPhysical && hasDigital
                    ? 'Physical + Digital'
                    : hasPhysical ? 'Physical' : 'Digital';

                  const isUpdating = updating === order.id;

                  // Next physical status
                  const physIdx = STATUS_FLOW_PHYSICAL.indexOf(order.status as typeof STATUS_FLOW_PHYSICAL[number]);
                  const nextPhysStatus = physIdx !== -1 && physIdx < STATUS_FLOW_PHYSICAL.length - 1
                    ? STATUS_FLOW_PHYSICAL[physIdx + 1]
                    : null;

                  return (
                    <tr
                      key={order.id}
                      className='border-b border-slate-100 last:border-0 dark:border-slate-800'
                    >
                      <td className='px-4 py-3 font-mono text-xs font-bold text-slate-900 dark:text-slate-100'>
                        {order.order_number}
                      </td>
                      <td className='px-4 py-3'>
                        <p className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                          {order.customer_name ?? '—'}
                        </p>
                        <p className='text-[10px] text-slate-400'>{order.customer_email ?? '—'}</p>
                      </td>
                      <td className='px-4 py-3'>
                        <ul className='space-y-0.5'>
                          {order.items.map((item, idx) => (
                            <li key={idx} className='text-[10px] text-slate-600 dark:text-slate-400'>
                              {item.book_title} ×{item.quantity}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className='px-4 py-3 text-xs font-bold text-untele'>
                        ${(order.total_cents / 100).toFixed(2)}
                      </td>
                      <td className='px-4 py-3 text-[10px] text-slate-500'>{formatLabel}</td>
                      <td className='px-4 py-3'>
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${statusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-[10px] text-slate-500'>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex flex-col gap-1'>
                          {/* Physical: advance to next status */}
                          {hasPhysical && nextPhysStatus && (
                            nextPhysStatus === 'shipped' && showTrackingFor === order.id ? (
                              /* Tracking number inline input */
                              <div className='flex flex-col gap-1'>
                                <input
                                  type='text'
                                  placeholder='Tracking # (optional)'
                                  value={trackingInputs[order.id] ?? ''}
                                  onChange={(e) =>
                                    setTrackingInputs((p) => ({ ...p, [order.id]: e.target.value }))
                                  }
                                  className='border border-slate-300 bg-white px-2 py-1 text-[10px] text-slate-900 focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
                                />
                                <div className='flex gap-2'>
                                  <button
                                    onClick={() =>
                                      updateStatus(order.id, 'shipped', trackingInputs[order.id])
                                    }
                                    disabled={isUpdating}
                                    className='text-[10px] font-black uppercase tracking-widest text-untele hover:opacity-80 disabled:opacity-40'
                                  >
                                    {isUpdating ? '…' : 'Confirm'}
                                  </button>
                                  <button
                                    onClick={() => setShowTrackingFor(null)}
                                    className='text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600'
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  nextPhysStatus === 'shipped'
                                    ? setShowTrackingFor(order.id)
                                    : updateStatus(order.id, nextPhysStatus as OrderStatus)
                                }
                                disabled={isUpdating}
                                className='text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-untele disabled:opacity-40'
                              >
                                {isUpdating ? '…' : `Mark ${nextPhysStatus}`}
                              </button>
                            )
                          )}
                          {/* Admin: refund */}
                          {canAdmin && !['refunded', 'cancelled'].includes(order.status) && (
                            <button
                              onClick={() => {
                                if (confirm(`Refund order ${order.order_number}?`)) {
                                  updateStatus(order.id, 'refunded');
                                }
                              }}
                              disabled={isUpdating}
                              className='text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 disabled:opacity-40'
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='mt-4 flex items-center justify-between text-xs font-bold text-slate-500'>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className='px-3 py-1.5 hover:text-untele disabled:opacity-40'
          >
            ← Prev
          </button>
          <span>
            Page {page + 1} of {totalPages} — {filtered.length} orders
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className='px-3 py-1.5 hover:text-untele disabled:opacity-40'
          >
            Next →
          </button>
        </div>
      )}
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
