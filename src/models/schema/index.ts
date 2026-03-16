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
import seoObject from './seoObject';
import siteSettings from './siteSettings';

// Timeline schemas
import timeline from './timeline';
import timelineEvent from './timelineEvent';
import timelineCategory from './timelineCategory';

// Music/lyrics schemas
import musicArtist from './musicArtist';
import album from './album';
import song from './song';

// Form/contact schemas
import contactSubmission from './contactSubmission';
import jobApplication from './jobApplication';
import newsletterSubscribe from './newsletterSubscribe';
import secureContact from './secureContact';
import whistleblower from './whistleblower';

// UI/component schemas
import ctaButton from './buttons';
import correctionObject from './correction';

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
  seoObject,
  siteSettings,

  // Timeline schemas
  timeline,
  timelineEvent,
  timelineCategory,

  // Music/lyrics schemas
  musicArtist,
  album,
  song,

  // Form/contact schemas
  contactSubmission,
  jobApplication,
  newsletterSubscribe,
  secureContact,
  whistleblower,

  // UI/component schemas
  ctaButton,

  // Embed schemas
  instagramEmbed,
  twitterEmbed,
  youtubeEmbed,

  // Shared object schemas
  correctionObject,

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
  seoObject,
  siteSettings,

  // Timeline schemas
  timeline,
  timelineEvent,
  timelineCategory,

  // Music/lyrics schemas
  musicArtist,
  album,
  song,

  // Form/contact schemas
  contactSubmission,
  jobApplication,
  newsletterSubscribe,
  secureContact,
  whistleblower,

  // UI/component schemas
  ctaButton,

  // Embed schemas
  instagramEmbed,
  twitterEmbed,
  youtubeEmbed,

  // Shared object schemas
  correctionObject,

  // Add your new schemas here
  // newContentSchema,
  // newFormSchema,
  // newUiSchema,
  // newEmbedSchema,
};

// Export default for convenience
export default schemaTypes;
