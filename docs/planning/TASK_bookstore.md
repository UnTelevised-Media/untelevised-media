# Task: Continue Bookstore Feature Implementation (Issue #46)

## Context — Read This First

We had a branch conflict situation that has since been fully resolved and the branches have been reset. You are good to start coding again.

**Current state:**

- You are on branch `feat/issue-46-bookstore` — this is the correct branch, stay on it
- Some work was already done in a prior session. Before writing any new code, audit what has already been completed by reading:
  1. `git log --oneline` — see all commits on this branch
  2. `CHANGELOG.md` — see what phases/steps were logged
  3. Scan `src/app/(user)/bookstore/`, `src/app/api/bookstore/`, `src/lib/shop/`, `src/models/schema/` to see what files already exist

**Do not re-implement anything that already exists.** Pick up from the next incomplete step.

---

## Full Spec

The complete feature spec and step-by-step plan is in GitHub issue #46: https://github.com/UnTelevised-Media/untelevised-media-new/issues/46

Read the full issue before writing any code. It contains all schemas, database tables, API routes, pages, dashboard sections, and the 6-phase implementation plan.

---

## Rules — Follow These Exactly

- **Stay on `feat/issue-46-bookstore`** — do not switch branches or create new ones
- **Work through the phases in order** (Phase 1 → 6) as defined in the issue, skipping steps already done
- **After completing each numbered step**, do two things before moving to the next:
  1. Commit all changed files: `git commit -m "feat(bookstore): [brief description of step]"`
  2. Add an entry to `CHANGELOG.md` under `[Unreleased]`
- **Every 3–4 steps**, update GitHub issue #46 with a progress comment using `gh issue comment 46 --body "..."` — summarise what was just completed and what's next. You can derive this from `git log --oneline` and `CHANGELOG.md`
- **Never batch multiple steps into one commit** — one step, one commit
- **Never skip a step** — if blocked (e.g. missing env var), add a `<!-- TODO: needs env var X -->` comment in the relevant file, commit what you have, and continue
- **Match existing code style** — read nearby files before writing new ones; use the same import patterns, component structure, and Tailwind conventions
- **Brand consistency** — `bg-untele` / `text-untele` / `border-untele` for all CTAs and accents; no rounded corners on cards; sharp news-site aesthetic
- **Package manager is pnpm** — `pnpm add`, never `npm install`
- **Do not modify files outside the feature scope** without a clear reason

## Environment Variables

Any new env vars (Supabase shop keys, Stripe webhook secret, Resend key) that don't yet exist should be added as placeholder comments in `.env.local`:

```
# SUPABASE_SHOP_URL=        # TODO: add value — Supabase shop project URL
```

Do not leave broken imports that crash the app if a var is missing.

---

## When All Phases Are Complete

1. Run `pnpm build` — fix any TypeScript or build errors before continuing
2. Ensure `CHANGELOG.md` [Unreleased] section accurately reflects all work
3. Post a final summary comment on issue #46: `gh issue comment 46 --body "..."`
4. Push the branch and open a PR against `main` with:
   - Title: `feat(bookstore): full e-commerce platform for literary authors`
   - Body: what was implemented, what requires manual setup (Supabase project, Stripe product IDs in Sanity, env vars), anything deferred
   - `Closes #46` in the body
