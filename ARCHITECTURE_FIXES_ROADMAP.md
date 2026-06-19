# Architecture Fixes - Implementation Roadmap

## Quick Start

Current State: **6/10 - Needs Critical Fixes**
Target State: **9/10 - Production Ready**
Estimated Effort: **3-4 hours**

---

## Phase 1: CRITICAL FIXES (1-2 hours)

These must be fixed before the codebase grows further. They create architectural debt and circular dependency risks.

### Fix #1.1: Move consentAwareGoogleAdSense.tsx

**Current**: `src/util/consentAwareGoogleAdSense.tsx`
**Problem**: React component with hooks in utility layer

**Steps**:
1. Create: `src/components/ads/ConsentAwareGoogleAdSense.tsx`
2. Copy content from `src/util/consentAwareGoogleAdSense.tsx`
3. Update imports in new location:
   ```typescript
   // ✓ Correct imports
   import { useConsentCheck } from '@/hooks/useConsent';
   import GoogleAdSense from './GoogleAdSense';
   ```
4. Update files importing the old location:
   - `src/app/(music)/layout.tsx`
   - `src/app/(news)/layout.tsx`
   - Change: `from '@/util/consentAwareGoogleAdSense'`
   - To: `from '@/components/ads/ConsentAwareGoogleAdSense'`
5. Delete: `src/util/consentAwareGoogleAdSense.tsx`
6. Verify TypeScript passes: `pnpm tsc --noEmit`

**Impact**: Eliminates upward dependency (util → hooks)

---

### Fix #1.2: Move googleAdSense.tsx

**Current**: `src/util/googleAdSense.tsx`
**Problem**: React component in utility layer

**Steps**:
1. Create: `src/components/ads/GoogleAdSense.tsx`
2. Copy content from `src/util/googleAdSense.tsx`
3. Check and update any internal imports (should only use @/lib, @/models)
4. Find all imports of old location:
   ```bash
   grep -r "from '@/util/googleAdSense'" src/
   ```
5. Update imports to: `from '@/components/ads/GoogleAdSense'`
6. Delete: `src/util/googleAdSense.tsx`
7. Test: `pnpm tsc --noEmit && pnpm build`

---

### Fix #1.3: Move LiveVisualEditing.tsx

**Current**: `src/util/LiveVisualEditing.tsx`
**Problem**: React component in utility layer

**Steps**:
1. Create: `src/components/sanity/LiveVisualEditing.tsx`
2. Copy content from `src/util/LiveVisualEditing.tsx`
3. Update imports (likely from @/lib/sanity)
4. Find all imports:
   ```bash
   grep -r "from '@/util/LiveVisualEditing'" src/
   ```
5. Update to: `from '@/components/sanity/LiveVisualEditing'`
6. Delete: `src/util/LiveVisualEditing.tsx`
7. Verify: `pnpm tsc --noEmit`

---

### Fix #1.4: Remove lib → components dependency

**Current**: `src/lib/sanity/sanity.config.ts`
**Problem**: Library layer depends on presentation layer

**Step A: Extract preview logic to lib layer**

1. Create: `src/lib/sanity/preview.ts`
   ```typescript
   // Extract from @/components/sanity/PreviewLink
   export function generatePreviewUrl(doc: any, documentType: string) {
     // ... implementation
   }
   ```

2. Copy the `generatePreviewUrl` function body from `PreviewLink.tsx`

3. Update: `src/lib/sanity/sanity.config.ts`
   ```typescript
   // Change from:
   import { generatePreviewUrl } from '@/components/sanity/PreviewLink';
   
   // To:
   import { generatePreviewUrl } from './preview';
   ```

**Step B: Update component to use lib version**

4. Update: `src/components/sanity/PreviewLink.tsx`
   ```typescript
   // Add import from lib:
   import { generatePreviewUrl } from '@/lib/sanity/preview';
   
   // Use it in component
   ```

5. Verify: `pnpm tsc --noEmit && pnpm build`

**Result**: Library layer no longer imports from components

---

## Phase 2: IMPORTANT IMPROVEMENTS (1-2 hours)

These improve code quality and reduce confusion.

### Fix #2.1: Consolidate Ad Components

**Current State**:
```
src/components/ads/           (5 files)
  ├── AdManager.tsx
  ├── BannerAd.tsx
  ├── InFeedAd.tsx
  ├── RectangleAd.tsx
  └── SidebarAd.tsx

src/components/googleAds/     (1 file)
  └── LargeAdCard.tsx
```

**Steps**:
1. Move `LargeAdCard.tsx` to `src/components/ads/`
2. Update all imports:
   ```bash
   grep -r "from '@/components/googleAds" src/
   ```
   Change to: `from '@/components/ads/LargeAdCard'`
3. Delete empty directory: `src/components/googleAds/`
4. Update index exports if any exist
5. Test: `pnpm tsc --noEmit`

**Result**: Single source of truth for ad components

---

### Fix #2.2: Create ARCHITECTURE.md

Create: `src/ARCHITECTURE.md`

Content sections:
1. Layer Overview (with diagrams)
2. Import Rules (what each layer can import)
3. Component Patterns (smart vs dumb)
4. Examples (correct vs incorrect patterns)
5. Common Mistakes (what to avoid)

Example structure:
```markdown
# Architecture Guidelines

## Layers

### util/ - Pure Functions Only
- ✓ Can import: models/
- ✗ Cannot import: lib/, services/, hooks/, components/
- Examples: formatDate, sanitize, serializers

### lib/ - Infrastructure
- ✓ Can import: util/, models/
- ✗ Cannot import: services/, hooks/, components/
- Examples: Sanity client setup, auth helpers

### services/ - Feature Logic
- ✓ Can import: util/, lib/, models/
- ✗ Cannot import: hooks/, components/
- Examples: BookStore service, membership logic

### hooks/ - React Hooks
- ✓ Can import: util/, lib/, services/, models/
- ✗ Cannot import: components/
- Examples: useCart, useConsent

### components/ - UI Layer (Top Layer)
- ✓ Can import: everything
- Examples: Pages, UI components
```

---

## Phase 3: OPTIMIZATION (1-2 hours)

These prevent future violations and document architecture.

### Fix #3.1: Configure ESLint Boundaries

Install dependencies:
```bash
npm install --save-dev eslint-plugin-boundaries
```

Update `.eslintrc.json`:
```json
{
  "plugins": ["boundaries"],
  "rules": {
    "boundaries/element-types": [
      "error",
      {
        "default": "disallow",
        "rules": [
          {
            "from": ["util"],
            "allow": ["models"]
          },
          {
            "from": ["lib"],
            "allow": ["util", "models"]
          },
          {
            "from": ["services"],
            "allow": ["util", "lib", "models"]
          },
          {
            "from": ["server"],
            "allow": ["util", "lib", "services", "models"]
          },
          {
            "from": ["hooks"],
            "allow": ["util", "lib", "services", "models"]
          },
          {
            "from": ["components"],
            "allow": ["util", "lib", "services", "hooks", "models"]
          }
        ]
      }
    ]
  }
}
```

Result: ESLint will catch violations automatically

---

### Fix #3.2: Document Component Patterns

Create: `src/components/README.md`

Content:
```markdown
# Components

## Organization

### Smart Components (with logic)
- Import from: services/, server/, hooks/
- Typically in: portal/, forms/, pages/
- Examples: ArticleEditorForm, SourceLibrary

### Dumb Components (presentational)
- Only props, no imports from business logic
- Typically in: ui/, archive/, post/
- Examples: BookCard, Button

### Container Components
- Fetch data, manage state
- Wrap dumb components
- Examples: ArticlePage, BookstorePage

## Guidelines

1. One component per file
2. Co-locate styles with component
3. Name files after component (PascalCase)
4. Export default function
```

---

## Validation Checklist

After completing all fixes, verify:

### Code Quality
- [ ] `pnpm tsc --noEmit` - No TypeScript errors
- [ ] `pnpm eslint src --ext .ts,.tsx` - No linting violations
- [ ] `pnpm build` - Production build succeeds
- [ ] `pnpm test` - All tests pass

### Architecture
- [ ] No imports from util/ importing hooks/
- [ ] No lib/ importing from components/
- [ ] No util/ with React dependencies
- [ ] Util functions are pure (no side effects)
- [ ] All services in services/ directory
- [ ] All server actions in server/actions/

### Documentation
- [ ] ARCHITECTURE.md created and updated
- [ ] Component README.md exists
- [ ] ESLint rules configured
- [ ] Team educated on patterns

---

## Commit Strategy

Recommended commits:

```bash
# Commit 1: Move ad components
git commit -m "refactor: move React components from util/ to components/

- Move consentAwareGoogleAdSense.tsx to components/ads/
- Move googleAdSense.tsx to components/ads/
- Move LiveVisualEditing.tsx to components/sanity/
- Update imports across 6 files
- Delete old util files"

# Commit 2: Fix lib/component dependency
git commit -m "refactor: eliminate lib → components dependency

- Extract generatePreviewUrl to lib/sanity/preview.ts
- Update sanity.config.ts to import from lib
- Update PreviewLink.tsx to import from lib
- Remove circular dependency risk"

# Commit 3: Consolidate ad components
git commit -m "refactor: consolidate ad components into single directory

- Move LargeAdCard.tsx to components/ads/
- Delete empty components/googleAds/ directory
- Update imports across 3 files"

# Commit 4: Documentation and tooling
git commit -m "docs: add architecture guidelines and eslint boundaries

- Add ARCHITECTURE.md with layer guidelines
- Add src/components/README.md with patterns
- Configure eslint-plugin-boundaries to prevent future violations
- Document smart vs dumb component patterns"
```

---

## Metrics Before/After

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Architecture Score | 6/10 | 9/10 | +3 |
| Dependency Violations | 3 | 0 | -3 |
| React Components in util/ | 3 | 0 | -3 |
| ESLint Rules | 0 | 8 | +8 |
| Architecture Docs | Missing | Complete | Added |
| Build Time | Same | Same | No change |
| Test Coverage | Same | Same | No change |

---

## Timeline

- **1-2 hours**: Phase 1 (Critical fixes)
- **+ 1-2 hours**: Phase 2 (Improvements)  
- **+ 30 min - 1 hour**: Phase 3 (Optimization)
- **= 3-4 hours total**

**Can be split across multiple PRs for easier review**:
- PR 1: Move components (1 hour)
- PR 2: Extract preview logic (30 min)
- PR 3: Documentation + ESLint (1 hour)

---

## Risk Assessment

| Fix | Risk | Mitigation |
|-----|------|-----------|
| Move 3 components | Low - clear refactoring | TypeScript + tests |
| Extract preview logic | Low - extract function | Test in sanity.config.ts |
| Consolidate ads | Low - only moving files | Search/replace imports |
| ESLint rules | Low - config only | Gradually enable per rule |

**Overall Risk**: LOW

No functional changes, purely architectural improvements.

---

## Success Criteria

✅ All critical violations fixed
✅ Zero TypeScript errors
✅ Build succeeds
✅ Tests pass
✅ Architecture score ≥ 9/10
✅ Architecture documented
✅ Team educated on patterns
✅ ESLint prevents future violations
