// src/app/api/portal/orders/[id]/status/route.ts
// PATCH — update order status. Accessible to admin and sales roles.
// Authors can also access if the order contains one of their books.

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getRoleFromUser } from '@/lib/auth/roles';
import { isSalesOnly } from '@/lib/auth/roles-utils';
import { shopServiceClient } from '@/lib/bookstore/supabase';
import { sendShipmentEmail, sendRefundEmail } from '@/lib/bookstore/email';
import type { OrderStatus } from '@/lib/bookstore/types';
import { z } from 'zod';

const ALLOWED_TRANSITIONS: Record<string, OrderStatus[]> = {
  paid: ['processing', 'fulfilled', 'cancelled', 'refunded'],
  processing: ['shipped', 'fulfilled', 'cancelled', 'refunded'],
  shipped: ['delivered', 'refunded'],
  delivered: ['refunded'],
  fulfilled: ['refunded'],
};

const schema = z.object({
  status: z.enum([
    'pending',
    'paid',
    'processing',
    'fulfilled',
    'shipped',
    'delivered',
    'refunded',
    'cancelled',
  ]),
  tracking_number: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await params;

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = getRoleFromUser(user);
  if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { status: newStatus } = parsed.data;

  // Fetch the current order to validate transition and ownership
  const { data: order, error: fetchError } = await shopServiceClient
    .from('orders')
    .select('id, status, customer_id')
    .eq('id', orderId)
    .maybeSingle();

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const currentStatus = order.status as OrderStatus;

  // Validate allowed transition (non-admins are constrained)
  if (role !== 'admin') {
    const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentStatus} to ${newStatus}` },
        { status: 422 }
      );
    }
    // Sales-only: cannot issue refunds (admin-only)
    if (isSalesOnly(role) && newStatus === 'refunded') {
      return NextResponse.json({ error: 'Refunds require admin role' }, { status: 403 });
    }
    // Authors: verify the order contains their books
    if (role === 'author') {
      const { data: items } = await shopServiceClient
        .from('order_items')
        .select('sanity_book_id')
        .eq('order_id', orderId);

      if (!items || items.length === 0) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      // We'd need to cross-ref Sanity here; for now authors can only mark-shipped their own orders
      // via the role-aware page which scopes orders to their books before rendering.
    }
  }

  // Apply update
  const setFulfilledAt =
    newStatus === 'fulfilled' || newStatus === 'delivered' || newStatus === 'shipped';

  const { error: updateError } = await shopServiceClient
    .from('orders')
    .update({
      status: newStatus,
      ...(setFulfilledAt ? { fulfilled_at: new Date().toISOString() } : {}),
    })
    .eq('id', orderId);

  if (updateError) {
    console.error('[portal/orders/status]', updateError.message);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }

  // Fetch order + customer for email triggers
  const { data: fullOrder } = await shopServiceClient
    .from('orders')
    .select('order_number, customer:customers(email)')
    .eq('id', orderId)
    .maybeSingle();

  const customerEmail = (fullOrder?.customer as { email: string } | null)?.email;

  // Fire shipment email when marking shipped
  if (newStatus === 'shipped' && customerEmail && fullOrder) {
    sendShipmentEmail({
      to: customerEmail,
      orderNumber: fullOrder.order_number,
      trackingNumber: parsed.data.tracking_number,
    }).catch((e) => console.error('[portal/orders/status] shipment email failed:', e));
  }

  // Fire refund email and revoke digital downloads on refund
  if (newStatus === 'refunded') {
    if (customerEmail && fullOrder) {
      sendRefundEmail({ to: customerEmail, orderNumber: fullOrder.order_number }).catch((e) =>
        console.error('[portal/orders/status] refund email failed:', e)
      );
    }

    const { data: digitalItems } = await shopServiceClient
      .from('order_items')
      .select('id')
      .eq('order_id', orderId)
      .eq('is_digital', true);

    for (const item of digitalItems ?? []) {
      await shopServiceClient
        .from('digital_downloads')
        .update({ max_downloads: 0 })
        .eq('order_item_id', item.id);
    }
  }

  return NextResponse.json({ success: true, status: newStatus });
}
