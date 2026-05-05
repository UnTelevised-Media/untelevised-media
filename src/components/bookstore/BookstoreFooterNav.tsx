// src/components/bookstore/BookstoreFooterNav.tsx
// Slim bookstore section nav — sits between page content and the site footer.

import Link from 'next/link';

const links = [
  { href: '/bookstore', label: 'Bookstore' },
  { href: '/bookstore/about', label: 'Our Story' },
  { href: '/bookstore/wishlist', label: 'Wishlist' },
  { href: '/bookstore/orders', label: 'My Orders' },
  { href: '/bookstore/downloads', label: 'Download Vault' },
  { href: '/bookstore/returns', label: 'Returns & Refunds' },
];

export default function BookstoreFooterNav() {
  return (
    <nav
      className='border-t-2 border-[#009736] bg-hp-sand-mid dark:bg-hp-dark-card'
      aria-label='Hurriya Publications section navigation'
    >
      <div className='mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6 lg:px-8'>
        <span className='text-[10px] font-black uppercase tracking-widest text-[#009736]'>
          Hurriya Publications
        </span>
        <div className='h-3 w-px bg-slate-300 dark:bg-slate-700' aria-hidden='true' />
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className='text-[11px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-[#009736] dark:text-hp-muted dark:hover:text-[#009736]'
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
