// src/models/schema/index.ts

// Content schemas
import article from './article';
import author from './author';
import blockContent from './blockContent';
import category from './category';
import comments from './comments';
import eventTag from './eventTag';
import keyEvent from './keyEvent';
import liveEvent from './liveEvent';
import policies from './policies';
import post from './post';
import videoContent from './videoContent';

// Form/contact schemas
import contactSubmission from './contactSubmission';
import newsletterSubscribe from './newsletterSubscribe';
import secureContact from './secureContact';
import whistleblower from './whistleblower';

// UI/component schemas
import ctaButton from './buttons';

// Embed schemas
import instagramEmbed from './instagram';
import twitterEmbed from './twitterX';
import youtubeEmbed from './youtube';

// Add your new schemas below, organized into the appropriate sections
// Example:
// import newContentSchema from './newContentSchema';
// import newFormSchema from './newFormSchema';
// import newUiSchema from './newUiSchema';
// import newEmbedSchema from './newEmbedSchema';

// Export as array for Sanity config
export const schemaTypes = [
  // Content schemas
  article,
  author,
  blockContent,
  category,
  comments,
  eventTag,
  keyEvent,
  liveEvent,
  policies,
  post,
  videoContent,

  // Form/contact schemas
  contactSubmission,
  newsletterSubscribe,
  secureContact,
  whistleblower,

  // UI/component schemas
  ctaButton,

  // Embed schemas
  instagramEmbed,
  twitterEmbed,
  youtubeEmbed,

  // Add your new schemas here, grouped accordingly
  // newContentSchema,
  // newFormSchema,
  // newUiSchema,
  // newEmbedSchema,
];

// Export individual schemas for type safety
export {
  // Content schemas
  article,
  author,
  blockContent,
  category,
  comments,
  eventTag,
  keyEvent,
  liveEvent,
  policies,
  post,
  videoContent,

  // Form/contact schemas
  contactSubmission,
  newsletterSubscribe,
  secureContact,
  whistleblower,

  // UI/component schemas
  ctaButton,

  // Embed schemas
  instagramEmbed,
  twitterEmbed,
  youtubeEmbed,

  // Add your new schemas here
  // newContentSchema,
  // newFormSchema,
  // newUiSchema,
  // newEmbedSchema,
};

// Export default for convenience
export default schemaTypes;
