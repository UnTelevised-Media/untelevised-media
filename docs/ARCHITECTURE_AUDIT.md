# Architecture Audit Report

**Date:** June 20, 2026  
**Audited Against:** `docs/ARCHITECTURE.md`  
**Status:** ⚠️ **15 VIOLATIONS FOUND** across 5 files

---

## Executive Summary

The codebase has **15 architecture violations** spread across the `util/`, `services/`, and `hooks/` layers. The most critical issue is the `util/` layer, which is being used for code that depends on infrastructure clients (Sanity, database), violating the "pure functions only" rule.

### Violation Count by Layer
- **src/util/** — 11 violations (HIGH PRIORITY)
- **src/hooks/** — 3 violations (MEDIUM PRIORITY)
- **src/services/** — 1 violation (MEDIUM PRIORITY)
- **src/models/** — ✓ Compliant
- **src/lib/** — ✓ Compliant
- **src/server/** — ✓ Compliant

---

## Detailed Violations

### 1. UTIL LAYER VIOLATIONS (11 violations)

**Rule:** `util/` can ONLY import from `models/`. No lib/, services/, server/, hooks/, or components/.

**Issue:** Metadata generation and URL utilities depend on the Sanity client, which is infrastructure code. These functions are **not pure** and violate the layer's contract.

#### Files Affected:

**File: `src/util/metadata/generateArticleMetadata.ts`**
```
Line 4:   import sanityClient from '@/lib/sanity/lib/client'          ❌
Line 6:   import { queryArticleBySlug } from '@/lib/sanity/lib/queries'  ❌
```
**Violation:** Imports from lib/ (Sanity client and queries)  
**Impact:** This is not a pure function—it depends on external client

---

**File: `src/util/metadata/generateBlogCatMetadata.ts`**
```
Line 4:   import sanityClient from '@/lib/sanity/lib/client'          ❌
```
**Violation:** Imports from lib/ (Sanity client)

---

**File: `src/util/metadata/generateLiveEventMetadata.ts`**
```
Line 3:   import sanityClient from '@/lib/sanity/lib/client'          ❌
Line 5:   import { queryEventBySlug } from '@/lib/sanity/lib/queries'  ❌
```
**Violation:** Imports from lib/ (Sanity client and queries)

---

**File: `src/util/metadata/generateMetadata.ts`**
```
Line 4:   import sanityClient from '@/lib/sanity/lib/client'          ❌
```
**Violation:** Imports from lib/ (Sanity client)

---

**File: `src/util/url/generateStaticSlugs.ts`**
```
Line 6:   import { client } from '@/lib/sanity/lib/client'            ❌
Line 8:   import { readToken as token } from '@/lib/sanity/lib/tokens' ❌
```
**Violation:** Imports from lib/ (Sanity client and tokens)  
**Impact:** Not a pure function—depends on external infrastructure

---

**File: `src/util/url/getAllUrls.ts`**
```
Line 5:   import sanityClient from '@/lib/sanity/lib/client'          ❌
```
**Violation:** Imports from lib/ (Sanity client)

---

**File: `src/util/url/urlForImage.ts`**
```
Line 1:   import sanityClient from '@/lib/sanity/lib/client'          ❌
```
**Violation:** Imports from lib/ (Sanity client)

---

**File: `src/util/portal/buildPortalNavSections.tsx`**
```
Line 18:  import type { PortalRole } from '@/lib/auth/roles-utils'    ❌
```
**Violation:** Imports from lib/ (auth utilities)

---

### 2. SERVICES LAYER VIOLATIONS (1 violation)

**Rule:** `services/` can import from `util/`, `lib/`, `models/`. Cannot import from `server/`, `hooks/`, `components/`.

**File: `src/services/portal/article-ownership.ts`**
```
Line 7:   import { getSanityAuthorIdForCurrentUser } from '@/server/actions/portal/author'  ❌
```
**Violation:** Imports from server/ (server action)  
**Impact:** Circular dependency—services should not call server actions; server calls services.

---

### 3. HOOKS LAYER VIOLATIONS (3 violations)

**Rule:** `hooks/` can import from `util/`, `lib/`, `services/`, `models/`. Cannot import from `components/`, `server/`.

**File: `src/hooks/use-toast.ts`**
```
Line 6:   import type { ToastActionElement, ToastProps } from '@/components/ui/toast'  ❌
```
**Violation:** Imports from components/ (Toast component types)  
**Impact:** hooks/ should not import from components/—types should live in models/

---

**File: `src/hooks/bookstore/useWishlist.ts`**
```
Line 23:  import { ... } from '@/server/actions/wishlist'  ❌
```
**Violation:** Imports from server/ (server action)  
**Impact:** Circular dependency pattern—hooks calling server actions creates tight coupling

---

**File: `src/hooks/useBookmarks.ts`**
```
Line 23:  import { ... } from '@/server/actions/bookmarks'  ❌
```
**Violation:** Imports from server/ (server action)  
**Impact:** Circular dependency pattern—hooks calling server actions

---

## Root Causes

### 1. **Metadata/URL Utilities Belong in `lib/` Not `util/`**
These utilities are infrastructure-specific and depend on Sanity client setup. They should be moved to `src/lib/sanity/` since they're Sanity-specific infrastructure code.

**Current Location:** `src/util/metadata/*` and `src/util/url/*`  
**Correct Location:** `src/lib/sanity/utils/` or `src/lib/sanity/metadata/`

### 2. **Circular Dependencies with Server Actions**
- `services/article-ownership.ts` imports from server actions
- `hooks/useWishlist.ts` and `hooks/useBookmarks.ts` import from server actions

**Root Cause:** Server actions should call services, not the other way around.

### 3. **Component Types in Components Layer**
Toast types are defined in `components/ui/toast` but imported by hooks.

**Root Cause:** Types should live in `models/` so any layer can use them without import violations.

---

## Recommended Fixes (Priority Order)

### 🔴 HIGH PRIORITY

**1. Reorganize util/ → lib/**
Move all Sanity-dependent utilities to infrastructure layer:
```
src/util/metadata/* → src/lib/sanity/metadata/*
src/util/url/*     → src/lib/sanity/url/*
```

**File: `src/util/metadata/generateArticleMetadata.ts`**
- Move to `src/lib/sanity/metadata/generateArticleMetadata.ts`
- Remove from util/

**File: `src/util/metadata/generateBlogCatMetadata.ts`**
- Move to `src/lib/sanity/metadata/generateBlogCatMetadata.ts`

**File: `src/util/metadata/generateLiveEventMetadata.ts`**
- Move to `src/lib/sanity/metadata/generateLiveEventMetadata.ts`

**File: `src/util/metadata/generateMetadata.ts`**
- Move to `src/lib/sanity/metadata/generateMetadata.ts`

**File: `src/util/url/generateStaticSlugs.ts`**
- Move to `src/lib/sanity/url/generateStaticSlugs.ts`

**File: `src/util/url/getAllUrls.ts`**
- Move to `src/lib/sanity/url/getAllUrls.ts`

**File: `src/util/url/urlForImage.ts`**
- Move to `src/lib/sanity/url/urlForImage.ts`

---

### 🟠 MEDIUM PRIORITY

**2. Extract Portal Role Types to models/**
Create `src/models/types/auth.ts` or similar:
```typescript
// src/models/types/auth.ts
export type PortalRole = 'admin' | 'editor' | 'viewer';
export type RolePermissions = Record<PortalRole, Permission[]>;
```

Update imports in:
- `src/util/portal/buildPortalNavSections.tsx` → import from `@/models/types/auth`
- `src/lib/auth/roles-utils.ts` → export from `@/models/types/auth`

---

**3. Move Toast Types to models/**
Create `src/models/types/ui.ts`:
```typescript
// src/models/types/ui.ts
export type ToastActionElement = React.ReactNode;
export interface ToastProps {
  // ...
}
```

Update imports in:
- `src/hooks/use-toast.ts` → import from `@/models/types/ui`

---

**4. Fix Circular Dependencies in Hooks**

**File: `src/hooks/bookstore/useWishlist.ts`**
- Problem: Hook imports server action directly
- Solution: Accept callback prop instead of direct import
```typescript
// Before (❌ WRONG)
import { addToWishlist } from '@/server/actions/wishlist';

export function useWishlist() {
  const add = async (id) => addToWishlist(id);
}

// After (✓ CORRECT)
export function useWishlist(addToWishlist?: typeof import('@/server/actions/wishlist').addToWishlist) {
  // Use prop if provided, otherwise it's defined in the component
}
```

**File: `src/hooks/useBookmarks.ts`**
- Problem: Hook imports server action directly
- Solution: Same callback prop pattern

---

**5. Fix Service/Server Circular Dependency**

**File: `src/services/portal/article-ownership.ts`**
- Move `getSanityAuthorIdForCurrentUser` to `src/lib/auth/` since it's auth infrastructure
- OR restructure so the server action doesn't need it from services

---

## Compliance Checklist

After fixes, verify:
- [ ] No files in `src/util/` import from `lib/`, `services/`, `server/`, `hooks/`, `components/`
- [ ] No files in `src/models/` import from any other layer
- [ ] No files in `src/lib/` import from `services/`, `server/`, `hooks/`, `components/`
- [ ] No files in `src/services/` import from `server/`, `hooks/`, `components/`
- [ ] No files in `src/server/` import from `hooks/`, `components/`
- [ ] No files in `src/hooks/` import from `components/`, `server/`
- [ ] ESLint `@nx/enforce-module-boundaries` rules are enforced

---

## Testing & Validation

1. **Run ESLint** to verify architecture rules:
   ```bash
   npm run lint
   ```

2. **Verify import paths** after refactoring:
   ```bash
   grep -r "@/util" src/lib/ src/server/
   grep -r "@/models" src/util/
   grep -r "@/components" src/hooks/
   grep -r "@/server" src/hooks/ src/services/
   ```

3. **Update imports in all referencing files** when moving files

---

## Notes for Development

- **lib/sanity/metadata/** is appropriate for Sanity-specific metadata logic
- **lib/sanity/url/** is appropriate for Sanity-specific URL generation
- Types that cross multiple layers should move to **models/**
- Infrastructure utilities should move to **lib/**
- Pure functions with no dependencies should stay in **util/**

---

**Last Updated:** June 20, 2026  
**Next Review:** After fixes are applied  
**Owner:** Architecture Enforcement
