// src/components/global/BreakingNewsBanner.tsx
// Server component — fetches siteSettings and guards rendering

import { sanityFetch } from '@/lib/sanity/lib/fetch';
import { querySiteSettings } from '@/lib/sanity/lib/queries';
import { BreakingNewsBannerClient } from './BreakingNewsBannerClient';

interface BannerData {
  isActive: boolean;
  headline: string;
  linkUrl: string;
  linkLabel: string;
  expiresAt?: string;
}

interface SiteSettings {
  breakingBanner?: BannerData;
}

export async function BreakingNewsBanner() {
  let settings: SiteSettings | null = null;
  try {
    const { data } = await sanityFetch({
      query: querySiteSettings,
      tags: ['siteSettings'],
    });
    settings = data as SiteSettings;
  } catch (err) {
    console.error('[BreakingNewsBanner] sanityFetch failed:', err);
    return null;
  }

  const banner: BannerData | null = settings?.breakingBanner ?? null;

  if (!banner?.isActive || !banner.headline) return null;

  // Server-side expiry check — avoids rendering stale banner HTML
  if (banner.expiresAt && new Date(banner.expiresAt) < new Date()) {
    return null;
  }

  return (
    <BreakingNewsBannerClient
      headline={banner.headline}
      linkUrl={banner.linkUrl}
      linkLabel={banner.linkLabel ?? 'Read More'}
      expiresAt={banner.expiresAt}
    />
  );
}
