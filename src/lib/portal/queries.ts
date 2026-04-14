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
  _createdAt,
  _updatedAt,
  title,
  slug,
  status,
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
  mainImage{ asset->{ url }, alt },
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
    deletionRequest{ reason, requestedAt, requestedByName, originalPublishedAt }
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
    submittedAt
  }
`;
