# Architecture & Separation of Concerns Audit

## Current Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER (159 files)                              │
│ src/components - Pages, layouts, UI components              │
└─────────────────────────────────────────────────────────────┘
                            ↑
┌─────────────────────────────────────────────────────────────┐
│ HOOKS LAYER (9 files)                                       │
│ src/hooks - Custom React hooks, state management            │
└─────────────────────────────────────────────────────────────┘
                            ↑
┌─────────────────────────────────────────────────────────────┐
│ SERVER LAYER (12 files)                                     │
│ src/server - Server actions, cron jobs                      │
└─────────────────────────────────────────────────────────────┘
                            ↑
┌─────────────────────────────────────────────────────────────┐
│ SERVICES LAYER (15 files)                                   │
│ src/services - Feature logic, API integrations              │
└─────────────────────────────────────────────────────────────┘
                            ↑
┌─────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE LAYER (27 files)                             │
│ src/lib - Third-party setup, configuration                  │
└─────────────────────────────────────────────────────────────┘
                            ↑
┌─────────────────────────────────────────────────────────────┐
│ TYPES LAYER (54 files)                                      │
│ src/models - TypeScript types, Zod schemas, Content Models  │
└─────────────────────────────────────────────────────────────┘
                            ↑
┌─────────────────────────────────────────────────────────────┐
│ PURE UTILITY LAYER (33 files)                               │
│ src/util - Pure functions, no side effects                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚨 CRITICAL ISSUES FOUND

### Issue #1: React Components in Utility Layer
**Severity: HIGH | Impact: Violated Layer Boundary**

Files misplaced in `src/util/`:
- `consentAwareGoogleAdSense.tsx` - @Digitl-Alchemyst React component with hooks, this seems to be left over from extracting to /hooks double check
- `googleAdSense.tsx` - React component
- `LiveVisualEditing.tsx` - React component
Move visual components @Digitl-Alchemyst
**Problem**: 
- util/ layer should contain ONLY pure functions
- These files have React dependencies
- consentAwareGoogleAdSense imports @/hooks/useConsent (upward dependency)

**Current imports flow**:
```
src/app/layout.tsx
  ↓
imports consentAwareGoogleAdSense
  ↓
src/util/consentAwareGoogleAdSense.tsx (React component in util/)
  ↓
imports @/hooks/useConsent (upward dependency)
```

**Should be**:
```
src/app/layout.tsx
  ↓
imports ConsentAwareGoogleAdSense
  ↓
src/components/ads/ConsentAwareGoogleAdSense.tsx (component layer)
  ↓
imports @/hooks/useConsent (correct downward dependency)
```

---

### Issue #2: Library Importing from Presentation Layer
**Severity: HIGH | Impact: Layer Violation + Circular Dependency Risk**

File: `src/lib/sanity/sanity.config.ts`
```typescript
import { generatePreviewUrl } from '@/components/sanity/PreviewLink';
```

**Problem**:
- Library layer should NOT depend on presentation layer
- This violates fundamental layering principle
- Creates circular dependency risk

**Dependency direction**:
```
lib/ imports from components/  ❌ WRONG (goes UP)
components/ should import from lib/  ✓ CORRECT (goes DOWN)
```
@Digitl-Alchemyst inside /lib/sanity make a components folder move any components like this that are usual for visual customization in sanity to this location
---

### Issue #3: Utility Importing Hooks
**Severity: HIGH | Impact: Circular Dependency Risk**

File: `src/util/consentAwareGoogleAdSense.tsx`
```typescript
import { useConsentCheck } from '@/hooks/useConsent';
```

**Problem**:
- util/ (pure functions) should not depend on hooks/ (React layer)
- Creates upward dependency
- Treats utility file as React component

**Violation Pattern**:
```
util/  ↑  imports from
      /
    hooks/  ❌ WRONG DIRECTION
```

---

## ⚠️  MEDIUM PRIORITY ISSUES

### Issue #4: Ad Components Duplication
Location: Both `src/components/ads/` and `src/components/googleAds/` exist

**Files**:
```
src/components/ads/
  ├── AdManager.tsx
  ├── BannerAd.tsx
  ├── InFeedAd.tsx
  ├── RectangleAd.tsx
  ├── SidebarAd.tsx

src/components/googleAds/ @Digitl-Alchemyst move everything here
  └── LargeAdCard.tsx
```

**Issue**: Unclear separation between these two directories
- Possible duplication
- Confusing to developers

**Recommendation**: Consolidate into single `components/googleAdsSense/` directory @Digitl-Alchemyst rename this to match lib

---

### Issue #5: Component Mixing Concerns @Digitl-Alchemyst skip this issue
Multiple components import from server/actions (14 files)

**Acceptable uses**:
- Form submissions (ArticleEditorForm, SourceForm)
- Data mutations (add/edit/delete operations)
- Portal operations (authenticated user actions)

**Assessment**: ✓ This is correct pattern for "smart" components

---

## 📊 Dependency Violation Matrix

| Layer | Should Import | Actual Imports | Issues |
|-------|---------------|----------------|--------|
| util/ | models/ only | lib/, hooks/ | ❌ 3 violations |
| lib/ | util/, models/ | components/ | ❌ 1 violation |
| services/ | util/, lib/, models/ | (correct) | ✓ OK |
| server/ | util/, lib/, services/ | (correct) | ✓ OK |
| hooks/ | lib/, models/, util/ | (correct) | ✓ OK |
| components/ | All (top layer) | (correct) | ✓ OK |

---

## ✅ WELL-ORGANIZED AREAS

1. **Types System** (9/10)
   - Centralized in src/models/types/
   - Clear feature-based organization
   - No circular type imports

2. **Component Organization** (8/10)
   - Organized by feature (admin/, portal/, bookstore/)
   - Smart vs. dumb separation recognized
   - Context providers grouped

3. **Server Actions** (9/10)
   - All in src/server/actions/
   - Feature-based subdirectories
   - Clear naming conventions

4. **Services Layer** (8/10)
   - Feature modules (bookstore/, membership/, etc.)
   - Clear responsibilities
   - Proper API/database abstractions

5. **No Barrel Re-exports** (10/10)
   - Clean import paths
   - No index.ts pass-throughs
   - Direct imports to implementation

---

## 📋 RECOMMENDED FIXES

### Priority 1: CRITICAL (Must Fix)

**Fix #1: Move React Components from util/ to components/**

```
Move:
  src/util/consentAwareGoogleAdSense.tsx 
    → src/components/ads/ConsentAwareGoogleAdSense.tsx

  src/util/googleAdSense.tsx
    → src/components/ads/GoogleAdSense.tsx

  src/util/LiveVisualEditing.tsx
    → src/components/sanity/LiveVisualEditing.tsx

Update imports in:
  - src/app/(music)/layout.tsx
  - src/app/(news)/layout.tsx
```

**Fix #2: Remove Library → Component Dependency**

```
In: src/lib/sanity/sanity.config.ts

Remove:
  import { generatePreviewUrl } from '@/components/sanity/PreviewLink';

Create: src/lib/sanity/preview.ts
  export function generatePreviewUrl(...) { ... }

Update:
  src/lib/sanity/sanity.config.ts to import from preview.ts
  src/components/sanity/PreviewLink.tsx to import from lib/sanity/preview.ts
```

**Fix #3: Extract Consent Component Properly**

```
Create: src/components/consent/ConsentAwareGoogleAdSense.tsx
  - Import useConsentCheck from @/hooks/useConsent ✓ correct
  - Import GoogleAdSense from @/components/ads/GoogleAdSense ✓ correct

Delete: src/util/consentAwareGoogleAdSense.tsx
```

---

### Priority 2: IMPORTANT (Should Fix)

**Fix #4: Consolidate Ad Components**

```
Rename:
  src/components/googleAds/ → remove (duplicate)
  
Move all to:
  src/components/ads/
  ├── AdManager.tsx
  ├── BannerAd.tsx
  ├── InFeedAd.tsx
  ├── LargeAdCard.tsx
  ├── RectangleAd.tsx
  └── SidebarAd.tsx
```

**Fix #5: Add Architecture Documentation**

Create `ARCHITECTURE.md`:
```
- Layer descriptions
- Import rules per layer
- Examples of correct/incorrect patterns
- Component categorization (smart/dumb)
```

---

### Priority 3: OPTIMIZATION (Nice to Have)

**Fix #6: Add ESLint Rules**

Install `eslint-plugin-boundaries`:
```javascript
{
  "rules": {
    "boundaries/element-types": [
      "error",
      {
        "default": "disallow",
        "rules": [
          {
            "from": ["util"],
            "to": ["lib", "services", "hooks", "components"]
          },
          {
            "from": ["lib"],
            "to": ["components"] // ERROR - lib can't import components
          }
        ]
      }
    ]
  }
}
```

---

## 🎯 AUDIT SCORECARD

| Category | Score | Status |
|----------|-------|--------|
| Layer Separation | 6/10 | ⚠️ Needs fixes |
| Dependency Direction | 4/10 | ❌ Violations found |
| Component Organization | 8/10 | ✓ Good |
| Type System | 9/10 | ✓ Excellent |
| Service Organization | 8/10 | ✓ Good |
| Server Layer | 9/10 | ✓ Excellent |
| Documentation | 0/10 | ❌ Missing |
| ESLint Rules | 0/10 | ❌ None configured |
| **OVERALL** | **6/10** | **⚠️ Needs Work** |

---

## 📈 Impact Analysis

### Current State
- ✓ Code works
- ✓ Most layers organized correctly
- ✓ No circular imports (yet)
- ⚠️ Some violations exist
- ❌ 3 React components in wrong layer

### Risk Assessment
- **High Risk**: Library → Component dependency could cause circular imports
- **Medium Risk**: util/ with React/hooks will cause issues as codebase grows
- **Low Risk**: Current duplication (ads vs googleAds) is manageable

### Effort to Fix
- **Total estimated**: 3-4 hours
- Move 3 files: 1 hour
- Extract preview logic: 1 hour
- Update imports (40+ files): 1 hour
- Testing: 30 minutes
- Documentation: 30 minutes

---

## Summary

**The codebase has a solid foundation** with good separation of concerns in most areas, but has **critical violations** that must be fixed:

1. ❌ React components in util layer (wrong layer)
2. ❌ lib importing from components (wrong direction)
3. ⚠️ Duplication in ad components (consolidate)

**Recommended Action**: Implement Priority 1 fixes before the codebase grows further, as these violations increase complexity exponentially.
