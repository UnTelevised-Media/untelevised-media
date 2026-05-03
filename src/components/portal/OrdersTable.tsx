'use client';
// src/components/portal/OrdersTable.tsx
// Role-aware order table: admin / sales / author each get appropriate actions and data visibility.

import React, { useState, useTransition } from 'react';
import type { Order, OrderItem, OrderStatus } from '@/lib/bookstore/types';
import type { PortalRole } from '@/lib/auth/roles-utils';

export interface ShippingAddress {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderWithItems extends Order {
  customer_email?: string;
  customer_name?: string;
  shipping_address?: ShippingAddress | null;
  items: Pick<
    OrderItem,
    'book_title' | 'format_label' | 'sanity_format_type' | 'quantity' | 'is_digital' | 'unit_price_cents'
  >[];
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

type QuickFilter = 'all' | 'needs_shipping' | 'digital' | 'tips' | 'refunded';
type SortKey = 'date_desc' | 'date_asc' | 'total_desc';

const PAGE_SIZE = 20;

interface Props {
  orders: OrderWithItems[];
  role: PortalRole;
  /** Per-order author earnings map — passed for author role to show "Your Cut" in expanded panel */
  earningsByOrderId?: Record<string, {
    author_cents: number;
    stripe_fee_cents: number;
    net_after_stripe_cents: number;
  }>;
}

export default function OrdersTable({ orders, role, earningsByOrderId }: Props) {
  // Role-derived permissions
  const canRefund = role === 'admin';
  const canCancel = role === 'admin' || role === 'sales';
  const showSensitivePayment = role === 'admin';
  const showAfterStripe = role === 'admin' || role === 'sales';
  const showAuthorCut = role === 'author';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  // Sales default: start on needs-shipping — their primary workflow
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(
    role === 'sales' ? 'needs_shipping' : 'all',
  );
  const [sortKey, setSortKey] = useState<SortKey>('date_desc');
  const [page, setPage] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);
  const [localOrders, setLocalOrders] = useState<OrderWithItems[]>(orders);
  const [, startTransition] = useTransition();
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [showTrackingFor, setShowTrackingFor] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Quick-filter counts (computed from original orders list, not filtered)
  const needsShippingCount = localOrders.filter(
    (o) =>
      ['paid', 'processing'].includes(o.status) &&
      !o.fulfilled_at &&
      o.items.some((i) => !i.is_digital && i.sanity_format_type !== 'tip'),
  ).length;
  const digitalCount = localOrders.filter((o) =>
    o.items.some((i) => i.is_digital),
  ).length;
  const tipsCount = localOrders.filter((o) =>
    o.items.some((i) => i.sanity_format_type === 'tip'),
  ).length;
  const refundedCount = localOrders.filter((o) => o.status === 'refunded').length;

  // Sort
  const sorted = [...localOrders].sort((a, b) => {
    if (sortKey === 'date_asc') return a.created_at.localeCompare(b.created_at);
    if (sortKey === 'total_desc') return b.total_cents - a.total_cents;
    return b.created_at.localeCompare(a.created_at); // date_desc default
  });

  // Filter
  const filtered = sorted.filter((o) => {
    // Quick filter takes precedence over status dropdown
    if (quickFilter === 'needs_shipping') {
      if (!['paid', 'processing'].includes(o.status)) return false;
      if (!o.items.some((i) => !i.is_digital && i.sanity_format_type !== 'tip')) return false;
    } else if (quickFilter === 'digital') {
      if (!o.items.some((i) => i.is_digital)) return false;
    } else if (quickFilter === 'tips') {
      if (!o.items.some((i) => i.sanity_format_type === 'tip')) return false;
    } else if (quickFilter === 'refunded') {
      if (o.status !== 'refunded') return false;
    } else {
      // 'all' — apply status dropdown
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    }

    const q = search.toLowerCase();
    if (!q) return true;
    return (
      o.order_number.toLowerCase().includes(q) ||
      (o.customer_email ?? '').toLowerCase().includes(q) ||
      (o.customer_name ?? '').toLowerCase().includes(q) ||
      o.items.some((i) => i.book_title.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function resetPage() {
    setPage(0);
  }

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
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: newStatus,
                  fulfilled_at:
                    newStatus === 'fulfilled' || newStatus === 'delivered' || newStatus === 'shipped'
                      ? new Date().toISOString()
                      : o.fulfilled_at,
                }
              : o,
          ),
        );
        setTrackingInputs((prev) => {
          const n = { ...prev };
          delete n[orderId];
          return n;
        });
      });
    } finally {
      setUpdating(null);
    }
  }

  function copyAddress(order: OrderWithItems) {
    const a = order.shipping_address;
    if (!a) return;
    const lines = [
      order.customer_name ?? order.customer_email ?? '',
      a.line1,
      a.line2,
      `${a.city}, ${a.state} ${a.postal_code}`,
      a.country,
    ]
      .filter(Boolean)
      .join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setCopiedAddress(order.id);
      setTimeout(() => setCopiedAddress(null), 2000);
    });
  }

  return (
    <div>
      {/* Quick-filter preset pills */}
      <div className='mb-3 flex flex-wrap gap-2'>
        <QuickPill
          label='All Orders'
          count={localOrders.length}
          active={quickFilter === 'all'}
          onClick={() => { setQuickFilter('all'); resetPage(); }}
        />
        <QuickPill
          label='Needs Shipping'
          count={needsShippingCount}
          active={quickFilter === 'needs_shipping'}
          urgent={needsShippingCount > 0}
          onClick={() => { setQuickFilter('needs_shipping'); resetPage(); }}
        />
        <QuickPill
          label='Digital'
          count={digitalCount}
          active={quickFilter === 'digital'}
          onClick={() => { setQuickFilter('digital'); resetPage(); }}
        />
        {tipsCount > 0 && (
          <QuickPill
            label='Tips'
            count={tipsCount}
            active={quickFilter === 'tips'}
            onClick={() => { setQuickFilter('tips'); resetPage(); }}
          />
        )}
        {refundedCount > 0 && (
          <QuickPill
            label='Refunded'
            count={refundedCount}
            active={quickFilter === 'refunded'}
            onClick={() => { setQuickFilter('refunded'); resetPage(); }}
          />
        )}
      </div>

      {/* Search + status filter + sort */}
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center'>
        <input
          type='search'
          placeholder='Search by order #, name, email, or book title…'
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
          className='flex-1 border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
        />
        {quickFilter === 'all' && (
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
            className='border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-700 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
          >
            <option value='all'>All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
        <select
          value={sortKey}
          onChange={(e) => { setSortKey(e.target.value as SortKey); resetPage(); }}
          className='border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-700 focus:border-untele focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
        >
          <option value='date_desc'>Newest First</option>
          <option value='date_asc'>Oldest First</option>
          <option value='total_desc'>Highest Value</option>
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
                  <th className='w-6' />
                  <Th>Order #</Th>
                  <Th>Customer</Th>
                  <Th>Items</Th>
                  <Th>Total</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((order) => {
                  const physicalItems = order.items.filter(
                    (i) => !i.is_digital && i.sanity_format_type !== 'tip',
                  );
                  const digitalItems = order.items.filter((i) => i.is_digital);
                  const tipItems = order.items.filter((i) => i.sanity_format_type === 'tip');
                  const hasPhysical = physicalItems.length > 0;
                  const hasDigital = digitalItems.length > 0;
                  const hasTip = tipItems.length > 0;
                  const isTipOnly =
                    hasTip && !hasPhysical && !hasDigital;

                  const typeLabel = isTipOnly
                    ? 'Tip Only'
                    : [
                        hasPhysical && 'Physical',
                        hasDigital && 'Digital',
                        hasTip && '+ Tip',
                      ]
                        .filter(Boolean)
                        .join(' ');

                  const isAllNonPhysical = !hasPhysical;
                  const isUpdating = updating === order.id;
                  const isTerminal = ['refunded', 'cancelled', 'delivered', 'fulfilled'].includes(
                    order.status,
                  );
                  // Digital/tip-only orders stuck in paid/processing can be manually fulfilled by admin
                  const canMarkFulfilled =
                    canRefund &&
                    isAllNonPhysical &&
                    ['paid', 'processing'].includes(order.status);

                  const physIdx = STATUS_FLOW_PHYSICAL.indexOf(
                    order.status as (typeof STATUS_FLOW_PHYSICAL)[number],
                  );
                  const nextPhysStatus =
                    physIdx !== -1 && physIdx < STATUS_FLOW_PHYSICAL.length - 1
                      ? STATUS_FLOW_PHYSICAL[physIdx + 1]
                      : null;

                  const canCancelThis =
                    canCancel && ['paid', 'processing'].includes(order.status);

                  // Relative date for recent orders
                  const orderDate = new Date(order.created_at);
                  const daysDiff = Math.floor(
                    (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24),
                  );
                  const dateLabel =
                    daysDiff === 0
                      ? 'Today'
                      : daysDiff === 1
                        ? 'Yesterday'
                        : daysDiff < 7
                          ? `${daysDiff}d ago`
                          : orderDate.toLocaleDateString();

                  return (
                    <React.Fragment key={order.id}>
                      <tr className='border-b border-slate-100 dark:border-slate-800'>
                        <td className='pl-3 pr-1 py-3'>
                          <button
                            onClick={() =>
                              setExpandedOrderId(
                                expandedOrderId === order.id ? null : order.id,
                              )
                            }
                            className='text-[10px] font-black text-slate-400 hover:text-untele'
                            aria-label='Toggle details'
                          >
                            {expandedOrderId === order.id ? '▲' : '▼'}
                          </button>
                        </td>
                        <td className='px-4 py-3 font-mono text-xs font-bold text-slate-900 dark:text-slate-100'>
                          {order.order_number}
                        </td>
                        <td className='px-4 py-3'>
                          <p className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                            {order.customer_name ?? '—'}
                          </p>
                          <p className='text-[10px] text-slate-400'>
                            {order.customer_email ?? '—'}
                          </p>
                        </td>
                        <td className='px-4 py-3'>
                          <ul className='space-y-0.5'>
                            {order.items.map((item, idx) => (
                              <li key={idx} className='flex items-baseline gap-1 text-[10px] text-slate-600 dark:text-slate-400'>
                                <span>{item.book_title} ×{item.quantity}</span>
                                {item.sanity_format_type === 'tip' && (
                                  <span className='inline-block bg-green-100 px-1 text-[9px] font-black uppercase text-green-700 dark:bg-green-900 dark:text-green-300'>
                                    Tip
                                  </span>
                                )}
                                {item.is_digital && item.sanity_format_type !== 'tip' && (
                                  <span className='inline-block bg-blue-100 px-1 text-[9px] font-black uppercase text-blue-600 dark:bg-blue-900 dark:text-blue-300'>
                                    DL
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className='px-4 py-3 text-xs font-bold text-untele'>
                          {(() => {
                            // Fallback to item-level sum when order-level total is 0
                            // (can happen with test/synthetic Stripe events)
                            const displayCents =
                              order.total_cents > 0
                                ? order.total_cents
                                : order.items.reduce(
                                    (s, i) => s + i.unit_price_cents * i.quantity,
                                    0,
                                  );
                            return displayCents > 0
                              ? `$${(displayCents / 100).toFixed(2)}`
                              : <span className='text-slate-300 dark:text-slate-600'>$0.00</span>;
                          })()}
                        </td>
                        <td className='px-4 py-3 text-[10px] text-slate-500'>{typeLabel}</td>
                        <td className='px-4 py-3'>
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${statusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                          {order.fulfilled_at && (
                            <p className='mt-0.5 text-[9px] text-slate-400'>
                              {new Date(order.fulfilled_at).toLocaleDateString()}
                            </p>
                          )}
                        </td>
                        <td className='px-4 py-3 text-[10px] text-slate-500'>
                          <span title={orderDate.toLocaleString()}>{dateLabel}</span>
                        </td>
                        <td className='px-4 py-3'>
                          <div className='flex flex-col gap-1.5'>
                            {/* Advance physical status */}
                            {hasPhysical && nextPhysStatus && (
                              nextPhysStatus === 'shipped' &&
                              showTrackingFor === order.id ? (
                                <div className='flex flex-col gap-1'>
                                  <input
                                    type='text'
                                    placeholder='Tracking # (optional)'
                                    value={trackingInputs[order.id] ?? ''}
                                    onChange={(e) =>
                                      setTrackingInputs((p) => ({
                                        ...p,
                                        [order.id]: e.target.value,
                                      }))
                                    }
                                    className='border border-slate-300 bg-white px-2 py-1 text-[10px] text-slate-900 focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
                                  />
                                  <div className='flex gap-2'>
                                    <button
                                      onClick={() =>
                                        updateStatus(
                                          order.id,
                                          'shipped',
                                          trackingInputs[order.id],
                                        )
                                      }
                                      disabled={isUpdating}
                                      className='text-[10px] font-black uppercase tracking-widest text-untele hover:opacity-80 disabled:opacity-40'
                                    >
                                      {isUpdating ? '…' : 'Confirm Ship'}
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
                                  className='text-left text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-untele disabled:opacity-40'
                                >
                                  {isUpdating ? '…' : `Mark ${nextPhysStatus} →`}
                                </button>
                              )
                            )}
                            {/* Mark Fulfilled — admin only, digital/tip-only stuck in paid/processing */}
                            {canMarkFulfilled && (
                              <button
                                onClick={() => updateStatus(order.id, 'fulfilled')}
                                disabled={isUpdating}
                                className='text-left text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-untele disabled:opacity-40'
                              >
                                {isUpdating ? '…' : 'Mark Fulfilled →'}
                              </button>
                            )}
                            {/* Cancel — admin and sales only */}
                            {canCancelThis && (
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Cancel order ${order.order_number}? This cannot be undone.`,
                                    )
                                  ) {
                                    updateStatus(order.id, 'cancelled');
                                  }
                                }}
                                disabled={isUpdating}
                                className='text-left text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-amber-600 disabled:opacity-40'
                              >
                                Cancel Order
                              </button>
                            )}
                            {/* Refund — admin only */}
                            {canRefund && !isTerminal && (
                              <button
                                onClick={() => {
                                  if (confirm(`Refund order ${order.order_number}?`)) {
                                    updateStatus(order.id, 'refunded');
                                  }
                                }}
                                disabled={isUpdating}
                                className='text-left text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 disabled:opacity-40'
                              >
                                Refund
                              </button>
                            )}
                            {/* No actions available */}
                            {!hasPhysical && !canCancelThis && !canRefund && isTerminal && (
                              <span className='text-[10px] text-slate-300 dark:text-slate-600'>—</span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable detail panel */}
                      {expandedOrderId === order.id && (
                        <tr className='border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50'>
                          <td colSpan={9} className='px-6 py-5'>
                            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                              {/* Payment breakdown */}
                              <div>
                                <p className='mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400'>
                                  Payment
                                </p>
                                <div className='space-y-1 text-xs text-slate-700 dark:text-slate-300'>
                                  {(() => {
                                    // When order-level totals are 0, derive from item prices
                                    const itemSum = order.items.reduce(
                                      (s, i) => s + i.unit_price_cents * i.quantity,
                                      0,
                                    );
                                    const subtotal =
                                      order.subtotal_cents > 0 ? order.subtotal_cents : itemSum;
                                    const total =
                                      order.total_cents > 0
                                        ? order.total_cents
                                        : subtotal + order.tax_cents + order.shipping_cents;
                                    return (
                                      <>
                                        <Row label='Subtotal' value={`$${(subtotal / 100).toFixed(2)}`} />
                                        {order.tax_cents > 0 && (
                                          <Row label='Tax' value={`$${(order.tax_cents / 100).toFixed(2)}`} />
                                        )}
                                        {order.shipping_cents > 0 && (
                                          <Row label='Shipping' value={`$${(order.shipping_cents / 100).toFixed(2)}`} />
                                        )}
                                        <div className='flex justify-between border-t border-slate-200 pt-1 font-bold dark:border-slate-700'>
                                          <span>Total</span>
                                          <span className='text-untele'>
                                            ${(total / 100).toFixed(2)}{' '}
                                            {order.currency.toUpperCase()}
                                          </span>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                                {/* Stripe PI — admin only */}
                                {showSensitivePayment && order.stripe_payment_intent_id && (
                                  <p className='mt-2 break-all text-[10px] text-slate-400'>
                                    PI:{' '}
                                    <span className='font-mono text-slate-500'>
                                      {order.stripe_payment_intent_id}
                                    </span>
                                  </p>
                                )}
                                {order.notes && (
                                  <p className='mt-2 text-[10px] italic text-slate-500'>
                                    {order.notes}
                                  </p>
                                )}
                              </div>

                              {/* After Stripe breakdown — admin / sales */}
                              {showAfterStripe && order.stripe_fee_cents > 0 && (
                                <div>
                                  <p className='mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400'>
                                    After Stripe
                                  </p>
                                  <div className='space-y-1 text-xs text-slate-700 dark:text-slate-300'>
                                    {(() => {
                                      const total =
                                        order.total_cents > 0
                                          ? order.total_cents
                                          : order.items.reduce(
                                              (s, i) => s + i.unit_price_cents * i.quantity,
                                              0,
                                            );
                                      const net = total - order.stripe_fee_cents;
                                      return (
                                        <>
                                          <Row
                                            label='Total Charged'
                                            value={`$${(total / 100).toFixed(2)}`}
                                          />
                                          <Row
                                            label='Stripe Fee'
                                            value={`− $${(order.stripe_fee_cents / 100).toFixed(2)}`}
                                            valueClass='text-red-500'
                                          />
                                          <div className='flex justify-between border-t border-slate-200 pt-1 font-bold dark:border-slate-700'>
                                            <span>Net to Platform</span>
                                            <span className='text-green-600 dark:text-green-400'>
                                              ${(net / 100).toFixed(2)}
                                            </span>
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              )}

                              {/* Your Earnings — author role */}
                              {showAuthorCut && (() => {
                                const earning = earningsByOrderId?.[order.id];
                                if (!earning) return null;
                                return (
                                  <div>
                                    <p className='mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400'>
                                      Your Earnings
                                    </p>
                                    <div className='space-y-1 text-xs text-slate-700 dark:text-slate-300'>
                                      {(() => {
                                        const gross =
                                          order.total_cents > 0
                                            ? order.total_cents
                                            : order.items.reduce(
                                                (s, i) => s + i.unit_price_cents * i.quantity,
                                                0,
                                              );
                                        return (
                                          <>
                                            <Row
                                              label='Customer Paid'
                                              value={`$${(gross / 100).toFixed(2)}`}
                                            />
                                            <Row
                                              label='Stripe Fee'
                                              value={`− $${(earning.stripe_fee_cents / 100).toFixed(2)}`}
                                              valueClass='text-red-500'
                                            />
                                            <div className='flex justify-between border-t border-slate-200 pt-1 font-bold dark:border-slate-700'>
                                              <span>Your Cut</span>
                                              <span className='text-green-600 dark:text-green-400'>
                                                ${(earning.author_cents / 100).toFixed(2)}
                                              </span>
                                            </div>
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Item breakdown */}
                              <div>
                                <p className='mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400'>
                                  Items
                                </p>
                                <ul className='space-y-1.5'>
                                  {order.items.map((item, idx) => (
                                    <li key={idx} className='text-xs text-slate-700 dark:text-slate-300'>
                                      <span className='font-bold'>{item.book_title}</span>
                                      <span className='ml-1 text-slate-400'>
                                        — {item.format_label || item.sanity_format_type} ×{' '}
                                        {item.quantity}
                                      </span>
                                      {item.unit_price_cents > 0 && (
                                        <span className='ml-1 text-slate-400'>
                                          @ ${(item.unit_price_cents / 100).toFixed(2)}
                                        </span>
                                      )}
                                      <span className='ml-1 inline-flex gap-1'>
                                        {item.sanity_format_type === 'tip' && (
                                          <span className='inline-block bg-green-100 px-1 text-[9px] font-black uppercase text-green-700 dark:bg-green-900 dark:text-green-300'>
                                            Tip
                                          </span>
                                        )}
                                        {item.is_digital && item.sanity_format_type !== 'tip' && (
                                          <span className='inline-block bg-blue-100 px-1 text-[9px] font-black uppercase text-blue-600 dark:bg-blue-900 dark:text-blue-300'>
                                            Digital
                                          </span>
                                        )}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Shipping address */}
                              <div>
                                <p className='mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400'>
                                  Ship To
                                </p>
                                {order.shipping_address ? (
                                  <div className='space-y-0.5 text-xs text-slate-700 dark:text-slate-300'>
                                    {order.customer_name && (
                                      <p className='font-bold'>{order.customer_name}</p>
                                    )}
                                    <p>{order.shipping_address.line1}</p>
                                    {order.shipping_address.line2 && (
                                      <p>{order.shipping_address.line2}</p>
                                    )}
                                    <p>
                                      {order.shipping_address.city},{' '}
                                      {order.shipping_address.state}{' '}
                                      {order.shipping_address.postal_code}
                                    </p>
                                    <p>{order.shipping_address.country}</p>
                                    <button
                                      onClick={() => copyAddress(order)}
                                      className='mt-1.5 text-[10px] font-black uppercase tracking-widest text-untele hover:opacity-80'
                                    >
                                      {copiedAddress === order.id ? 'Copied ✓' : 'Copy Address'}
                                    </button>
                                  </div>
                                ) : (
                                  <p className='text-[10px] text-slate-400'>
                                    {order.items.every((i) => i.is_digital || i.sanity_format_type === 'tip')
                                      ? 'Digital / tip — no address'
                                      : 'No address on file'}
                                  </p>
                                )}
                              </div>

                              {/* Timestamps */}
                              <div>
                                <p className='mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400'>
                                  Timeline
                                </p>
                                <div className='space-y-1 text-[10px] text-slate-500'>
                                  <div>
                                    <span className='font-bold'>Placed:</span>{' '}
                                    {new Date(order.created_at).toLocaleString()}
                                  </div>
                                  <div>
                                    <span className='font-bold'>Updated:</span>{' '}
                                    {new Date(order.updated_at).toLocaleString()}
                                  </div>
                                  {order.fulfilled_at && (
                                    <div>
                                      <span className='font-bold'>Fulfilled:</span>{' '}
                                      {new Date(order.fulfilled_at).toLocaleString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

function QuickPill({
  label,
  count,
  active,
  urgent,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  urgent?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
        active
          ? 'border-untele bg-untele text-white'
          : urgent
            ? 'border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-500 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
            : 'border-slate-200 bg-white text-slate-500 hover:border-untele hover:text-untele dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      {label}
      <span
        className={`px-1 py-0.5 text-[9px] ${
          active ? 'bg-white/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className='flex justify-between'>
      <span>{label}</span>
      <span className={valueClass}>{value}</span>
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
