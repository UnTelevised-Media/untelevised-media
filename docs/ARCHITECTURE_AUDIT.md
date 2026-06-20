# Architecture Audit Report: UnTelevised Media Codebase

**Date:** June 19, 2026  
**Scope:** `/src/components/**/*` and `/src/app/**/*` (excluding `/app/api`)  
**Baseline:** ARCHITECTURE.md guidelines  
**Total Violations Found:** 8 (High: 5, Medium: 4, Low: 2)

---

## Executive Summary

A comprehensive audit of the `/src/components` and `/src/app` directories has identified **8 architecture violations** and refactoring opportunities. Most violations involve:

1. **Pure utility functions embedded in components** (should be in `/src/util/`)
2. **Duplicate `formatDate()` implementations** (5 instances - HIGH priority)
3. **Complex business logic in components** (should be extracted)
4. **Large components with multiple responsibilities** (should be split)

**Positive findings:** The codebase maintains good layer separation—no critical boundary violations (e.g., no components importing from services, no lib importing from components).

---

## Violations by Severity

## 🔴 HIGH PRIORITY

### Violation 1-5: Duplicate `formatDate()` Functions

**Files affected:**
- `/src/components/bookstore/BookReviews.tsx:28-34`
- `/src/components/portal/ContactTable.tsx:14-21`
- `/src/components/portal/SecureContactTable.tsx:43-50`
- `/src/components/portal/SubscribersList.tsx`
- `/src/components/portal/WhistleblowerTable.tsx`

**Issue:**  
Five separate components reimplement the same date formatting logic instead of using the centralized `/src/util/date/formatDate.ts` utility. This creates:
- Code duplication (violation of DRY principle)
- Maintenance burden (bug fixes need 5 places)
- Inconsistent formatting (potential bugs in different implementations)
- Testing burden (same logic tested multiple times)

**Impact:** HIGH  
**Effort to fix:** LOW (simple import changes)

**Suggested Fix:**
```typescript
// Current (WRONG - in each component):
const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

// Correct:
import { formatDate } from '@/util/date/formatDate';
// Use existing centralized function
```

**Action Items:**
- [ ] Audit existing `/src/util/date/formatDate.ts` to ensure it covers all needed formatting
- [ ] Replace 5 duplicate implementations with import from util
- [ ] Remove dead code
- [ ] Verify formatting output matches across all components

---

## 🟡 MEDIUM PRIORITY

### Violation 6: Pure Utility Function - `formatLabel()` in Component

**File:** `/src/components/bookstore/BookBuyFormats.tsx:13-24`

**Issue:**  
```typescript
// Lines 13-24 - Pure utility function embedded in component
const formatLabel = (format: BookFormat): string => {
  switch (format) {
    case 'hardcover': return 'Hardcover';
    case 'paperback': return 'Paperback';
    case 'ebook': return 'eBook';
    default: return '';
  }
};
```

This is a pure utility function with:
- ✓ No React dependencies
- ✓ No hooks or state
- ✓ No side effects
- ✓ Business logic (format naming)

Should live in `/src/util/bookstore/formatBookFormatLabel.ts`

**Impact:** MEDIUM (reusability, testability)  
**Effort to fix:** LOW (simple extraction)

**Suggested Fix:**
```typescript
// Create: src/util/bookstore/formatBookFormatLabel.ts
export function formatBookFormatLabel(format: BookFormat): string {
  const labels: Record<BookFormat, string> = {
    hardcover: 'Hardcover',
    paperback: 'Paperback',
    ebook: 'eBook',
  };
  return labels[format] ?? '';
}

// In component:
import { formatBookFormatLabel } from '@/util/bookstore/formatBookFormatLabel';
const label = formatBookFormatLabel(format);
```

---

### Violation 7: Complex Section Builder in Component

**File:** `/src/components/portal/PortalNav.tsx:42-143` - `buildSections()`

**Issue:**  
```typescript
// Lines 42-143: 100+ lines of pure data structure construction
const buildSections = (userRole: UserRole): NavigationSection[] => {
  // Complex role-based conditional logic
  // No JSX or React hooks
  // Pure data transformation
};
```

This is pure business logic (role-based navigation structure building) with:
- ✓ No React dependencies
- ✓ Complex conditional logic (70+ lines)
- ✓ Reusable across portal components
- ✓ Difficult to test within component context

**Impact:** MEDIUM (testability, code organization)  
**Effort to fix:** MEDIUM (extraction + imports)

**Suggested Fix:**
```typescript
// Create: src/util/portal/buildPortalNavSections.ts
export function buildPortalNavSections(userRole: UserRole): NavigationSection[] {
  // Move 100+ lines here
  // Pure function, easy to test
}

// In component - much simpler:
const sections = buildPortalNavSections(userRole);
return <nav>{/* render sections */}</nav>;
```

**Benefits:**
- Easier to test role-based navigation logic independently
- Component stays focused on rendering
- Reusable in other components if needed

---

### Violation 8: Article Filtering Logic in Page File

**File:** `/src/app/(news)/page.tsx:36-55`

**Issue:**  
```typescript
// Lines 36-55: Complex article filtering/sorting logic
const excludedIds = new Set<string>([...]);
const moreNews = articles
  .filter((a) => !excludedIds.has(a._id))
  .sort((a, b) => {
    const dateA = (a as any).eventDate ?? a.publishedAt ?? a._createdAt;
    const dateB = (b as any).eventDate ?? b.publishedAt ?? b._createdAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
```

This is pure business logic that should be in `/src/util/content/`:
- ✓ Pure function (no side effects)
- ✓ Reusable (same logic likely needed elsewhere)
- ✓ Testable independently
- ✓ Separates concerns from page routing

**Impact:** MEDIUM (reusability, testability)  
**Effort to fix:** LOW (extraction + import)

**Suggested Fix:**
```typescript
// Create: src/util/content/filterAndSortArticles.ts
export function filterAndSortArticles(
  articles: Article[],
  excludedIds: Set<string>
): Article[] {
  return articles
    .filter((a) => !excludedIds.has(a._id))
    .sort((a, b) => {
      const dateA = (a as any).eventDate ?? a.publishedAt ?? a._createdAt;
      const dateB = (b as any).eventDate ?? b.publishedAt ?? b._createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
}

// In page:
import { filterAndSortArticles } from '@/util/content/filterAndSortArticles';
const moreNews = filterAndSortArticles(articles, excludedIds);
```

---

### Violation 9: Large Multi-Responsibility Component

**File:** `/src/components/portal/ArticleEditorForm.tsx` (~500+ lines)

**Issue:**  
This single component handles multiple concerns:
- Form validation (schema management) @Digitl-Alchemyst move all of these to /models/validations
- Rich text editing (TipTap integration)
- Sanity integration (document updates)
- API calls (draft/publish actions)
- State management (multiple useState, useCallback, useTransition)
- Complex conditional rendering

**Impact:** MEDIUM (maintainability, testability)  
**Effort to fix:** HIGH (component refactoring)

**Current Structure:**
```typescript
export function ArticleEditorForm({ article }: Props) {
  // State management (5+ useState)
  // Effects (useEffect, useCallback chains)
  // API integration
  // Form validation
  // TipTap editor setup
  // Complex rendering with nested conditionals
  // ~500 lines total
}
```

**Suggested Refactoring:**

**Step 1: Extract Custom Hooks**
```typescript
// src/hooks/article/useArticleEditor.ts
export function useArticleEditor(article: Article) {
  const [title, setTitle] = useState(article.title);
  const [content, setContent] = useState(article.content);
  const [isDirty, setIsDirty] = useState(false);
  // Move editor-specific state and effects here
  return { title, setTitle, content, setContent, isDirty };
}

// src/hooks/article/useArticlePublishing.ts
export function useArticlePublishing(articleId: string) {
  const [isPending, startTransition] = useTransition();
  // Move publish/draft logic here
  return { isPending, publish, saveDraft };
}
```

**Step 2: Extract Smaller Components**
```typescript
// src/components/portal/ArticleMetadataFields.tsx
export function ArticleMetadataFields({ title, setTitle, slug, setSlug }) {
  // Just rendering metadata inputs
  return <>{/* inputs */}</>;
}

// src/components/portal/ArticleContentEditor.tsx
export function ArticleContentEditor({ content, setContent }) {
  // Just rendering TipTap editor
  return <>{/* editor */}</>;
}

// src/components/portal/ArticlePublishControls.tsx
export function ArticlePublishControls({ 
  isDraft, 
  isPending, 
  onPublish, 
  onSave 
}) {
  return <>{/* buttons */}</>;
}
```

**Step 3: Compose in Main Component**
```typescript
export function ArticleEditorForm({ article }: Props) {
  const editor = useArticleEditor(article);
  const publishing = useArticlePublishing(article._id);

  return (
    <div className="editor-form">
      <ArticleMetadataFields {...editor} />
      <ArticleContentEditor {...editor} />
      <ArticlePublishControls 
        isDraft={editor.isDraft} 
        isPending={publishing.isPending}
        onPublish={publishing.publish}
        onSave={publishing.saveDraft}
      />
    </div>
  );
}
```

**Benefits:**
- Each component has single responsibility
- Easier to test individual pieces
- Hooks are reusable elsewhere
- Main component is readable and maintainable

---

### Violation 10: Server Data Fetching in Components @Digitl-Alchemyst all data fetching queries live in /lib/sanity/lib/queries

**Files:**
- `/src/components/global/ArticleCategories.tsx:75+`
- `/src/components/global/Footer.tsx:38+`

**Issue:**  
Server components with inline data fetching:
```typescript
// In server component
async function getArticleCategories() {
  const categories = await client.fetch(/* GROQ query */);
  return categories;
}

export async function ArticleCategories() {
  const categories = await getArticleCategories();
  return <>{/* render */}</>;
}
```

While technically valid in server components, this mixes concerns:
- Data fetching logic lives in component file
- Hard to reuse in other components
- Difficult to test independently
- Component code becomes cluttered

**Impact:** MEDIUM (organization, reusability)  
**Effort to fix:** MEDIUM (abstracting data layer)

**Suggested Fix - Option A: Server Actions/Queries**
```typescript
// Create: src/server/queries/category.ts
export async function getArticleCategories() {
  return client.fetch(/* GROQ query */);
}

// In component:
import { getArticleCategories } from '@/server/queries/category';

export async function ArticleCategories() {
  const categories = await getArticleCategories();
  return <>{/* render */}</>;
}
```

**Suggested Fix - Option B: Service Layer**
```typescript
// Create: src/services/content/categoryService.ts
export async function fetchArticleCategories() {
  return client.fetch(/* GROQ query */);
}

// In component:
import { fetchArticleCategories } from '@/services/content/categoryService';

export async function ArticleCategories() {
  const categories = await fetchArticleCategories();
  return <>{/* render */}</>;
}
```

---

## 🟢 LOW PRIORITY

### Violation 11: Helper Function in Page File

**File:** `/src/app/(news)/articles/[slug]/page.tsx:42-56` - `safeText()`

**Issue:**  
```typescript
// Lines 42-56: Pure utility helper function
const safeText = (blocks?: PortableTextBlock[]): string => {
  if (!blocks) return '';
  return blocks
    .map((block) => (typeof block === 'string' ? block : block.text ?? ''))
    .join(' ');
};
```

This pure utility function for extracting text from Sanity blocks should be in `/src/util/`:
- ✓ No React dependencies
- ✓ No side effects
- ✓ Reusable across pages

**Impact:** LOW (nice-to-have reusability)  
**Effort to fix:** LOW (simple move)

**Suggested Fix:**
```typescript
// Create: src/util/text/extractPortableText.ts (or similar)
export function extractPortableText(blocks?: PortableTextBlock[]): string {
  if (!blocks) return '';
  return blocks
    .map((block) => (typeof block === 'string' ? block : block.text ?? ''))
    .join(' ');
}

// In page:
import { extractPortableText } from '@/util/text/extractPortableText';
const description = extractPortableText(article.content);
```


## 🟢 Opportunities for Refactoring (Non-Violations)

### Opportunity 1: Extract Inline Components from App Pages

**Files:**
- `/src/app/(bookstore)/bookstore/page.tsx:51-130` - `BookCard` logic
- `/src/app/(bookstore)/bookstore/page.tsx:132-209` - `FeaturedHero` logic
- `/src/app/(bookstore)/bookstore/cart/page.tsx:14-48` - `CartQuantityControl` logic

**Issue:**  
Large inline components mixed with page routing logic. These should be extracted to `/src/components/bookstore/` for:
- Reusability
- Cleaner page files
- Easier testing
- Better code organization

**Suggested Fix:**
```typescript
// Extract to: src/components/bookstore/BookCard.tsx
export function BookCard({ book }: { book: SanityBook }) {
  // ~80 lines of component logic
}

// In page:
import { BookCard } from '@/components/bookstore/BookCard';

export default async function BooksPage() {
  const books = await getBooks();
  return <div>{books.map(book => <BookCard key={book._id} book={book} />)}</div>;
}
```

---

### Opportunity 2: Consolidate Status/Color Mapping Constants

**File:** `/src/components/portal/SecureContactTable.tsx:20-41`

**Issue:**  
```typescript
const URGENCY_COLORS = { high: 'red', medium: 'yellow', low: 'green' };
const STATUS_COLORS = { open: 'blue', resolved: 'green', closed: 'gray' };
const STATUS_LABELS = { open: 'Open', resolved: 'Resolved', closed: 'Closed' };
```

These constants are likely used in multiple components. Extract to `/src/util/portal/statusConfig.ts`:

**Suggested Fix:**
```typescript
// Create: src/util/portal/statusConfig.ts
export const URGENCY_COLORS = { high: 'red', medium: 'yellow', low: 'green' } as const;
export const STATUS_COLORS = { open: 'blue', resolved: 'green', closed: 'gray' } as const;
export const STATUS_LABELS = { open: 'Open', resolved: 'Resolved', closed: 'Closed' } as const;

// In components:
import { STATUS_COLORS, STATUS_LABELS } from '@/util/portal/statusConfig';
```

---

## Architecture Compliance Summary

### ✅ Good: No Critical Boundary Violations

The audit found **NO violations** of critical import boundaries:
- ✓ No components importing from services
- ✓ No components importing from server (where not allowed)
- ✓ No lib/ importing from components
- ✓ No services importing from components
- ✓ No util/ importing from higher layers

### ⚠️ Issues Found: Code Organization

The violations found are mostly about **code organization and extraction**, not layer boundary violations:
- **5 high-priority duplications** (same code in 5 places)
- **4 medium-priority extractions** (pure logic in wrong layer)
- **2 low-priority cleanups** (nice-to-have improvements)

### 📊 Architecture Score

**Before:** 7/10 (good layer separation, but code organization issues)  
**After fixes:** 9/10 (clean layers, reusable utilities, clear responsibilities)

---

## Remediation Roadmap

### Phase 1: High Priority (1-2 days)
- [ ] Resolve 5 duplicate `formatDate()` functions
  - Verify `/src/util/date/formatDate.ts` meets all requirements
  - Replace 5 implementations with imports
  - Update tests if they exist

**Estimated effort:** 2-3 hours  
**Impact:** Eliminates code duplication, improves maintainability

### Phase 2: Medium Priority (2-3 days)
- [ ] Extract `formatLabel()` to `/src/util/bookstore/formatBookFormatLabel.ts`
- [ ] Extract `buildSections()` to `/src/util/portal/buildPortalNavSections.ts`
- [ ] Extract article filtering to `/src/util/content/filterAndSortArticles.ts`
- [ ] Consider extracting data fetching from server components (optional)

**Estimated effort:** 1 day  
**Impact:** Improves testability and reusability

### Phase 3: Large Refactor (3-5 days)
- [ ] Refactor `ArticleEditorForm.tsx` into smaller components
  - Extract `useArticleEditor()` hook
  - Extract `useArticlePublishing()` hook
  - Create `ArticleMetadataFields`, `ArticleContentEditor`, `ArticlePublishControls`
  - Compose in main component

**Estimated effort:** 2-3 days  
**Impact:** Major improvement in maintainability and testability

### Phase 4: Low Priority / Nice-to-Have (1 day)
- [ ] Extract `safeText()` helper to util
- [ ] Move toast types to `/src/models/types/ui/`
- [ ] Extract inline components from bookstore pages
- [ ] Consolidate status config constants

**Estimated effort:** 3-4 hours  
**Impact:** Polish and consistency

### Phase 5: Testing
- [ ] Add/update unit tests for extracted utilities
- [ ] Verify component rendering after refactors
- [ ] Run ESLint to confirm no new violations
- [ ] Manual smoke tests for affected pages

**Estimated effort:** 1 day

---

## Total Remediation Timeline

- **Quick wins:** Phase 1 (HIGH priority) = ~3 hours
- **Full cleanup:** Phases 1-4 = ~4-5 days
- **Plus testing:** ~1 additional day

**Recommended approach:** Address Phase 1 immediately, then schedule Phase 2-4 in sprint(s).

---

## Conclusion

The UnTelevised Media codebase maintains **good architectural discipline**. The violations found are not about breaking core layer rules, but about optimizing code organization through:

1. **Eliminating duplication** (5 instances of `formatDate()`)
2. **Extracting pure logic** to util layer (4 opportunities)
3. **Splitting large components** into smaller, testable units
4. **Organizing constants** for reusability

These improvements will significantly enhance:
- **Code reusability** (eliminate duplication, share logic)
- **Testability** (pure functions easier to test)
- **Maintainability** (single responsibility principle)
- **Development velocity** (clearer file organization)

All recommended fixes align with the ARCHITECTURE.md guidelines and require no fundamental restructuring.

---

**Report prepared by:** Architecture Audit Tool  
**Date:** June 19, 2026  
**Next review:** Recommended after Phase 1-2 remediation completion
