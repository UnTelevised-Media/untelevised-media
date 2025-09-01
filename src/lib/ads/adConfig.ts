// Ad configuration for optimal performance and user experience
const AD_CONFIG = {
  // AdSense Publisher ID
  PUBLISHER_ID: 'ca-pub-7412827340538951',

  // Ad slot IDs for different placements
  AD_SLOTS: {
    // Homepage ads
    HOMEPAGE_SIDEBAR: '9876543210',
    HOMEPAGE_BANNER: '0987654321',

    // Article page ads
    ARTICLE_TOP: '2468135790',
    ARTICLE_BOTTOM: '1357924680',

    // Feed ads
    IN_FEED: '1234567890',
    FEED_PAGINATION: '0987654321',

    // Category page ads
    CATEGORY_BANNER: '5432167890',

    // Fallback/test slots
    TEST_BANNER: '3940256099',
    TEST_RECTANGLE: '6300978111',
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
