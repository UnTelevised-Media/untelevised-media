// src/components/portal/PortalNav.tsx
// Top navigation bar for the Author Portal.
// isEditorPlus and role are passed from the server component so links render on first paint.
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import type { PortalRole } from '@/lib/auth/roles-utils';

const authorLinks = [
  { href: '/portal', label: 'Dashboard' },
  { href: '/portal/articles', label: 'Articles' },
  { href: '/portal/sources', label: 'Sources' },
  { href: '/portal/profile', label: 'Profile' },
];

const editorLinks = [
  { href: '/portal/applications', label: 'Applications' },
  { href: '/portal/contact', label: 'Contact' },
  { href: '/portal/secure-contact', label: 'Secure' },
  { href: '/portal/whistleblower', label: 'Whistleblower' },
  { href: '/portal/subscribers', label: 'Subscribers' },
];

const bookstoreAuthorLinks = [
  { href: '/portal/books', label: 'My Books' },
];

const bookstoreSharedLinks = [
  { href: '/portal/orders', label: 'Orders' },
];

interface Props {
  isEditorPlus?: boolean;
  role?: PortalRole | null;
}

export default function PortalNav({ isEditorPlus = false, role }: Props) {
  const pathname = usePathname();
  const isSales = role === 'sales';

  function NavLink({ href, label, exact }: { href: string; label: string; exact?: boolean }) {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
          active
            ? 'bg-untele text-white'
            : 'text-slate-600 hover:text-untele dark:text-slate-400 dark:hover:text-untele'
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <header className='border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6'>
        {/* Brand */}
        <Link
          href={isSales ? '/portal/orders' : '/portal'}
          className='flex items-center gap-2 text-sm font-black uppercase tracking-widest text-untele'
        >
          <span className='h-3 w-3 bg-untele' aria-hidden='true' />
          {isSales ? 'Sales Portal' : 'Author Portal'}
        </Link>

        {/* Nav links */}
        <nav className='hidden gap-1 sm:flex sm:items-center'>
          {!isSales && (
            <>
              {authorLinks.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} exact={link.href === '/portal'} />
              ))}

              {isEditorPlus && (
                <>
                  <span className='mx-1 h-4 w-px bg-slate-300 dark:bg-slate-700' aria-hidden='true' />
                  {editorLinks.map((link) => (
                    <NavLink key={link.href} href={link.href} label={link.label} />
                  ))}
                </>
              )}

              <span className='mx-1 h-4 w-px bg-slate-300 dark:bg-slate-700' aria-hidden='true' />
              {bookstoreAuthorLinks.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} />
              ))}
            </>
          )}

          {bookstoreSharedLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
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
