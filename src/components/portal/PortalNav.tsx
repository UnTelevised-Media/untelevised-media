'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PortalRole } from '@/lib/auth/roles-utils';

const allLinks = [
  { href: '/portal/books', label: 'My Books', roles: ['admin', 'editor', 'author'] },
  { href: '/portal/orders', label: 'Orders', roles: ['admin', 'editor', 'author', 'sales'] },
] satisfies { href: string; label: string; roles: PortalRole[] }[];

export default function PortalNav({ role }: { role: PortalRole }) {
  const pathname = usePathname();
  const links = allLinks.filter((l) => l.roles.includes(role));

  return (
    <nav className='mb-8 flex flex-wrap gap-1 border-b border-slate-200 pb-4 dark:border-slate-800'>
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
              active
                ? 'bg-untele text-white'
                : 'border border-slate-200 text-slate-500 hover:border-untele hover:text-untele dark:border-slate-700 dark:text-slate-400'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
