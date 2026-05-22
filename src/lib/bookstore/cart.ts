'use client';
// src/lib/bookstore/cart.ts
// Zustand cart store with localStorage persistence.
// Only import from client components — this module uses browser APIs.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, FormatType } from './types';

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (sanityBookId: string, formatKey: string) => void;
  updateQuantity: (sanityBookId: string, formatKey: string, quantity: number) => void;
  updatePrice: (sanityBookId: string, formatKey: string, price: number) => void;
  updateTipIncluded: (sanityBookId: string, formatKey: string, included: boolean) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (incoming) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.sanityBookId === incoming.sanityBookId && i.formatKey === incoming.formatKey
          );
          if (existing) {
            // Tips don't stack quantity — update price and re-check instead
            if (incoming.formatType === 'tip') {
              return {
                items: state.items.map((i) =>
                  i.sanityBookId === incoming.sanityBookId && i.formatKey === incoming.formatKey
                    ? { ...i, price: incoming.price, tipIncluded: incoming.tipIncluded ?? true }
                    : i
                ),
              };
            }
            return {
              items: state.items.map((i) =>
                i.sanityBookId === incoming.sanityBookId && i.formatKey === incoming.formatKey
                  ? { ...i, quantity: i.quantity + (incoming.quantity ?? 1) }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...incoming, quantity: incoming.quantity ?? 1 }],
          };
        });
      },

      removeItem: (sanityBookId, formatKey) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.sanityBookId === sanityBookId && i.formatKey === formatKey)
          ),
        }));
      },

      updateQuantity: (sanityBookId, formatKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(sanityBookId, formatKey);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.sanityBookId === sanityBookId && i.formatKey === formatKey ? { ...i, quantity } : i
          ),
        }));
      },

      updatePrice: (sanityBookId, formatKey, price) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.sanityBookId === sanityBookId && i.formatKey === formatKey ? { ...i, price } : i
          ),
        }));
      },

      updateTipIncluded: (sanityBookId, formatKey, included) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.sanityBookId === sanityBookId && i.formatKey === formatKey
              ? { ...i, tipIncluded: included }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'untele-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Convenience helper to build a cart item from a SanityBook format
export function buildCartItem(params: {
  sanityBookId: string;
  slug: string;
  title: string;
  coverImageRef?: string;
  formatKey: string;
  formatType: FormatType;
  price: number;
  stripePriceId: string;
  nameYourPrice?: boolean;
}): Omit<CartItem, 'quantity'> {
  return {
    sanityBookId: params.sanityBookId,
    slug: params.slug,
    title: params.title,
    coverImageRef: params.coverImageRef,
    formatKey: params.formatKey,
    formatType: params.formatType,
    price: params.price,
    stripePriceId: params.stripePriceId,
    ...(params.nameYourPrice ? { nameYourPrice: true } : {}),
  };
}
