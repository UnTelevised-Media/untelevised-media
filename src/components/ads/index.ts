// Export all ad components for easy importing
export { default as BannerAd } from './BannerAd';
export { default as RectangleAd } from './RectangleAd';
export { default as InFeedAd } from './InFeedAd';
export { default as SidebarAd } from './SidebarAd';
export { default as ResponsiveAdWrapper } from './ResponsiveAdWrapper';
export { default as AdManager, useAdContext } from './AdManager';

// Re-export the existing LargeAdCard for backward compatibility
export { default as LargeAdCard } from '../googleAds/LargeAdCard';

// Export ad configuration
export { default as AD_CONFIG } from '@/lib/ads/adConfig';
