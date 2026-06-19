# Architecture Fixes - Implementation Roadmap

## 🎯 User Priorities (@Digital-Alchemyst)

This roadmap has been updated to reflect your specific notes from ARCHITECTURE_AUDIT.md:

1. **Move visual components from util/** to appropriate layers
   - Double check consentAwareGoogleAdSense (may be leftover from hooks extraction)
   - Move googleAdSense.tsx to components layer
   - Move LiveVisualEditing.tsx to lib/sanity/components/ (custom for Sanity)

2. **Create lib/sanity/components/ folder** for visual customization components
   - Move PreviewLink.tsx from components/sanity/ to lib/sanity/components/
   - Keep Sanity-specific visual components in infrastructure layer
   - Cleaner separation: lib handles Sanity setup + visual customization

3. **Consolidate ads to components/googleAdSense/**
   - Rename ads/ → googleAdSense/ (matches lib naming structure)
   - Move googleAds/LargeAdCard.tsx here
   - Single source of truth for all Google AdSense visual components

4. **Skip Issue #5** (component imports from server actions)
   - This is acceptable pattern for smart components - no changes needed

---

## Quick Start

Current State: **6/10 - Needs Critical Fixes**
Target State: **9/10 - Production Ready**
Estimated Effort: **3-4 hours**

---

## Phase 1: CRITICAL FIXES (1-2 hours)

These must be fixed before the codebase grows further. They create architectural debt and circular dependency risks.

### Fix #1.1: Move consentAwareGoogleAdSense.tsx

**Current**: `src/util/consentAwareGoogleAdSense.tsx`
**Problem**: React component with hooks in utility layer (leftover from hooks extraction)
**User Note**: "Double check - seems to be left over from extracting to /hooks"

**Steps**:
1. **VERIFY**: Check if this was accidentally left in util/ after extracting to hooks
   ```bash
   grep -r "consentAwareGoogleAdSense" src/hooks/
   ```
   
2. Create: `src/components/googleAdSense/ConsentAwareGoogleAdSense.tsx`
   (Note: Using `googleAdSense/` directory per user preference)

3. Copy content from `src/util/consentAwareGoogleAdSense.tsx`

4. Update imports in new location:
   ```typescript
   // ✓ Correct imports
   import { useConsentCheck } from '@/hooks/useConsent';
   import GoogleAdSense from './GoogleAdSense';
   ```

5. Update files importing the old location:
   - `src/app/(music)/layout.tsx`
   - `src/app/(news)/layout.tsx`
   - Change: `from '@/util/consentAwareGoogleAdSense'`
   - To: `from '@/components/googleAdSense/ConsentAwareGoogleAdSense'`

6. Delete: `src/util/consentAwareGoogleAdSense.tsx`

7. Verify TypeScript passes: `pnpm tsc --noEmit`

**Impact**: Eliminates upward dependency (util → hooks)

---

### Fix #1.2: Move googleAdSense.tsx

**Current**: `src/util/googleAdSense.tsx`
**Problem**: React component in utility layer
**User Note**: "Move visual components"

**Steps**:
1. Create: `src/components/googleAdSense/GoogleAdSense.tsx`
   (Note: Using `googleAdSense/` directory per user preference)

2. Copy content from `src/util/googleAdSense.tsx`

3. Check and update any internal imports (should only use @/lib, @/models)

4. Find all imports of old location:
   ```bash
   grep -r "from '@/util/googleAdSense'" src/
   ```

5. Update imports to: `from '@/components/googleAdSense/GoogleAdSense'`

6. Delete: `src/util/googleAdSense.tsx`

7. Test: `pnpm tsc --noEmit && pnpm build`

**Result**: All Google AdSense visual components centralized in `components/googleAdSense/`

---

### Fix #1.3: Move LiveVisualEditing.tsx to lib/sanity/components/

**Current**: `src/util/LiveVisualEditing.tsx`
**Problem**: React component in utility layer
**User Note**: "inside /lib/sanity make a components folder move any components like this that are usual for visual customization in sanity to this location"

**Steps**:
1. Create directory: `src/lib/sanity/components/`

2. Create: `src/lib/sanity/components/LiveVisualEditing.tsx`

3. Copy content from `src/util/LiveVisualEditing.tsx`

4. Update imports (likely from @/lib/sanity)

5. Move `PreviewLink.tsx` to `src/lib/sanity/components/` as well
   ```bash
   # Move existing component
   mv src/components/sanity/PreviewLink.tsx src/lib/sanity/components/PreviewLink.tsx
   ```

6. Find all imports:
   ```bash
   grep -r "from '@/util/LiveVisualEditing'" src/
   grep -r "from '@/components/sanity/PreviewLink'" src/
   ```

7. Update to:
   - `from '@/lib/sanity/components/LiveVisualEditing'`
   - `from '@/lib/sanity/components/PreviewLink'`

8. Delete: `src/util/LiveVisualEditing.tsx`

9. Verify: `pnpm tsc --noEmit`

**Result**: Sanity-specific visual components centralized in `lib/sanity/components/`

---

### Fix #1.4: Remove lib → components dependency (Updated)

**Current**: `src/lib/sanity/sanity.config.ts`
**Problem**: Library layer depends on presentation layer
**User Note**: "Create components folder in lib/sanity for visual customization components"

**Step A: Update PreviewLink location**

1. PreviewLink should now be at: `src/lib/sanity/components/PreviewLink.tsx`
   (Moved in Fix #1.3)

2. Update: `src/lib/sanity/sanity.config.ts`
   ```typescript
   // Change from:
   import { generatePreviewUrl } from '@/components/sanity/PreviewLink';
   
   // To:
   import { generatePreviewUrl } from './components/PreviewLink';
   ```

3. Verify: `pnpm tsc --noEmit && pnpm build`

**Step B: Create lib/sanity/preview.ts for pure logic**

4. Optional: If you want pure logic separate from component:
   ```bash
   Create: src/lib/sanity/preview.ts
   export function generatePreviewUrl(doc: any, documentType: string) {
     // ... logic
   }
   ```

5. Update `src/lib/sanity/components/PreviewLink.tsx`:
   ```typescript
   import { generatePreviewUrl } from '../preview';
   ```

**Result**: 
- Library layer no longer imports from presentation layer
- Sanity visual components organized in lib/sanity/components/
- Pure preview logic available at lib/sanity/preview.ts

---

## Phase 2: IMPORTANT IMPROVEMENTS (1-2 hours)

These improve code quality and reduce confusion.

### Fix #2.1: Consolidate Ad Components to googleAdSense/

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

**User Note**: "rename this to match lib" - consolidate everything into `components/googleAdSense/`

**Steps**:
1. Rename: `src/components/ads/` → `src/components/googleAdSense/`
   (Matches the lib/googleAdSense structure)

2. Move `LargeAdCard.tsx` to `src/components/googleAdSense/`

3. Update all imports:
   ```bash
   grep -r "from '@/components/ads/" src/
   grep -r "from '@/components/googleAds/" src/
   ```
   Change to: `from '@/components/googleAdSense/[filename]'`

4. Delete empty directory: `src/components/googleAds/`

5. Update any index exports if they exist

6. Test: `pnpm tsc --noEmit`

**Final Structure**:
```
src/components/googleAdSense/  ← Single source of truth
  ├── AdManager.tsx
  ├── BannerAd.tsx
  ├── ConsentAwareGoogleAdSense.tsx
  ├── GoogleAdSense.tsx
  ├── InFeedAd.tsx
  ├── LargeAdCard.tsx
  ├── RectangleAd.tsx
  └── SidebarAd.tsx
```

**Result**: Single source of truth for ad components, consistent with lib structure

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

### Architecture (Per User Priorities)
- [ ] No React components remain in src/util/
- [ ] No imports from util/ importing hooks/
- [ ] No lib/ importing from components/ (except lib/sanity has its own components/)
- [ ] lib/sanity/components/ contains all Sanity visual customization
- [ ] components/googleAdSense/ is single source for ad components
- [ ] Util functions are pure (no side effects)
- [ ] All services in services/ directory
- [ ] All server actions in server/actions/

### Directory Structure Verification
```
✓ src/util/
  - No .tsx files (all pure .ts)
  - No imports from hooks/, services/, or components/

✓ src/lib/sanity/components/
  - LiveVisualEditing.tsx
  - PreviewLink.tsx

✓ src/components/googleAdSense/
  - AdManager.tsx
  - BannerAd.tsx
  - ConsentAwareGoogleAdSense.tsx
  - GoogleAdSense.tsx
  - InFeedAd.tsx
  - LargeAdCard.tsx
  - RectangleAd.tsx
  - SidebarAd.tsx

✓ Deleted directories:
  - src/components/ads/ (merged into googleAdSense/)
  - src/components/googleAds/ (merged into googleAdSense/)
```

### Documentation
- [ ] ARCHITECTURE_AUDIT.md updated with user priorities
- [ ] ARCHITECTURE_FIXES_ROADMAP.md implemented
- [ ] Component README.md exists
- [ ] ESLint rules configured
- [ ] Team educated on patterns

---

## Commit Strategy

Recommended commits (reflecting user priorities):

```bash
# Commit 1: Move React components from util/ to correct locations
git commit -m "refactor: move React components from util/ to lib and components layers

- Move consentAwareGoogleAdSense.tsx to components/googleAdSense/
- Move googleAdSense.tsx to components/googleAdSense/
- Move LiveVisualEditing.tsx to lib/sanity/components/
- Move PreviewLink.tsx to lib/sanity/components/
- Update imports across 6+ files
- Delete old util files
- Eliminates util → hooks upward dependency"

# Commit 2: Extract preview logic and consolidate Sanity components
git commit -m "refactor: centralize Sanity-specific components and logic

- Extract generatePreviewUrl to lib/sanity/preview.ts
- Organize visual customization components in lib/sanity/components/
- Update sanity.config.ts to import from lib (not components)
- Remove lib → components circular dependency
- Consolidate Sanity visual components per user structure"

# Commit 3: Consolidate ad components to match lib structure
git commit -m "refactor: consolidate ad components into single googleAdSense directory

- Rename components/ads/ → components/googleAdSense/
- Move LargeAdCard.tsx to components/googleAdSense/
- Consolidate all Google AdSense components in one location
- Delete empty components/googleAds/ and components/ads/ directories
- Update imports across all files
- Matches lib/googleAdSense/ naming structure"

# Commit 4: Documentation and tooling
git commit -m "docs: add architecture guidelines and eslint boundaries

- Update ARCHITECTURE_AUDIT.md with user priorities
- Add src/components/README.md with patterns
- Configure eslint-plugin-boundaries to prevent future violations
- Document smart vs dumb component patterns
- Document lib/sanity/components/ usage guidelines"
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
