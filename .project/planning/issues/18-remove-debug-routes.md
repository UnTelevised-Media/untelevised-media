<!-- GitHub Issue: #15 -->
## Problem

The following debug and test routes are currently live and publicly accessible in production:

- `/timeline-debug` — Exposes internal timeline rendering debug output
- `/timeline-simple-test` — Exposes a bare-bones test scaffold for timeline components
- `/timeline-test` — Another timeline test variant

Additionally, a collection of debug components exists in `src/components/debug/`:
- `TestAd.tsx`, `TestAdComponent.tsx` — Ad placement test UIs
- `AdDebugger.tsx` — Debug panel showing AdSense slot details
- `AdSenseTestComponent.tsx` — AdSense test rendering
- `AdSenseTroubleshooter.tsx` — Interactive AdSense diagnostics
- `ConsentDebugger.tsx` — Consent state debug display

And a debug API route:
- `src/app/api/debug-log/route.ts` — Accepts log entries from ticker debug component

These must be removed before the site is considered production-ready. Each exposed route:
1. **Signals technical immaturity** — Any journalist, PR person, or researcher who finds `/timeline-debug` will conclude the site is not polished
2. **Reveals internal implementation details** — Sanity schema structure, component architecture, ad unit IDs
3. **Creates potential attack surface** — `/api/debug-log` accepts arbitrary POST data with no authentication
4. **Pollutes analytics** — Traffic to these routes appears in Google Analytics, skewing data

## Background & Context

This is a housekeeping issue with zero new feature work. The implementation pattern is:

**Option A (Preferred for routes still needed in development):** Gate with `NODE_ENV` check, calling `notFound()` in production. This preserves the utility locally without exposing it publicly.

**Option B (For dead code with no future development value):** Outright deletion. Simpler, cleaner. Fewer files = lower maintenance burden.

The safe approach is to audit imports before deleting — any component that is imported in a non-debug production file must have its import removed first, or the build will fail.

## Audit Required Before Deletions

Before any deletions, run these searches to confirm import scope:

```bash
# Find all imports of debug components
grep -r "AdDebugger\|TestAd\|ConsentDebugger\|AdSenseTroubleshooter\|AdSenseTest" src/ --include="*.tsx" --include="*.ts"

# Find all imports from the debug directory
grep -r "from.*components/debug" src/ --include="*.tsx" --include="*.ts"

# Find all references to the debug API route
grep -r "debug-log\|debugLog" src/ --include="*.tsx" --include="*.ts"
```

These searches must be reviewed before any deletions to identify all files needing import cleanup.

## Proposed Solution

### Routes to Delete (or Gate)

#### Timeline Debug Routes

```
src/app/(user)/timeline-debug/          → DELETE directory
src/app/(user)/timeline-simple-test/    → DELETE directory
src/app/(user)/timeline-test/           → DELETE directory
```

If any are still actively used during local development, apply the `NODE_ENV` guard instead:

```typescript
// src/app/(user)/timeline-debug/page.tsx
import { notFound } from 'next/navigation'

export default function TimelineDebugPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }
  // ... existing debug content
}
```

#### Debug Components

```
src/components/debug/TestAd.tsx              → DELETE (if no production imports)
src/components/debug/TestAdComponent.tsx     → DELETE (if no production imports)
src/components/debug/AdDebugger.tsx          → DELETE (if no production imports)
src/components/debug/AdSenseTestComponent.tsx → DELETE (if no production imports)
src/components/debug/AdSenseTroubleshooter.tsx → DELETE (if no production imports)
src/components/debug/ConsentDebugger.tsx     → DELETE (if no production imports)
```

If any debug component is imported in debug route pages only (and those pages are being deleted), delete the component after deleting the route. If any is imported in a production page, remove that import first.

#### Debug API Route

```
src/app/api/debug-log/route.ts → DELETE
```

Before deleting, confirm no production component calls `fetch('/api/debug-log', ...)`. If the ticker component calls it, remove that `fetch` call first.

The correct approach for any server-side debugging is to use Vercel's built-in function logging (`console.log` → visible in Vercel dashboard).

### Post-Deletion Verification

```bash
# After deletions, verify no broken imports:
pnpm build

# Check for any remaining references:
grep -r "timeline-debug\|timeline-test\|debug-log\|AdDebugger\|TestAd" src/ --include="*.tsx" --include="*.ts"
```

## Implementation Plan

1. **Audit imports** — Run grep for all imports of debug components and API route references. Document which non-debug files (if any) reference these components.
2. **Remove production imports** — For any production file that imports a debug component, remove the import and the component usage.
3. **Delete debug API route** — Delete `src/app/api/debug-log/route.ts`. Remove any `fetch('/api/debug-log')` calls from components (likely the ticker component).
4. **Delete debug components** — Delete `src/components/debug/` directory. If any component still has a reference somewhere, fix it first.
5. **Delete or gate debug routes** — Delete timeline debug directories. If any are needed locally, apply `NODE_ENV === 'production' → notFound()` guard.
6. **Build** — Run `pnpm build` to confirm no TypeScript errors or missing module errors.
7. **Verify** — Deploy to Vercel preview; confirm the three routes return 404.

## Files to Delete

```
src/app/(user)/timeline-debug/page.tsx (and directory)
src/app/(user)/timeline-simple-test/page.tsx (and directory)
src/app/(user)/timeline-test/page.tsx (and directory)
src/components/debug/TestAd.tsx
src/components/debug/TestAdComponent.tsx
src/components/debug/AdDebugger.tsx
src/components/debug/AdSenseTestComponent.tsx
src/components/debug/AdSenseTroubleshooter.tsx
src/components/debug/ConsentDebugger.tsx
src/app/api/debug-log/route.ts
```

## Files Potentially Modified

```
src/components/global/Ticker.tsx (if it calls /api/debug-log)
src/app/(user)/layout.tsx (if it renders any debug component)
Any other file shown by the import audit grep
```

## Deliverables Checklist

### Pre-Deletion Audit
- [ ] `grep -r "from.*components/debug"` run and results reviewed
- [ ] All files importing debug components identified
- [ ] `grep -r "debug-log"` run — ticker or other component imports noted
- [ ] `grep -r "timeline-debug\|timeline-test"` run — any links to these routes identified and removed
- [ ] Decision documented: delete or NODE_ENV gate for each route

### Import Cleanup (if needed)
- [ ] Any production-page imports of `AdDebugger` removed
- [ ] Any production-page imports of `TestAd` / `TestAdComponent` removed
- [ ] Any production-page imports of `ConsentDebugger` removed
- [ ] Any production-page imports of `AdSenseTestComponent` / `AdSenseTroubleshooter` removed
- [ ] `fetch('/api/debug-log', ...)` removed from `Ticker.tsx` or other components
- [ ] Any nav links or direct `<Link href="/timeline-debug">` references removed

### Deletions
- [ ] `src/app/(user)/timeline-debug/` directory deleted (or `notFound()` guard added)
- [ ] `src/app/(user)/timeline-simple-test/` directory deleted (or `notFound()` guard added)
- [ ] `src/app/(user)/timeline-test/` directory deleted (or `notFound()` guard added)
- [ ] `src/components/debug/TestAd.tsx` deleted
- [ ] `src/components/debug/TestAdComponent.tsx` deleted
- [ ] `src/components/debug/AdDebugger.tsx` deleted
- [ ] `src/components/debug/AdSenseTestComponent.tsx` deleted
- [ ] `src/components/debug/AdSenseTroubleshooter.tsx` deleted
- [ ] `src/components/debug/ConsentDebugger.tsx` deleted
- [ ] `src/components/debug/` directory deleted (if empty)
- [ ] `src/app/api/debug-log/route.ts` deleted

### Verification
- [ ] `pnpm build` passes with zero TypeScript errors
- [ ] `pnpm build` shows no "Module not found" errors
- [ ] No `console.error` about missing modules during build
- [ ] `GET /timeline-debug` returns 404 in local dev (if deleted) or production (if gated)
- [ ] `GET /timeline-simple-test` returns 404
- [ ] `GET /timeline-test` returns 404
- [ ] `POST /api/debug-log` returns 404
- [ ] Vercel preview deployment shows no runtime errors from removed components
- [ ] Google Search Console: submit URL removal requests for any debug pages already indexed
- [ ] `robots.txt` does not reference any of the deleted routes
