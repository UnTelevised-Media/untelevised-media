'use client';

import { useEffect } from 'react';
import { useCart } from '@/lib/bookstore/cart';

// Clears the cart once the user lands on the order-success page.
// Runs client-side so the Zustand/localStorage store is accessible.
export default function CartClearer() {
  const clearCart = useCart((s) => s.clearCart);
  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return null;
}
