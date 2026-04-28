'use client';
// Mini-cart header icon with item count badge.
// Renders a shopping bag icon with the current cart item count.

import Link from 'next/link';
import { useCart } from '@/lib/shop/cart';

export default function MiniCart() {
  const count = useCart((s) => s.getItemCount());

  return (
    <Link
      href='/shop/cart'
      aria-label={`Shopping cart${count > 0 ? ` — ${count} items` : ''}`}
      className='relative flex h-9 w-9 items-center justify-center text-slate-700 hover:text-untele dark:text-slate-300'
    >
      {/* Simple bag icon via SVG */}
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='20'
        height='20'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z' />
        <line x1='3' y1='6' x2='21' y2='6' />
        <path d='M16 10a4 4 0 0 1-8 0' />
      </svg>
      {count > 0 && (
        <span className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-untele text-[9px] font-black text-white'>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
