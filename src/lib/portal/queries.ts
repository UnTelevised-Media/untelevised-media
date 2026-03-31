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
  keywords
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
    status,
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
    faqs[]{ question, answer },
    reviewedBy->{ _id, name }
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
  *[_type == "author" && isActive == true] | order(name asc) {
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
