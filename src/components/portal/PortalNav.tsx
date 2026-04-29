// src/components/global/PortalNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { ChevronDown } from 'lucide-react';
import type { PortalRole } from '@/lib/auth/roles-utils';

// ── Link definitions ───────────────────────────────────────────────────────────

const authorLinks = [
  { href: '/portal/articles', label: 'Articles' },
  { href: '/portal/sources', label: 'Sources' },
];

const editorLinks = [
  { href: '/portal/applications', label: 'Applications' },
];

const contactDropdownLinks = [
  { href: '/portal/contact', label: 'Contact' },
  { href: '/portal/secure-contact', label: 'Secure Contact' },
  { href: '/portal/whistleblower', label: 'Whistleblower' },
  { href: '/portal/subscribers', label: 'Subscribers' },
];

const bookstoreAuthorLinks = [
  { href: '/portal/books', label: 'My Books' },
];

const bookstoreSharedLinks = [
  { href: '/portal/orders', label: 'Orders' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

interface NavLinkProps {
  href: string;
  label: string;
  exact?: boolean;
  pathname: string;
}

function NavLink({ href, label, exact, pathname }: NavLinkProps) {
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

function ContactsDropdown({ pathname }: { pathname: string }) {
  const anyActive = contactDropdownLinks.some((l) => pathname.startsWith(l.href));

  return (
    <div className='group relative'>
      <button
        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
          anyActive
            ? 'bg-untele text-white'
            : 'text-slate-600 hover:text-untele dark:text-slate-400 dark:hover:text-untele'
        }`}
      >
        Contacts
        <ChevronDown className='h-3 w-3 transition-transform duration-150 group-hover:rotate-180' />
      </button>

      {/* Dropdown panel */}
      <div className='pointer-events-none absolute left-0 top-full z-50 mt-1 min-w-[160px] border border-slate-200 bg-white opacity-0 shadow-lg transition-all duration-150 group-hover:pointer-events-auto group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-950'>
        {contactDropdownLinks.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                active
                  ? 'bg-untele text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-untele dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-untele'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Divider() {
  return <span className='mx-1 h-4 w-px bg-slate-300 dark:bg-slate-700' aria-hidden='true' />;
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  isEditorPlus?: boolean;
  role?: PortalRole | null;
}

export default function PortalNav({ isEditorPlus = false, role }: Props) {
  const pathname = usePathname();
  const isSales = role === 'sales';

  return (
    <header className='border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6'>

        {/* Brand */}
        <Link
          href={isSales ? '/portal/orders' : '/portal'}
          className='flex items-center gap-2 text-sm font-black uppercase tracking-widest text-untele'
        >
          <span className='h-3 w-3 bg-untele' aria-hidden='true' />
          {isSales ? 'Sales Portal' : 'Portal'}
        </Link>

        {/* Nav links */}
        <nav className='hidden items-center gap-1 sm:flex'>
          {!isSales && (
            <>
              {authorLinks.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
              ))}

              {isEditorPlus && (
                <>
                  <Divider />
                  {editorLinks.map((link) => (
                    <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
                  ))}
                  <ContactsDropdown pathname={pathname} />
                </>
              )}

              <Divider />
              {bookstoreAuthorLinks.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
              ))}
            </>
          )}

          {bookstoreSharedLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
          ))}

          {!isSales && (
            <>
              <Divider />
              <NavLink href='/portal/profile' label='Profile' pathname={pathname} />
            </>
          )}
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
