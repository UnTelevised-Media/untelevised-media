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
import author from './author';
import category from './category';
import comments from './comments';
import liveEvent from './liveEvent';
import keyEvent from './keyEvent';
import eventTag from './eventTag';
import policies from './policies';
import post from './post';


// Export as array for Sanity config
export const schemaTypes = [
  // Content schemas
  article,
  blockContent,
  videoContent,
  author,
  category,
  comments,
  liveEvent,
  keyEvent,
  eventTag,
  post,
  // Form/contact schemas
  contactSubmission,
  newsletterSubscribe,

  // UI/component schemas
  ctaButton,
  policies,
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
  author,
  category,
  comments,
  liveEvent,
  keyEvent,
  eventTag,
  post,

  // Form/contact schemas
  contactSubmission,
  newsletterSubscribe,

  // UI/component schemas
  ctaButton,
  policies,
  // Embed schemas
  youtubeEmbed,
  instagramEmbed,
  twitterEmbed,
};

// Export default for convenience
export default schemaTypes;
