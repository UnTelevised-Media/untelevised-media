// src/models/schema/index.ts

// Bookstore schemas
import book, { bookFormat } from './book';
import bookGenre from './bookGenre';
import bookstoreSubscriber from './bookstoreSubscriber';
import userWishlist from './userWishlist';
import bookReview from './bookReview';

// Content schemas
import article from './article';
import brief from './brief';
import claimedPitch from './claimedPitch';
import author from './author';
import factCheck from './factCheck';
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

// User data schemas
import userBookmark from './userBookmark';

// Form/contact schemas
import contactSubmission from './contactSubmission';
import jobApplication from './jobApplication';
import jobListing from './jobListing';
import newsletterSubscribe from './newsletterSubscribe';
import secureContact from './secureContact';
import whistleblower from './whistleblower';

// UI/component schemas
import ctaButton from './buttons';
import correctionObject from './correction';
import source from './source';

// Embed schemas
import instagramEmbed from './instagram';
import twitterEmbed from './twitterX';
import youtubeEmbed from './youtube';
import facebookEmbed from './facebook';
import tiktokEmbed from './tiktok';
import vimeoEmbed from './vimeo';

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
  brief,
  claimedPitch,
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
  jobListing,
  newsletterSubscribe,
  secureContact,
  whistleblower,

  // UI/component schemas
  ctaButton,

  // Embed schemas
  instagramEmbed,
  twitterEmbed,
  youtubeEmbed,
  facebookEmbed,
  tiktokEmbed,
  vimeoEmbed,

  // Shared object schemas
  correctionObject,

  // Credibility schemas
  source,
  factCheck,

  // User data schemas
  userBookmark,

  // Bookstore schemas
  bookGenre,
  book,
  bookFormat,
  bookstoreSubscriber,
  userWishlist,
  bookReview,
];

// Export individual schemas for type safety
export {
  // Content schemas
  article,
  brief,
  claimedPitch,
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
  jobListing,
  newsletterSubscribe,
  secureContact,
  whistleblower,

  // UI/component schemas
  ctaButton,

  // Embed schemas
  instagramEmbed,
  twitterEmbed,
  youtubeEmbed,
  facebookEmbed,
  tiktokEmbed,
  vimeoEmbed,

  // Shared object schemas
  correctionObject,

  // Credibility schemas
  source,
  factCheck,

  // User data schemas
  userBookmark,

  // Bookstore schemas
  bookGenre,
  book,
  bookFormat,
  bookstoreSubscriber,
  userWishlist,
  bookReview,
};

// Export default for convenience
export default schemaTypes;
