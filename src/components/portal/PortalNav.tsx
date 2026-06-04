// src/components/portal/PortalNav.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  ChevronDown,
  Menu,
  X,
  Newspaper,
  BookOpen,
  Mail,
  User,
  LayoutDashboard,
  FileText,
  Library,
  DollarSign,
  ShoppingBag,
  ClipboardList,
  Star,
  MessageSquare,
  ShieldAlert,
  Users,
  UserCircle,
  Database,
} from 'lucide-react';
import type { PortalRole } from '@/lib/auth/roles-utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NavLink = { href: string; label: string; icon: React.ReactNode };
type Section = { id: string; label: string; icon: React.ReactNode; links: NavLink[] };

// ---------------------------------------------------------------------------
// Section builder — role-aware
// ---------------------------------------------------------------------------

function buildSections(isEditorPlus: boolean, role: PortalRole | null): Section[] {
  if (role === 'sales') {
    return [
      {
        id: 'books',
        label: 'Books',
        icon: <BookOpen className='h-3.5 w-3.5' />,
        links: [
          { href: '/portal/sales', label: 'Sales', icon: <ShoppingBag className='h-3.5 w-3.5' /> },
        ],
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: <User className='h-3.5 w-3.5' />,
        links: [
          {
            href: '/portal/profile',
            label: 'My Profile',
            icon: <UserCircle className='h-3.5 w-3.5' />,
          },
        ],
      },
    ];
  }

  // News: Articles + Sources only
  const newsLinks: NavLink[] = [
    { href: '/portal/articles', label: 'Articles', icon: <FileText className='h-3.5 w-3.5' /> },
    { href: '/portal/sources', label: 'Sources', icon: <Database className='h-3.5 w-3.5' /> },
  ];

  // Books: Library + Earnings + Sales + Reviews (editor+)
  const booksLinks: NavLink[] = [
    { href: '/portal/library', label: 'Library', icon: <Library className='h-3.5 w-3.5' /> },
    { href: '/portal/earnings', label: 'Earnings', icon: <DollarSign className='h-3.5 w-3.5' /> },
    { href: '/portal/sales', label: 'Sales', icon: <ShoppingBag className='h-3.5 w-3.5' /> },
  ];
  if (isEditorPlus) {
    booksLinks.push({
      href: '/portal/reviews',
      label: 'Reviews',
      icon: <Star className='h-3.5 w-3.5' />,
    });
  }

  // Contacts: Applications (editor+) + all contact inboxes (editor+)
  const contactsLinks: NavLink[] = [];
  if (isEditorPlus) {
    contactsLinks.push(
      {
        href: '/portal/applications',
        label: 'Applications',
        icon: <ClipboardList className='h-3.5 w-3.5' />,
      },
      {
        href: '/portal/contact',
        label: 'Contact',
        icon: <MessageSquare className='h-3.5 w-3.5' />,
      },
      {
        href: '/portal/secure-contact',
        label: 'Secure Contact',
        icon: <ShieldAlert className='h-3.5 w-3.5' />,
      },
      {
        href: '/portal/whistleblower',
        label: 'Whistleblower',
        icon: <ShieldAlert className='h-3.5 w-3.5' />,
      },
      {
        href: '/portal/subscribers',
        label: 'Subscribers',
        icon: <Users className='h-3.5 w-3.5' />,
      }
    );
  }

  const sections: Section[] = [
    {
      id: 'news',
      label: 'News',
      icon: <Newspaper className='h-3.5 w-3.5' />,
      links: newsLinks,
    },
    {
      id: 'books',
      label: 'Books',
      icon: <BookOpen className='h-3.5 w-3.5' />,
      links: booksLinks,
    },
  ];

  if (isEditorPlus) {
    sections.push({
      id: 'contacts',
      label: 'Contacts',
      icon: <Mail className='h-3.5 w-3.5' />,
      links: contactsLinks,
    });
  }

  // Profile: My Profile only — Dashboard is a standalone nav link
  sections.push({
    id: 'profile',
    label: 'Profile',
    icon: <User className='h-3.5 w-3.5' />,
    links: [
      {
        href: '/portal/profile',
        label: 'My Profile',
        icon: <UserCircle className='h-3.5 w-3.5' />,
      },
    ],
  });

  return sections;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props {
  isEditorPlus?: boolean;
  role?: PortalRole | null;
}

export default function PortalNav({ isEditorPlus = false, role = null }: Props) {
  const pathname = usePathname();
  const sections = buildSections(isEditorPlus, role);
  const isSales = role === 'sales';
  const dashboardHref = isSales ? '/portal/sales' : '/portal';
  const isDashboard = pathname === '/portal' || (isSales && pathname === '/portal/sales');

  const [openDesktop, setOpenDesktop] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDesktop(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setOpenDesktop(null);
    setMobileOpen(false);
  }, [pathname]);

  function isSectionActive(section: Section) {
    return section.links.some((l) => pathname.startsWith(l.href));
  }

  return (
    <header
      ref={navRef}
      className='relative z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
    >
      <div className='mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6'>
        {/* ── Brand / Dashboard link (always visible, all sizes) ─── */}
        <Link
          href={dashboardHref}
          className='flex shrink-0 items-center gap-2 py-4 text-sm font-black uppercase tracking-widest text-untele'
        >
          <span className='h-3 w-3 bg-untele' aria-hidden='true' />
          {isSales ? 'Sales Portal' : 'Author Portal'}
        </Link>

        {/* ── Standalone Dashboard link — hides before dropdowns do ─ */}
        {!isSales && (
          <Link
            href='/portal'
            className={`hidden shrink-0 items-center gap-1.5 px-2 py-4 text-xs font-bold uppercase tracking-widest transition-colors lg:flex ${
              isDashboard
                ? 'text-untele'
                : 'text-slate-500 hover:text-untele dark:text-slate-400 dark:hover:text-untele'
            }`}
          >
            <LayoutDashboard className='h-3.5 w-3.5' aria-hidden='true' />
            Dashboard
          </Link>
        )}

        {/* ── Desktop dropdowns ──────────────────────────────────── */}
        <nav className='hidden flex-1 items-center gap-0.5 md:flex' aria-label='Portal navigation'>
          {sections.map((section) => {
            const active = isSectionActive(section);
            const isOpen = openDesktop === section.id;

            return (
              <div key={section.id} className='relative'>
                <button
                  type='button'
                  onClick={() => setOpenDesktop(isOpen ? null : section.id)}
                  aria-expanded={isOpen}
                  aria-haspopup='true'
                  className={`flex items-center gap-1.5 px-3 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${
                    active || isOpen
                      ? 'text-untele'
                      : 'text-slate-500 hover:text-untele dark:text-slate-400 dark:hover:text-untele'
                  }`}
                >
                  <span aria-hidden='true'>{section.icon}</span>
                  {section.label}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden='true'
                  />
                </button>

                {isOpen && (
                  <div className='absolute left-0 top-full z-50 min-w-[180px] border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-950'>
                    {section.links.map((link) => {
                      const linkActive = pathname.startsWith(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpenDesktop(null)}
                          className={`flex items-center gap-2.5 border-b border-slate-100 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors last:border-0 dark:border-slate-800 ${
                            linkActive
                              ? 'bg-untele text-white'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-untele dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-untele'
                          }`}
                        >
                          <span aria-hidden='true'>{link.icon}</span>
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Right controls ─────────────────────────────────────── */}
        <div className='ml-auto flex items-center gap-3'>
          <Link
            href='/'
            className='hidden text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-untele dark:text-slate-500 dark:hover:text-untele sm:block'
          >
            ← Site
          </Link>
          <button
            type='button'
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className='flex items-center p-1 text-slate-500 transition-colors hover:text-untele dark:text-slate-400 dark:hover:text-untele md:hidden'
          >
            {mobileOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
          </button>
          <UserButton />
        </div>
      </div>

      {/* ── Mobile accordion panel ─────────────────────────────── */}
      {mobileOpen && (
        <div
          className='border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:hidden'
          role='navigation'
          aria-label='Portal mobile navigation'
        >
          {/* Dashboard — top of mobile menu */}
          {!isSales && (
            <Link
              href='/portal'
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 border-b border-slate-100 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors dark:border-slate-800 ${
                isDashboard
                  ? 'bg-untele text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-untele dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-untele'
              }`}
            >
              <LayoutDashboard className='h-3.5 w-3.5' aria-hidden='true' />
              Dashboard
            </Link>
          )}

          {/* Sections */}
          {sections.map((section) => {
            const isExpanded = openMobileSection === section.id;
            const active = isSectionActive(section);

            return (
              <div key={section.id} className='border-b border-slate-100 dark:border-slate-800'>
                <button
                  type='button'
                  onClick={() => setOpenMobileSection(isExpanded ? null : section.id)}
                  aria-expanded={isExpanded}
                  className='flex w-full items-center justify-between px-4 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900'
                >
                  <div className='flex items-center gap-2.5'>
                    <span
                      className={active ? 'text-untele' : 'text-slate-400 dark:text-slate-500'}
                      aria-hidden='true'
                    >
                      {section.icon}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-widest ${
                        active ? 'text-untele' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {section.label}
                    </span>
                    {active && (
                      <span className='h-1.5 w-1.5 rounded-full bg-untele' aria-hidden='true' />
                    )}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-untele' : 'text-slate-400'
                    }`}
                    aria-hidden='true'
                  />
                </button>

                {isExpanded && (
                  <div className='bg-slate-50 dark:bg-slate-900/60'>
                    {section.links.map((link) => {
                      const linkActive = pathname.startsWith(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 border-t border-slate-100 px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors dark:border-slate-800 ${
                            linkActive
                              ? 'bg-untele text-white'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-untele dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-untele'
                          }`}
                        >
                          <span aria-hidden='true'>{link.icon}</span>
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Back to site — bottom of mobile menu */}
          <Link
            href='/'
            onClick={() => setMobileOpen(false)}
            className='flex items-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-untele dark:text-slate-500 dark:hover:text-untele'
          >
            ← Back to site
          </Link>
        </div>
      )}
    </header>
  );
}
