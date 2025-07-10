// src/models/schema/index.ts

import newsletterSubscribe from './newsletterSubscribe';

// Import UI/component schemas
import ctaButton from './buttons';

// Import content schemas
import article from './article';
import blockContent from './blockContent';
import videoContent from './videoContent';

// Import embed schemas
import youtubeEmbed from './youtube';
import instagramEmbed from './instagram';
import twitterEmbed from './twitterX';
import contactSubmission from './contactSubmission';

// Export as array for Sanity config
export const schemaTypes = [
  // Content schemas
  article,
  blockContent,
  videoContent,

  // Form/contact schemas
  contactSubmission,
  newsletterSubscribe,

  // UI/component schemas
  ctaButton,

  // Embed schemas
  youtubeEmbed,
  instagramEmbed,
  twitterEmbed,
];

// Export individual schemas for type safety
export {
  // Content schemas
  article,
  blockContent,
  videoContent,

  // Form/contact schemas
  contactSubmission,
  newsletterSubscribe,

  // UI/component schemas
  ctaButton,

  // Embed schemas
  youtubeEmbed,
  instagramEmbed,
  twitterEmbed,
};

// Export default for convenience
export default schemaTypes;
