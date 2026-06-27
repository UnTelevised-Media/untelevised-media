# Commit Message Conventions — UnTelevised Media

Standard format and best practices for all commit messages in this project.

Based on [Conventional Commits](https://www.conventionalcommits.org/) specification.

---

## Format

```
type(scope): short description (50 chars max)

Optional body paragraph(s) explaining the change in more detail.
Can span multiple lines. Wrap at ~72 characters.

Closes #123  (optional: issue references)

Co-Authored-By: Name <email>
```

---

## Structure

### Type (Required)

Indicates the **kind** of change:

| Type | Usage | Example |
|------|-------|---------|
| `feat` | New feature | `feat: add image gallery carousel` |
| `fix` | Bug fix | `fix: resolve hydration error in ticker` |
| `perf` | Performance improvement | `perf: optimize image loading with preconnect` |
| `refactor` | Code restructuring (no behavior change) | `refactor: simplify YouTube embed logic` |
| `docs` | Documentation only | `docs: update README with Docker instructions` |
| `style` | Formatting, whitespace, missing semicolons | `style: format code with Prettier` |
| `test` | Add/update tests | `test: add unit tests for gallery carousel` |
| `chore` | Build, deps, tooling, version bumps | `chore: bump Next.js to 16.2.7` |

### Scope (Optional but Recommended)

Indicates **which part** of the codebase is affected:

```
feat(components): add gallery carousel
feat(docker): add Dockerfile and compose config
fix(portal): resolve brief key repair logic
perf(images): convert PNG to WebP format
docs(deployment): add CoolaFly guide
```

**Scope examples:**
- `components` — React components
- `docker` — Docker/containerization
- `portal` — Content management portal
- `images` — Image handling/optimization
- `seo` — SEO/metadata
- `api` — API routes
- `deployment` — Deployment/infrastructure
- `db` — Database/Supabase
- Specific feature name: `youtube`, `gallery`, `membership`, etc.

### Description (Required)

Short (50 characters max), imperative tense, lowercase, no period:

```
✅ Good:
feat(components): add image gallery carousel
fix: resolve React hydration error
perf: optimize Clerk preconnect hint

❌ Not good:
Added the image gallery feature
Fixed a bug in the ticker
Performance improvements made
feat: Added image gallery to the components folder
```

**Use imperative:** "add", "fix", "refactor", "optimize" — not "added", "fixes", "refactored"

---

## Body (Optional)

Use the body to explain **what** and **why**, not **how**:

```
feat(docker): add multi-stage Dockerfile and GitHub Actions workflow

The application is now containerized for easier deployment.
Multi-stage build reduces image size by separating build and runtime.
GitHub Actions workflow automatically builds and pushes images to Docker Hub.

This enables CoolaFly deployment and improves production reliability.
```

**Guidelines for body:**
- Separate from subject with a blank line
- Wrap at ~72 characters
- Focus on **why** the change was made
- Explain non-obvious decisions
- Can span multiple paragraphs

---

## References (Optional)

Link to issues, PRs, or other commits:

```
Closes #123
Fixes #456
Related to #789
See also #101
```

Place at the end, after the body (or after subject if no body).

---

## Breaking Changes (Important)

If your change **breaks** existing functionality, add `BREAKING CHANGE:` footer:

```
feat(api): redesign /api/view endpoint

The /api/view endpoint now requires authentication.
Old unauthenticated calls will receive 401 Unauthorized.

BREAKING CHANGE: /api/view no longer accepts anonymous requests
```

For major version bumps, breaking changes should be clearly noted.

---

## Co-Authoring

If multiple people worked on a commit, add co-authors:

```
feat(gallery): add image carousel with auto-rotation

Co-Authored-By: Jane Doe <jane@example.com>
Co-Authored-By: John Smith <john@example.com>
```

Each co-author gets their own line at the end.

---

## Real-World Examples

### New Feature

```
feat(components): add YouTube embed with fallback system

Implements hybrid YouTube embed that attempts IFrame API for 
age-restricted videos, falls back to basic iframe with timeout 
detection. Improves compatibility with restricted content.

Closes #418
```

### Bug Fix

```
fix(portal): resolve brief key repair on storyPasses array

The storyPasses array in briefs was missing _key fields on mutation,
causing Sanity client errors. Added repair endpoint and migration
script to fix existing data.

Fixes #44
```

### Performance Improvement

```
perf(images): convert all public PNG assets to WebP format

Reduced image file sizes by 40% average. Added conversion scripts
for future PNG additions. All favicons, logos, and branded assets
now WebP with quality presets per image type.

Related to #102
```

### Refactoring

```
refactor(lib): consolidate duplicate formatDate implementations

Found 5 identical formatDate functions across utilities. Consolidated
into src/util/formatting.ts with shared import. No behavior change.
```

### Documentation

```
docs(deployment): add CoolaFly Ubuntu server setup guide

Added DEPLOYMENT_COOLAFLY.md with step-by-step instructions for
deploying on CoolaFly infrastructure. Covers SSH, Docker, systemd,
and health monitoring.
```

### Chore / Version Bump

```
chore(release): version 3.0.0 — Docker deployment & image optimization

Major release with Docker containerization, complete PNG-to-WebP conversion,
YouTube embed improvements, and performance enhancements.

See CHANGELOG.md for full details.
```

---

## Tips for Great Commits

### ✅ Make Small, Focused Commits

```
✅ Better (3 logical commits):
commit 1: feat(gallery): add image carousel component
commit 2: feat(gallery): add auto-rotation to carousel
commit 3: feat(gallery): add keyboard navigation

❌ Worse (1 massive commit):
feat(gallery): add complete gallery feature with carousel rotation keyboard nav and all styling
```

### ✅ Commit Early and Often

Don't wait until the end of the day. Commit when you finish each logical piece:

```bash
git add src/components/ImageGallery.tsx
git commit -m "feat(gallery): add image carousel component"

# ... more work ...

git add src/lib/galleryUtils.ts
git commit -m "feat(gallery): add keyboard navigation helpers"
```

### ✅ Separate Refactoring from Functional Changes

```
❌ Bad:
feat(components): refactor YouTube embed and add timeout fallback

✅ Good:
refactor(components): simplify YouTube embed structure
feat(components): add timeout fallback for iframe loads
```

### ✅ Use Issue Numbers

Link commits to issues for traceability:

```
fix(#418): resolve React hydration error in LatestAlertsTicker
```

Or in the footer:

```
fix: resolve React hydration error in LatestAlertsTicker

Closes #418
```

### ✅ Write for Your Future Self

Imagine reading this commit message 6 months from now. Will you understand why this change was made?

```
❌ Unclear:
fix: update image loader

✅ Clear:
fix: correct custom image loader for public static image handling

The image loader was throwing 404s for files in /public. Fixed by 
ensuring loader checks local filesystem before delegating to Sanity CDN.
```

---

## Common Mistakes

| ❌ Mistake | ✅ Correction |
|-----------|--------------|
| `feat: Added new component` | `feat: add new component` |
| `fix(#123): resolve bug` | `fix: resolve bug\n\nCloses #123` |
| Subject longer than 50 chars | Shorten subject, move detail to body |
| `git commit -m "WIP"` | Use real commit messages; commit more often |
| Multiple unrelated changes | Split into separate commits |
| No scope | Add scope: `feat(docker): ...` |
| `feat: refactor AND add new feature` | Split: separate refactor and feat commits |

---

## Integration with Git Tools

### Git Log Readability

Good commit messages make `git log` useful:

```bash
$ git log --oneline
3a5f2e1 feat(gallery): add auto-rotation to carousel
c8b9d4e feat(gallery): add image carousel component
9f2a7e8 fix(#418): resolve hydration error in ticker
4d1b5c3 perf: add preconnect for Clerk
```

You can quickly scan the history and understand what happened.

### Commit Search

Conventional format enables searching:

```bash
# Find all fixes
git log --grep="^fix"

# Find all performance improvements
git log --grep="^perf"

# Find commits related to gallery
git log --grep="gallery"
```

### Release Notes Generation

With conventional commits, changelog generation can be automated:
- All `feat:` commits → "Features"
- All `fix:` commits → "Bug Fixes"
- All `BREAKING CHANGE:` → "Breaking Changes"

---

## Related Skills

- **[Feature Branch Workflow](./feature-branch-workflow.md)** — When and how to commit
- **[Branching Strategy](./branching-strategy.md)** — Context around commits in the overall workflow
