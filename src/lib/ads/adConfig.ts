// Ad configuration for optimal performance and user experience
const AD_CONFIG = {
  // AdSense Publisher ID — sourced from NEXT_PUBLIC_GAS_ID env var
  PUBLISHER_ID: process.env.NEXT_PUBLIC_GAS_ID ?? '',

  // Ad slot IDs for different placements.
  // All IDs must be verified in the AdSense account dashboard before going live.
  AD_SLOTS: {
    // Homepage ads
    HOMEPAGE_SIDEBAR: '3380975563',
    HOMEPAGE_BANNER: '2475351335',

    // Article page ads
    ARTICLE_TOP: '2438309423',
    ARTICLE_BOTTOM: '8849187990',
    ARTICLE_RECTANGLE: '8437036676', // rectangle below social share bar
    ARTICLE_BANNER_BOTTOM: '7939310826', // leaderboard after article body

    // Feed ads
    IN_FEED: '3403906737',
    FEED_PAGINATION: '3403906737',

    // Category page ads
    CATEGORY_BANNER: '8209510850',
  },

  // Performance optimization settings
  PERFORMANCE: {
    // Lazy load ads when they're within this distance from viewport
    LAZY_LOAD_MARGIN: '200px',

    // Maximum number of ads per page to avoid overwhelming users
    MAX_ADS_PER_PAGE: 6,

    // Minimum spacing between ads (in pixels)
    MIN_AD_SPACING: 800,

    // Delay before loading ads (in milliseconds)
    LOAD_DELAY: 100,
  },

  // Responsive breakpoints
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200,
  },

  // Ad visibility settings for different screen sizes
  VISIBILITY: {
    MOBILE: {
      hideInFeed: false,
      hideSidebar: true,
      maxAdsPerPage: 3,
    },
    TABLET: {
      hideInFeed: false,
      hideSidebar: false,
      maxAdsPerPage: 4,
    },
    DESKTOP: {
      hideInFeed: false,
      hideSidebar: false,
      maxAdsPerPage: 6,
    },
  },

  // Content integration settings
  INTEGRATION: {
    // Show "Advertisement" label
    showAdLabel: true,

    // Blend with site design
    useCustomStyling: true,

    // Respect user preferences
    respectDoNotTrack: true,
  },
};

export default AD_CONFIG;
export { AD_CONFIG };
