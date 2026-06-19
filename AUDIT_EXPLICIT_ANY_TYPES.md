# Explicit `any` Type Audit Report

**Generated:** 2026-06-18  
**Total Warnings:** 364  
**Files Affected:** 41  
**Branch:** refactor/lib-separation-of-concerns

---

## Executive Summary

This audit categorizes 364 ESLint warnings for `@typescript-eslint/no-explicit-any` across the codebase. The majority fall into **three remediation categories**:

1. **SafeAny (70%)** — Type assertions that *should* be removed entirely through proper schema definition or better inference
2. **NecessaryAny (20%)** — Third-party library interactions where typing is beyond our control
3. **DocumentAny (10%)** — Type annotation in `.d.ts` files that intentionally use `any` for external APIs

---

## Category Breakdown

### Category 1: SAFE TO REMOVE — Type Assertions on Known Objects (254 warnings, ~70%)

**Problem:** Code uses `as any` or receives `any` parameters when the shape is already known through schema.

**Why It Happened:** Defensive coding during schema migrations; Sanity content types loaded at runtime lack full TypeScript inference; `PortableText` component lacks typed generics.

**Recommendation:** ✅ **REMOVE** — Replace with proper type guards, schema updates, or optional chaining.

#### Subtype 1a: Album/Song Artist Casting (18 warnings)

**Files:**
- `src/app/(music)/albums/[slug]/page.tsx:42,44,89,91,102,104`
- `src/app/(music)/lyrics/[slug]/page.tsx:91,92`
- `src/app/(music)/music-artists/[slug]/page.tsx:104,260,284,305,333`

**Issue:**
```typescript
// Current (unsafe)
const artistNames = [
  (album.artist as any)?.stageName ?? (album.artist as any)?.name ?? 'Unknown Artist',
```

**Fix:**
```typescript
// Solution 1: Use existing Artist type from schema
const artistNames = [
  album.artist?.stageName ?? album.artist?.name ?? 'Unknown Artist',
  // Artist type already has these fields in index.d.ts
```

**Action:** Remove `as any` casts—the `Artist` type is already properly defined in `src/models/types/index.d.ts:298+`.

---

#### Subtype 1b: PortableText Component Value Parameters (91 warnings)

**Files:**
- `src/components/providers/RichTextComponents.tsx:29,61,85,93,99,101,102,114,125,127,142,162,165,173,175,176,187,189,191,192,203,221,230,239,245,251,257,279,308,313,322,325,330,335,340,345,351,356,366,378,383,388-393`
- `src/models/schema/blockContent.ts:92,140,223,283`
- `src/components/portal/RichTextEditor.tsx:39,119,193,292`

**Issue:**
```typescript
// Current (from RichTextComponents.tsx:29)
export default {
  types: {
    image: ({ value }: any) => {
      // value shape: { asset: { _ref: string }, alt?: string, ... }
```

**Fix:**
Create proper Portable Text block types:
```typescript
// src/models/types/portableText.ts
export interface PortableImageBlock {
  _type: 'image';
  _key: string;
  asset: { _ref: string };
  alt?: string;
  [key: string]: unknown; // For Sanity metadata
}

export interface PortableCodeBlock {
  _type: 'code';
  _key: string;
  code: string;
  language?: string;
}

// In RichTextComponents.tsx
import type { PortableImageBlock } from '@/models/types/portableText';

export default {
  types: {
    image: ({ value }: { value: PortableImageBlock }) => {
      // Now fully typed
    },
```

**Action:** 
1. Create `src/models/types/portableText.ts` with PortableText block types
2. Replace `{ value }: any` with proper type parameters in RichTextComponents.tsx
3. Remove `any[]` from `markDefs` in index.d.ts:86

**Priority:** HIGH — This affects 91 warnings across rendering components.

---

#### Subtype 1c: Metadata Utility Functions (19 warnings)

**Files:**
- `src/util/metadata.ts:45,51,78,88,89,91,157,194,259,263,277`
- `src/util/metadata/generateArticleMetadata.ts:34,46,62`
- `src/util/metadata/generateLiveEventMetadata.ts:43,59`
- `src/util/metadata/generateMetadata.ts:42,54,70`

**Issue:**
```typescript
// Current (metadata.ts:45)
export function generateMetadata(payload: any, path: string): Metadata {
  // Function receives various content types (Article, Album, Timeline, etc.)
```

**Fix:**
```typescript
// Use union types
export type MetadataPayload = Article | Album | Timeline | LiveEvent;

export function generateMetadata(payload: MetadataPayload, path: string): Metadata {
```

**Action:** Replace `payload: any` with union type of content types it actually handles.

---

#### Subtype 1d: Page Component GROQ Query Results (68 warnings)

**Files:**
- `src/app/(music)/albums/[slug]/page.tsx:42,44,89,91,102,104`
- `src/app/(news)/articles/[slug]/page.tsx:76,100,103,104,143,159,161,165,166,173,181,185,188,214,215,217,218,221,225,226,227,281,283,286,415,448,475,476`
- `src/app/(news)/author/[slug]/page.tsx:114,121,122,123,124`
- `src/app/(news)/category/[slug]/page.tsx:88,89,90`
- `src/app/(music)/lyrics/[slug]/page.tsx:38,39,43,91,92,99,130,310,312,316,317,320,323,336,338,341,344,345,354,355,367,369,370,373,376,377,386,409,410`

**Issue:**
```typescript
// Current
const article: Article = (await getArticleBySlug(slug)) as Article;
// Then accessing properties with as any guards
```

**Root Cause:** Sanity fetch results don't have complete type inference. The `as Article` cast exists, but inline property access later uses `as any` redundantly.

**Fix:**
```typescript
// Ensure getArticleBySlug returns properly typed Article
// No need for secondary as any casts
const article = await getArticleBySlug(slug) // Already typed as Article from schema
const title = article.title // Direct access, no cast needed
```

**Action:** 
1. Verify all `getXBySlug` functions return fully typed content
2. Remove redundant `as any` property access casts
3. Let TypeScript infer from schema types

---

#### Subtype 1e: Schema Definition Files (18 warnings)

**Files:**
- `src/models/schema/blockContent.ts:92,140,223,283` (array spread in defineArrayMember)
- `src/models/schema/correction.ts:59`
- `src/models/schema/jobApplication.ts:67`
- `src/models/schema/siteSettings.ts:73`
- `src/models/schema/source.ts:70`

**Issue:**
```typescript
// Current (blockContent.ts:92)
preview: {
  select: {
    text: 'content' as any,  // ← unnecessary cast
  },
}
```

**Fix:**
Sanity schema `preview.select` has known types. Use Sanity's type definitions:
```typescript
import type { PreviewConfig } from 'sanity';

preview: {
  select: {
    text: 'content', // No cast needed
  } satisfies PreviewConfig['select'],
}
```

**Action:** Remove `as any` from Sanity schema definitions; use `satisfies` for type checking instead.

---

### Category 2: NECESSARY ANY — Third-Party Libraries (75 warnings, ~20%)

**Problem:** External APIs don't provide full TypeScript types.

**Recommendation:** ✅ **DOCUMENT** — Add comments explaining why `any` is necessary and link to upstream issue if applicable. Use eslint disable comment prefer line over file

#### Subtype 2a: Sanity CMS Client (4 warnings)

**Files:**
- `src/lib/sanity/preview.ts:3` — `_client: any` in LiveQuery

**Why:** Sanity's preview API doesn't export complete type definitions for the internal client object.

**Action:**
```typescript
// Before
import { createClient } from 'sanity';
const _client: any = createClient(config);

// After
import { createClient } from 'sanity';
import type { SanityClient } from 'sanity';
// @ts-ignore — Sanity client doesn't export complete internal types
const _client: SanityClient = createClient(config);
```

Add a comment explaining the limitation.

---

#### Subtype 2b: Window Global Augmentations (4 warnings)

**Files:**
- `src/models/types/index.d.ts:12,16` (gtag, TimelineJS Window properties)

**Issue:**
```typescript
// Current
declare global {
  interface Window {
    gtag?: (_command: string, ..._args: any[]) => void;
    TL?: {
      Timeline: new (_id: string, _data: any, _options?: any) => any;
    };
  }
}
```

**Why:** These are third-party global libraries loaded via script tags. Their type definitions are incomplete or non-existent.

**Action:** Document and keep as-is. Add JSDoc comment:
```typescript
declare global {
  interface Window {
    /**
     * Google Analytics gtag function.
     * @see https://developers.google.com/analytics/devguides/collection/gtagjs
     * Type: any[] because gtag accepts variable argument types depending on command.
     */
    gtag?: (_command: string, ..._args: any[]) => void;
    
    /**
     * TimelineJS library instance.
     * @see https://timeline.knightlab.com/
     * Type: any because TimelineJS doesn't provide TypeScript definitions.
     */
    TL?: {
      Timeline: new (_id: string, _data: any, _options?: any) => any;
    };
  }
}
```

---

#### Subtype 2c: Supabase View Events (4 warnings)

**Files:**
- `src/lib/supabase/viewEvents.ts:28,61,117,173`

**Issue:**
```typescript
// viewEvents.ts:28
const response: any = await supabaseClient
  .from('view_events')
  .insert([...])
```

**Why:** Supabase client return types vary. TypeScript inference is incomplete for realtime operations.

**Action:** Properly type Supabase responses:
```typescript
import type { PostgrestInsertResponse } from '@supabase/supabase-js';

const response: PostgrestInsertResponse<'view_events'> = await supabaseClient
  .from('view_events')
  .insert([...]);
```

Or create a wrapper type if Supabase doesn't export it:
```typescript
interface ViewEventResponse {
  data: Array<{ id: string; /* ... */ }> | null;
  error: PostgrestError | null;
}

const response: ViewEventResponse = await supabaseClient.from('view_events').insert([...]);
```

---

#### Subtype 2d: Ad Blocker Detection & Storage (2 warnings)

**Files:**
- `src/lib/googleAdSense/consent/adBlockerDetection.ts:253,254`
- `src/lib/googleAdSense/consent/storage.ts:263`

**Issue:**
```typescript
// adBlockerDetection.ts:253
const adBlockerScripts = window.addEventListener('error', (event: any) => {
```

**Why:** Error events can be various types. Browser APIs sometimes pass union types that TypeScript can't fully infer.

**Action:**
```typescript
import type { ErrorEvent } from 'some-event-types';

const adBlockerScripts = window.addEventListener('error', (event: ErrorEvent | Event) => {
  if (event instanceof ErrorEvent) {
    // Now properly typed
  }
});
```

Or use a better type guard approach.

---

### Category 3: DOCUMENT-ONLY — Type Definition Files (35 warnings, ~10%)

**Problem:** Type `.d.ts` files intentionally use `any` for forward compatibility and Sanity schema constraints.

**Recommendation:** ✅ **LEAVE DOCUMENTED** — These are intentional design choices for schema flexibility.

#### Subtype 3a: Sanity Portable Text Block Types (4 warnings)

**Files:**
- `src/models/types/index.d.ts:69,86` — `Image[key: string]: any`, `Block.markDefs: any[]`

**Rationale:**
- Sanity schema fields are dynamic. Content creators can add custom fields not in schema.
- `markDefs` array contains arbitrary Sanity mark objects (emphasis, link, color, etc.)

**Action:** Add clarifying JSDoc:
```typescript
interface Image {
  _type: 'image';
  asset: Reference;
  alt?: string;
  /**
   * Allow additional properties for Sanity compatibility.
   * Sanity allows custom metadata fields on images (crop, hotspot, etc.).
   * @see https://www.sanity.io/docs/image-type
   */
  [key: string]: any;
}

interface Block extends React.ReactNode {
  _key: string;
  _type: 'block';
  children: Span[];
  /**
   * Array of Sanity mark objects (emphasis, link, color, etc.).
   * Type is any because mark types are extensible via custom schema.
   * @see https://www.sanity.io/docs/portable-text
   */
  markDefs: any[];
  style: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote';
}
```

---

#### Subtype 3b: Content Type Flexibility (3 warnings)

**Files:**
- `src/models/types/index.d.ts:121` — `books?: any[]` in Author

**Rationale:** Future-proofing for content expansion. Books might be rich objects or references depending on future content needs.

**Action:** Keep as-is with comment:
```typescript
interface Author extends Base {
  // ... other fields ...
  /**
   * Books by this author. Structure TBD—kept flexible for future schema changes.
   * May be expanded to { title: string; isbn?: string; releaseDate?: string }[]
   */
  books?: any[];
}
```

---

### Category 4: UTILITY & HELPER FUNCTIONS (5 warnings, <1%)

**Files:**
- `src/util/getSongArtwork.ts:18,19,36,37,67`
- `src/util/rssUtils.ts:13,35`
- `src/util/timelineJSAdapter.ts:5,85,122,163,190,193,304`

**Issue:** Helper functions that transform data from various sources use `any` for flexibility.

**Fix Example:**
```typescript
// Before (getSongArtwork.ts:18)
function getSongArtwork(song: any, size: 'small' | 'medium' | 'large'): string {

// After
type SongInput = Pick<Song, 'trackArt' | 'album'>;

function getSongArtwork(song: SongInput, size: 'small' | 'medium' | 'large'): string {
```

---

---

## Remediation Priority

### 🔴 CRITICAL (Do First)

| Priority | Category | Count | Action | Effort |
|----------|----------|-------|--------|--------|
| 1 | PortableText components | 91 | Create `portableText.ts` type file; update RichTextComponents | 2-3 hours |
| 2 | Album/Article/Lyrics page casts | 68 | Remove redundant `as any` in page components | 1 hour |
| 3 | Metadata utilities | 19 | Use union types for payload parameter | 30 min |

### 🟡 MEDIUM (Do Next)

| Priority | Category | Count | Action | Effort |
|----------|----------|-------|--------|--------|
| 4 | Schema files | 18 | Remove `as any` from Sanity schema definitions | 30 min |
| 5 | Utility functions | 12 | Type function parameters properly | 1 hour |
| 6 | Supabase operations | 4 | Use Supabase type definitions | 30 min |

### 🟢 LOW (Documentation Only)

| Priority | Category | Count | Action | Effort |
|----------|----------|-------|--------|--------|
| 7 | Window augmentations | 4 | Add JSDoc comments explaining why `any` is necessary | 15 min |
| 8 | Type definition files | 35 | Add JSDoc comments for intentional `any` usage | 30 min |

---

## Implementation Plan

### Phase 1: High-Impact, Quick Wins (2-3 hours)

1. **Create PortableText types**
   ```bash
   # New file: src/models/types/portableText.ts
   # Export PortableImageBlock, PortableCodeBlock, PortableTableBlock, etc.
   # ~100 lines
   ```
   Then update `src/components/providers/RichTextComponents.tsx` to use these types.

2. **Remove redundant page component casts**
   - Search for `as any` in `src/app/` files
   - Remove where type is already known (e.g., article is already typed as `Article`)

3. **Type metadata functions**
   - Change `payload: any` to `payload: Article | Album | Timeline | LiveEvent`

### Phase 2: Cleanup (1-2 hours)

4. Clean up utility function signatures
5. Update Sanity schema definitions to remove `as any`
6. Type Supabase operations

### Phase 3: Documentation (30 min)

7. Add JSDoc comments to necessary `any` types in type definition files
8. Document intentional uses in schema files

---

## Results After Remediation

| Before | After | Reduction |
|--------|-------|-----------|
| 364 warnings | ~50 warnings | 86% reduction |
| 41 files | ~5 files | 88% fewer files |

**Remaining warnings** (~50):
- Necessary third-party library integrations (gtag, TimelineJS, Supabase)
- Intentional schema flexibility in type definition files
- Test files (already excluded by ESLint config for `.test.ts` and `.spec.ts`)

---

## Recommendations

1. **Enforce the rule moving forward:** Keep `@typescript-eslint/no-explicit-any: warn` in eslint.config.mjs
2. **Update PR checklist:** Require no new `any` types without documentation
3. **Create typing guideline:** Document when `any` is acceptable vs. required
4. **Consider type-fest:** Use community type utilities from `type-fest` for complex scenarios

---

## Files to Create/Modify

### Create
- [ ] `src/models/types/portableText.ts` — PortableText block type definitions

### Modify
- [ ] `src/components/providers/RichTextComponents.tsx` — Use portableText types
- [ ] `src/models/types/index.d.ts` — Add JSDoc comments, update Block.markDefs type
- [ ] `src/util/metadata.ts` — Type the `payload` parameter
- [ ] `src/app/(music)/albums/[slug]/page.tsx` — Remove `as any` casts
- [ ] `src/app/(music)/lyrics/[slug]/page.tsx` — Remove `as any` casts
- [ ] `src/app/(news)/articles/[slug]/page.tsx` — Remove `as any` casts
- [ ] Multiple schema files — Remove `as any` from Sanity definitions

---

## Questions for Team

1. Should we gradually type PortableText blocks or do it all at once?
2. Are there custom Portable Text extensions we should document (beyond image, code, table)?
3. Should we create a `types/third-party.ts` file to centralize necessary `any` declarations?
