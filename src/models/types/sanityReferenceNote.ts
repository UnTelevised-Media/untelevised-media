/**
 * SANITY REFERENCE TYPE MISMATCH DOCUMENTATION
 *
 * When GROQ queries dereference relationships with -> (e.g., author->),
 * the runtime returns the fully populated object with all fields.
 *
 * However, Sanity's auto-generated TypeScript types (from typegen) define
 * the field as a reference type (only _ref, _type), not the expanded object.
 *
 * This creates a type mismatch:
 * - Runtime: article.author is { _id, name, slug, image, ... }
 * - TypeScript: article.author is AuthorReference { _ref, _type }
 *
 * Solution: Use `as any` casts when accessing dereferenced properties,
 * with a JSDoc comment explaining why it's necessary.
 *
 * Example:
 *
 * ```typescript
 * // Query: author->{ name, slug, image }
 * // At runtime, article.author IS the full Author object
 * // TypeScript sees it as AuthorReference (only _ref, _type)
 * const authorName = (article.author as any)?.name ?? 'Unknown';
 * ```
 *
 * This is not a code smell—it's a necessary bridge between:
 * 1. Runtime reality: GROQ returns populated objects
 * 2. TypeScript types: Generated from schema, not query logic
 *
 * Future improvement: Use a custom type generator that tracks GROQ
 * transformations to eliminate these casts.
 */

export type SanityReference = {
  _ref: string;
  _type: string;
};

// Marker type for documented casts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PopulatedSanityReference<T = any> = T & SanityReference;
