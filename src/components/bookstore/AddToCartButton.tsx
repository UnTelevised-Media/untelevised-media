'use client';
// Add-to-cart button — calls Zustand store from a client component.

import { useState } from 'react';
import { useCart, buildCartItem } from '@/lib/bookstore/cart';
import type { SanityBook, SanityBookFormat } from '@/lib/bookstore/types';

interface Props {
  book: SanityBook;
  format: SanityBookFormat;
  customPrice?: number; // required when format.nameYourPrice is true
  disabled?: boolean;
}

export default function AddToCartButton({ book, format, customPrice, disabled }: Props) {
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const handleAdd = () => {
    const isNyop = !!format.nameYourPrice;
    addItem(
      buildCartItem({
        sanityBookId: book._id,
        slug: book.slug.current,
        title: book.title,
        coverImageRef: book.coverImage?.asset?._ref,
        formatKey: format._key,
        formatType: format.formatType,
        price: isNyop ? (customPrice ?? 0) : format.price,
        // NYOP items use the product ID so the checkout route can build price_data
        stripePriceId: isNyop ? (format.stripeProductId ?? '') : (format.stripePriceId ?? ''),
        nameYourPrice: isNyop || undefined,
      }),
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={disabled}
      className={`shrink-0 px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-opacity ${
        added
          ? 'bg-green-600 text-white'
          : 'bg-untele text-white hover:opacity-90 disabled:opacity-40'
      }`}
    >
      {added ? 'Added ✓' : 'Add to Cart'}
    </button>
  );
}
