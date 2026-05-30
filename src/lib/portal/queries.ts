// src/lib/portal/queries.ts
// GROQ queries for the Author Portal — server-only, used in Server Components and Actions.
// clerkId is intentionally excluded from all projections.
import { groq } from 'next-sanity';

// ---------------------------------------------------------------------------
// Article list — scoped by author ownership or role
// ---------------------------------------------------------------------------

/** All fields needed for the dashboard article card/row. */
const ARTICLE_LIST_PROJECTION = groq`{
  _id,
  // _originalId is injected by Sanity when perspective is 'previewDrafts'.
  // It holds the *actual* stored document ID — "drafts.xxx" when a draft was
  // served, or "xxx" when only a published document exists.  We use it for
  // all draft-detection logic and for write-client mutations so they always
  // target the correct Sanity document.
  _originalId,
  _createdAt,
  _updatedAt,
  title,
  slug,
  featured,
  breakingNews,
  needsReview,
  publishedAt,
  updatedAt,
  description,
  mainImage{ asset->{ url }, alt },
  "authorId": author._ref,
  author->{ _id, name, slug },
  categories[]->{ _id, title, slug },
  tags,
  keywords,
  deletionRequest{ reason, requestedAt, requestedByName, originalPublishedAt },
  "correctionType": correction.type,
  "reviewedById": reviewedBy._ref
}`;

/** Articles for an author — only their own documents. */
export const queryPortalArticlesByAuthor = groq`
  *[_type == "article" && author._ref == $sanityAuthorId]
  ${ARTICLE_LIST_PROJECTION}
  | order(_updatedAt desc)
`;

/** Articles for editors/admins — all documents. */
export const queryPortalAllArticles = groq`
  *[_type == "article"]
  ${ARTICLE_LIST_PROJECTION}
  | order(_updatedAt desc)
`;

// ---------------------------------------------------------------------------
// Single article — full fields for the editor
// ---------------------------------------------------------------------------

export const queryPortalArticleById = groq`
  *[_type == "article" && _id == $id][0]{
    _id,
    _originalId,
    _createdAt,
    _updatedAt,
    title,
    slug,
    featured,
    breakingNews,
    needsReview,
    publishedAt,
    updatedAt,
    description,
    leadParagraph,
    body,
    mainImage{ asset->{ _id, url }, alt },
    "authorId": author._ref,
    author->{ _id, name, slug },
    categories[]->{ _id, title, slug },
    tags,
    keywords,
    sources[]->{ _id, label, type, url, description, isAnonymous },
    relatedArticles[]->{ _id, title, slug },
    allowComments,
    methodology,
    location,
    hasEmbeddedVideo,
    videoLink,
    eventDate,
    faqs[]{ _key, question, answer },
    correction{ type, issuedAt, summary, detail },
    reviewedBy->{ _id, name },
    deletionRequest{ reason, requestedAt, requestedByName, originalPublishedAt },
    linkedPitch->{
      _id, headline, urgency, beat, angle, sourceSuggestions,
      links[]{ _key, label, url },
      notes
    }
  }
`;

// ---------------------------------------------------------------------------
// Categories and Authors (for dropdowns)
// ---------------------------------------------------------------------------

export const queryPortalCategories = groq`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug
  }
`;

export const queryPortalAuthors = groq`
  *[_type == "author" && isActive != false] | order(name asc) {
    _id,
    name,
    slug,
    image{ asset->{ url }, alt }
  }
`;

// ---------------------------------------------------------------------------
// Sources library
// ---------------------------------------------------------------------------

export const queryPortalSourcesByAuthor = groq`
  *[_type == "source" && $authorId in linkedAuthors] | order(_updatedAt desc) {
    _id,
    _createdAt,
    _updatedAt,
    label,
    type,
    url,
    description,
    isAnonymous,
    "linkedArticles": *[_type == "article" && references(^._id)]{ _id, title, slug }
  }
`;

export const queryPortalMyProfile = groq`
  *[_type == "author" && _id == $id][0]{
    _id,
    name,
    "slug": slug.current,
    title,
    bio,
    location,
    email,
    twitter,
    instagram,
    facebook,
    tiktok,
    youtube,
    linkedin,
    website,
    credentials,
    expertise,
    sameAs,
    image{ asset->{ _id, url }, alt }
  }
`;

export const queryPortalAllSources = groq`
  *[_type == "source"] | order(_updatedAt desc) {
    _id,
    _createdAt,
    _updatedAt,
    label,
    type,
    url,
    description,
    isAnonymous,
    "linkedArticles": *[_type == "article" && references(^._id)]{ _id, title, slug }
  }
`;

// ---------------------------------------------------------------------------
// Editor-only inbox queries
// ---------------------------------------------------------------------------

export const queryPortalJobApplications = groq`
  *[_type == "jobApplication"] | order(submittedAt desc) {
    _id,
    firstName,
    lastName,
    email,
    phone,
    location,
    positionsOfInterest,
    otherPosition,
    experienceLevel,
    experienceDescription,
    availability,
    applicationStatus,
    submittedAt,
    notes,
    portfolioWebsite,
    youtubeChannel,
    socialMediaPlatforms,
    socialMediaLinks,
    workSamples,
    additionalInfo
  }
`;

export const queryPortalContactSubmissions = groq`
  *[_type == "contactSubmission"] | order(submittedAt desc) {
    _id,
    name,
    email,
    message,
    submittedAt
  }
`;

export const queryPortalSecureContacts = groq`
  *[_type == "secureContact"] | order(submittedAt desc) {
    _id,
    name,
    email,
    phone,
    subject,
    message,
    urgency,
    contactMethod,
    isAnonymous,
    submittedAt,
    status
  }
`;

export const queryPortalWhistleblowers = groq`
  *[_type == "whistleblower"] | order(submittedAt desc) {
    _id,
    submissionId,
    title,
    description,
    organization,
    location,
    timeframe,
    category,
    severity,
    evidence,
    witnessInfo,
    contactInfo,
    isAnonymous,
    protectionNeeded,
    submittedAt,
    status,
    priority,
    notes
  }
`;

export const queryPortalNewsletterSubscribers = groq`
  *[_type == "newsletterSubscribe"] | order(submittedAt desc) {
    _id,
    email,
    firstName,
    status,
    source,
    submittedAt,
    confirmedAt
  }
`;

export const queryPortalBookstoreSubscribers = groq`
  *[_type == "bookstoreSubscriber"] | order(submittedAt desc) {
    _id,
    email,
    firstName,
    status,
    source,
    submittedAt,
    confirmedAt
  }
`;

// ---------------------------------------------------------------------------
// News Briefs
// ---------------------------------------------------------------------------

/** Minimal articles list for pitch "link article" dropdown. */
export const queryPortalArticlesTitles = groq`
  *[_type == "article"] | order(_updatedAt desc) {
    _id,
    title,
    "authorId": author._ref
  }
`;

/** Single brief by ID — same projection as latest brief. */
export const queryPortalBriefById = groq`
  *[_type == "brief" && _id == $briefId][0] {
    _id,
    title,
    publishedAt,
    period,
    summary,
    "storyPasses": storyPasses[] {
      _key,
      storyKey,
      "authorId": author._ref,
      passedAt
    },
    stories[] {
      _key,
      headline,
      angle,
      beat,
      urgency,
      sourceSuggestions,
      links[] { _key, label, url },
      status,
      claimedBy->{ _id, name, "slug": slug.current },
      claimedAt,
      linkedArticle->{ _id, title, "slug": slug.current }
    }
  }
`;

/** Latest brief for the dashboard panel. */
export const queryPortalLatestBrief = groq`
  *[_type == "brief"] | order(_createdAt desc)[0] {
    _id,
    title,
    publishedAt,
    period,
    summary,
    "storyPasses": storyPasses[] {
      _key,
      storyKey,
      "authorId": author._ref,
      passedAt
    },
    stories[] {
      _key,
      headline,
      angle,
      beat,
      urgency,
      sourceSuggestions,
      links[] { _key, label, url },
      status,
      claimedBy->{ _id, name, "slug": slug.current },
      claimedAt,
      linkedArticle->{ _id, title, "slug": slug.current }
    }
  }
`;

/** All briefs for a full archive view. */
export const queryPortalAllBriefs = groq`
  *[_type == "brief"] | order(_createdAt desc) {
    _id,
    title,
    publishedAt,
    period,
    "storyCount": count(stories),
    "unclaimedCount": count(stories[status == "unclaimed"])
  }
`;

// ---------------------------------------------------------------------------
// Claimed pitches
// ---------------------------------------------------------------------------

/** All claimed pitches for the current author. */
export const queryPortalMyClaimedPitches = groq`
  *[_type == "claimedPitch" && author._ref == $authorId] | order(claimedAt desc) {
    _id,
    headline,
    beat,
    urgency,
    status,
    briefId,
    briefTitle,
    storyKey,
    claimedAt,
    linkedArticle->{ _id, title, "slug": slug.current }
  }
`;

/** Claimed pitches for the current author scoped to a specific brief (for the dashboard map). */
export const queryPortalMyPitchesForBrief = groq`
  *[_type == "claimedPitch" && author._ref == $authorId && briefId == $briefId]
    | order(_createdAt desc) {
    _id,
    storyKey
  }
`;

/** All claimed pitches — for editors to see the full newsroom view. */
export const queryPortalAllClaimedPitches = groq`
  *[_type == "claimedPitch"] | order(claimedAt desc) {
    _id,
    headline,
    beat,
    urgency,
    status,
    briefId,
    briefTitle,
    storyKey,
    claimedAt,
    author->{ _id, name },
    linkedArticle->{ _id, title, "slug": slug.current }
  }
`;

/** Full pitch detail for the notes page. */
export const queryPortalClaimedPitchById = groq`
  *[_type == "claimedPitch" && _id == $id][0] {
    _id,
    headline,
    angle,
    beat,
    urgency,
    sourceSuggestions,
    links[] { _key, label, url },
    briefId,
    briefTitle,
    storyKey,
    claimedAt,
    status,
    notes,
    author->{ _id, name },
    assignedBy->{ _id, name },
    linkedArticle->{ _id, title, "slug": slug.current }
  }
`;

// ---------------------------------------------------------------------------
// Book reviews — admin moderation queue
// ---------------------------------------------------------------------------

export const queryPortalAllReviews = groq`
  *[_type == "bookReview"] | order(submittedAt desc) {
    _id,
    reviewerName,
    reviewerLocation,
    rating,
    body,
    status,
    clerkUserId,
    adminFeedback,
    submittedAt,
    "bookTitle": book->title,
    "bookSlug": book->slug.current
  }
`;

export const queryPortalMyAuthorFlags = groq`
  *[_type == "author" && clerkId == $clerkId][0] {
    isLiteraryAuthor
  }
`;
