'use client';
// src/components/bookstore/WishlistButton.tsx
// Star-based wishlist toggle for book detail and book card overlays.
// Mirrors BookmarkButton.tsx using the useWishlist hook.

import { Star } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useConsentAwareTracking } from '@/components/analytics/ConsentAwareAnalytics';
import type { WishlistEntry } from '@/lib/wishlist/storage';

type WishlistButtonProps = Omit<WishlistEntry, 'addedAt'> & {
  className?: string;
  variant?: 'icon' | 'full';
};

export default function WishlistButton({
  slug,
  title,
  coverImageUrl,
  authorName,
  price,
  className = '',
  variant = 'icon',
}: WishlistButtonProps) {
  const { isWishlisted, toggle, ready } = useWishlist();
  const { trackEvent } = useConsentAwareTracking();
  const saved = isWishlisted(slug);

  const handleToggle = () => {
    toggle({ slug, title, coverImageUrl, authorName, price });
    trackEvent(saved ? 'remove_from_wishlist' : 'add_to_wishlist', {
      item_id: slug,
      item_name: title,
      price,
    });
  };

  if (!ready) {
    return (
      <button
        disabled
        aria-label='Save to wishlist'
        className={`flex items-center gap-1.5 rounded-lg border border-slate-300/50 bg-slate-200/30 p-2 text-slate-500 opacity-50 backdrop-blur-sm dark:border-slate-600/50 dark:bg-slate-800/30 ${className}`}
      >
        <Star className='h-4 w-4' />
        {variant === 'full' && (
          <span className='text-[10px] font-black uppercase tracking-widest'>Wishlist</span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={saved}
      type='button'
      className={`group flex items-center gap-1.5 rounded-lg border p-2 backdrop-blur-sm transition-all duration-200 ${
        saved
          ? 'border-amber-500/60 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 dark:bg-amber-500/20 dark:hover:bg-amber-500/30'
          : 'border-slate-300/50 bg-slate-200/30 text-slate-600 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-500 dark:border-slate-600/50 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:bg-amber-500/20'
      } ${className}`}
    >
      <Star
        className='h-4 w-4 transition-transform duration-200 group-hover:scale-110'
        fill={saved ? 'currentColor' : 'none'}
      />
      {variant === 'full' && (
        <span className='text-[10px] font-black uppercase tracking-widest'>
          {saved ? 'Wishlisted' : 'Wishlist'}
        </span>
      )}
    </button>
  );
}
