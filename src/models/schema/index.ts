// src/models/schemas/index.ts

import newsletterSubscribe from './newsletterSubscribe';

// Import UI/component schemas
import ctaButton from './buttons';

// Import embed schemas
import youtubeEmbed from './youtube';
import instagramEmbed from './instagram';
import twitterEmbed from './twitterX';
import contactSubmission from './contactSubmission';

// Export as array for Sanity config
export const schemaTypes = [
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
