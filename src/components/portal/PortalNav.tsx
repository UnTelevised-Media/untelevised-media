// src/components/portal/PortalNav.tsx
// Top navigation bar for the Author Portal.
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

const links = [
  { href: '/portal/articles', label: 'Articles' },
  { href: '/portal/sources', label: 'Sources' },
];

export default function PortalNav() {
  const pathname = usePathname();

  return (
    <header className='border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6'>
        {/* Brand */}
        <Link
          href='/portal/articles'
          className='flex items-center gap-2 text-sm font-black uppercase tracking-widest text-untele'
        >
          <span className='h-3 w-3 bg-untele' aria-hidden='true' />
          Author Portal
        </Link>

        {/* Nav links */}
        <nav className='hidden gap-1 sm:flex'>
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                  active
                    ? 'bg-untele text-white'
                    : 'text-slate-600 hover:text-untele dark:text-slate-400 dark:hover:text-untele'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User controls */}
        <div className='flex items-center gap-3'>
          <Link
            href='/'
            className='hidden text-xs text-slate-500 hover:text-untele dark:text-slate-400 sm:block'
          >
            ← Back to site
          </Link>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
