// src/components/global/Header.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Bookmark } from 'lucide-react';
import { Show, UserButton } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import Socials from './Socials';
import ThemeToggle from './ThemeToggle';
import { Flame, Radio, Music, BookOpen } from 'lucide-react';

const HeaderSearch = dynamic(() => import('./HeaderSearch'), { ssr: false });
const MiniCart = dynamic(() => import('@/components/bookstore/MiniCart'), { ssr: false });

// ── Typed nav items ────────────────────────────────────────────────────────────

type SpecialLink = {
  kind: 'special';
  href: string;
  label: string;
  icon: React.ReactNode;
  color: string;       // text color class
  hover: string;       // hover bg class
  external?: boolean;
};

type PlainLink = {
  kind: 'plain';
  href: string;
  label: string;
};

type NavItem = SpecialLink | PlainLink;

const NAV: NavItem[] = [
  {
    kind: 'special',
    href: '/breaking',
    label: 'Breaking News',
    icon: <Flame className='h-3.5 w-3.5 animate-pulse' />,
    color: 'text-untele',
    hover: 'hover:bg-red-50 dark:hover:bg-red-950/40',
  },
  {
    kind: 'special',
    href: 'https://untelevised.live',
    label: 'Live Coverage',
    icon: <Radio className='h-3.5 w-3.5 animate-pulse' />,
    color: 'text-green-600 dark:text-green-400',
    hover: 'hover:bg-green-50 dark:hover:bg-green-950/40',
    external: true,
  },
  {
    kind: 'special',
    href: '/bookstore',
    label: 'Bookstore',
    icon: <BookOpen className='h-3.5 w-3.5' />,
    color: 'text-amber-600 dark:text-amber-400',
    hover: 'hover:bg-amber-50 dark:hover:bg-amber-950/40',
  },
  {
    kind: 'special',
    href: 'https://radio.untelevised.live',
    label: 'Radio',
    icon: <Music className='h-3.5 w-3.5 animate-pulse' />,
    color: 'text-blue-600 dark:text-blue-400',
    hover: 'hover:bg-blue-50 dark:hover:bg-blue-950/40',
    external: true,
  },
  { kind: 'plain', href: '/', label: 'Home' },
  { kind: 'plain', href: '/archive', label: 'News Archive' },
  { kind: 'plain', href: '/fact-checks', label: 'Fact Check' },
  { kind: 'plain', href: '/lyrics', label: 'Music' },
  { kind: 'plain', href: '/about', label: 'Mission' },
  { kind: 'plain', href: '/staff', label: 'Our Team' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function DesktopSpecialLink({ item }: { item: SpecialLink }) {
  return (
    <Link
      href={item.href}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener noreferrer' : undefined}
      className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 transition-colors duration-150 ${item.color} ${item.hover}`}
    >
      {item.icon}
      <span className='text-sm font-semibold'>{item.label}</span>
    </Link>
  );
}

function DesktopPlainLink({ item }: { item: PlainLink }) {
  return (
    <Link
      href={item.href}
      className='group relative px-3 text-sm font-medium text-slate-700 transition-colors duration-150 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
    >
      {item.label}
      <span className='absolute -bottom-0.5 left-0 h-px w-0 bg-untele transition-all duration-200 group-hover:w-full' />
    </Link>
  );
}

function MobileSpecialLink({
  item,
  onClose,
}: {
  item: SpecialLink;
  onClose: () => void;
}) {
  return (
    <Link
      href={item.href}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener noreferrer' : undefined}
      onClick={onClose}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 ${item.color} ${item.hover}`}
    >
      <span className='shrink-0'>{item.icon}</span>
      <span className='text-sm font-semibold'>{item.label}</span>
      {item.external && (
        <span className='ml-auto text-[10px] font-bold uppercase tracking-widest opacity-50'>
          ↗
        </span>
      )}
    </Link>
  );
}

function MobilePlainLink({
  item,
  onClose,
}: {
  item: PlainLink;
  onClose: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
    >
      <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-untele' />
      {item.label}
    </Link>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

const Header = ({ logoSlot }: { logoSlot: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setIsScrolled(window.scrollY > 20));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const closeMenu = () => setIsMenuOpen(false);
  const specialItems = NAV.filter((n): n is SpecialLink => n.kind === 'special');
  const plainItems = NAV.filter((n): n is PlainLink => n.kind === 'plain');

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'border-b border-untele/20 bg-slate-100/98 shadow-2xl backdrop-blur-md dark:bg-slate-900/98'
          : 'border-b-2 border-untele/30 bg-slate-100/95 shadow-lg backdrop-blur-md dark:bg-slate-900/95'
      }`}
    >
      {/* ── Main bar ── */}
      <div className='flex w-full items-center justify-between px-4 py-2 md:py-3 lg:px-8'>

        {/* Logo */}
        {logoSlot}

        {/* Desktop nav */}
        <nav className='hidden items-center gap-1 lg:flex' aria-label='Main navigation'>
          {NAV.map((item) =>
            item.kind === 'special' ? (
              <DesktopSpecialLink key={item.href} item={item} />
            ) : (
              <React.Fragment key={item.href}>
                {/* divider before plain links group */}
                {item === plainItems[0] && (
                  <span className='mx-1 h-4 w-px bg-slate-300 dark:bg-slate-700' />
                )}
                <DesktopPlainLink item={item} />
              </React.Fragment>
            )
          )}
        </nav>

        {/* Right section */}
        <div className='flex items-center gap-1 md:gap-2'>
          {/* Search */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className='rounded-lg p-1.5 text-slate-700 transition-colors hover:bg-slate-200/50 hover:text-untele dark:text-slate-200 dark:hover:bg-slate-800/50 md:p-2'
            aria-label='Search articles'
          >
            <MagnifyingGlassIcon className='h-4 w-4 md:h-5 md:w-5' />
          </button>

          {/* Reading list */}
          <Link
            href='/reading-list'
            className='rounded-lg p-1.5 text-slate-700 transition-colors hover:bg-slate-200/50 hover:text-untele dark:text-slate-200 dark:hover:bg-slate-800/50 md:p-2'
            aria-label='Reading list'
          >
            <Bookmark className='h-4 w-4 md:h-5 md:w-5' />
          </Link>

          {/* Shopping cart */}
          <MiniCart />

          {/* Theme toggle — desktop only */}
          <div className='hidden md:flex'>
            <ThemeToggle />
          </div>

          {/* User account */}
          <Show when='signed-in'>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8',
                  userButtonPopoverCard:
                    'shadow-xl border border-slate-200 dark:border-slate-700',
                },
              }}
            />
          </Show>
          <Show when='signed-out'>
            <Link
              href='/sign-in'
              className='hidden text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-untele dark:text-slate-400 md:block'
            >
              Sign In
            </Link>
          </Show>

          {/* Support */}
          <Link
            href='/donate'
            className='hidden items-center gap-1.5 bg-gradient-to-r from-untele to-red-500 px-3 py-1.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg md:flex md:px-4 md:py-2'
          >
            <span>Support</span>
            <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-white/80' />
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className='rounded-lg p-1.5 text-slate-700 transition-colors hover:bg-slate-200/50 hover:text-untele dark:text-slate-200 dark:hover:bg-slate-800/50 md:p-2 lg:hidden'
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <XMarkIcon className='h-5 w-5 md:h-6 md:w-6' />
            ) : (
              <Bars3Icon className='h-5 w-5 md:h-6 md:w-6' />
            )}
          </button>

          {/* Socials — desktop only */}
          <div className='hidden lg:flex'>
            <Socials />
          </div>
        </div>
      </div>

      {/* ── Algolia search bar ── */}
      {isSearchOpen && (
        <div className='border-t border-slate-300 bg-gradient-to-r from-slate-100 to-slate-200 p-6 backdrop-blur-md dark:border-slate-700 dark:from-slate-900 dark:to-slate-800'>
          <HeaderSearch onClose={() => setIsSearchOpen(false)} />
        </div>
      )}

      {/* ── Mobile menu ── */}
      {isMenuOpen && (
        <div className='border-t border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900 lg:hidden'>
          <div className='flex flex-col p-4'>

            {/* Featured links */}
            <p className='mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400'>
              Coverage
            </p>
            <div className='mb-4 flex flex-col gap-1'>
              {specialItems.map((item) => (
                <MobileSpecialLink key={item.href} item={item} onClose={closeMenu} />
              ))}
            </div>

            {/* Standard links */}
            <p className='mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400'>
              More
            </p>
            <div className='mb-4 flex flex-col gap-1'>
              <MobilePlainLink
                item={{ kind: 'plain', href: '/', label: 'Home' }}
                onClose={closeMenu}
              />
              {plainItems.map((item) => (
                <MobilePlainLink key={item.href} item={item} onClose={closeMenu} />
              ))}
            </div>

            {/* Footer row */}
            <div className='mt-2 border-t border-slate-200 pt-4 dark:border-slate-800'>
              <div className='mb-4 flex items-center justify-between px-1'>
                <span className='text-xs font-bold uppercase tracking-widest text-slate-500'>
                  Theme
                </span>
                <ThemeToggle />
              </div>

              <Link
                href='/donate'
                onClick={closeMenu}
                className='mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-untele to-red-500 px-6 py-3 text-sm font-bold text-white shadow-md'
              >
                <span>Support Independent Journalism</span>
                <span className='h-2 w-2 animate-pulse rounded-full bg-white/80' />
              </Link>

              <div className='flex justify-center'>
                <Socials />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
