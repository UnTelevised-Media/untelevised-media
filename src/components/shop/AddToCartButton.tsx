'use client';
// Add-to-cart button — calls Zustand store from a client component.

import { useState } from 'react';
import { useCart, buildCartItem } from '@/lib/shop/cart';
import type { SanityBook, SanityBookFormat } from '@/lib/shop/types';

interface Props {
  book: SanityBook;
  format: SanityBookFormat;
}

export default function AddToCartButton({ book, format }: Props) {
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const handleAdd = () => {
    addItem(
      buildCartItem({
        sanityBookId: book._id,
        slug: book.slug.current,
        title: book.title,
        coverImageRef: book.coverImage?.asset?._ref,
        formatKey: format._key,
        formatType: format.formatType,
        price: format.price,
        stripePriceId: format.stripePriceId ?? '',
      }),
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      className={`shrink-0 px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-opacity ${
        added
          ? 'bg-green-600 text-white'
          : 'bg-untele text-white hover:opacity-90'
      }`}
    >
      {added ? 'Added ✓' : 'Add to Cart'}
    </button>
  );
}
