# Commit Strategy — UnTelevised Media

Philosophy and best practices for when and how to commit in this project.

Commits are our record of **what happened and why**. A good commit history enables us to quickly identify when issues were introduced, revert problematic changes, and understand design decisions.

---

## Core Principle

**Commit frequently after each logical change. Do not wait for a full feature.**

This is not about finishing features and committing once. It's about committing every time you complete a meaningful piece of work that can stand alone.

---

## Commit Triggers

### Commit When You...

✅ **Update a schema** (Sanity, Supabase, etc.)
```bash
git add src/models/schema/article.ts
git commit -m "feat(schema): add imageGallery field to article"
```

✅ **Create a server action**
```bash
git add src/app/actions/updateProfile.ts
git commit -m "feat(actions): add updateProfile server action"
```

✅ **Change styling or layout**
```bash
git add src/components/Header.tsx
git commit -m "style(header): increase padding and improve spacing"
```

✅ **Fix a bug**
```bash
git add src/lib/utils.ts
git commit -m "fix: correct formatDate timezone handling"
```

✅ **Add a utility function**
```bash
git add src/util/helpers.ts
git commit -m "feat(util): add calculateReadingTime helper"
```

✅ **Update environment variables or config**
```bash
git add .env.example next.config.ts
git commit -m "chore(config): add SUPABASE_URL to env example"
```

✅ **Optimize performance**
```bash
git add src/lib/imageLoader.ts
git commit -m "perf(images): add preloading to ImageGallery"
```

✅ **Add tests**
```bash
git add src/__tests__/formatDate.test.ts
git commit -m "test: add unit tests for formatDate function"
```

---

## Atomic Commits

Each commit should be **atomic**: a self-contained unit of work that represents one logical change.

### ✅ Atomic (Good)

```
Commit 1: feat(schema): add imageGallery field to article
Commit 2: feat(components): create ImageGalleryCarousel component
Commit 3: feat(queries): add imageGallery to article GROQ query
Commit 4: feat(pages): integrate gallery on article page
```

Each commit can stand alone and is easy to review/revert if needed.

### ❌ Non-Atomic (Bad)

```
Commit 1: feat: implement gallery feature

(Changes to schema, component, query, and page all in one commit)
```

If there's a bug in the query, you can't just revert the query commit—you'd have to revert everything.

---

## Frequency Guidelines

### Update Schema → Commit

```bash
# You modify src/models/schema/article.ts
git add src/models/schema/article.ts
git commit -m "feat(schema): add viewCount field to article"

# Don't wait to finish the whole view-tracking feature
```

### Create Component → Commit

```bash
# You create a new component
git add src/components/post/ImageGalleryCarousel.tsx
git commit -m "feat(components): add image carousel with auto-rotation"

# Next, update a page to use it (separate commit)
```

### Add Styling → Commit

```bash
# You adjust spacing, colors, or layout
git add src/components/Header.tsx
git commit -m "style(header): increase logo size and padding"

# Styling changes are separate from behavior changes
```

### Create Server Action → Commit

```bash
# You add new server-side logic
git add src/app/actions/trackView.ts
git commit -m "feat(actions): add trackView server action with rate limiting"

# Don't wait to wire it up in a component
```

### Write Tests → Commit

```bash
# You add test coverage for a utility
git add src/__tests__/youtubeUtils.test.ts
git commit -m "test: add tests for YouTube URL parsing utilities"
```

---

## Related vs Unrelated Changes

### ✅ Related Changes (Same Commit)

Changes that work together to accomplish one goal:

```bash
# Both enable the same feature
git add src/components/YouTubeEmbed.tsx src/util/youtubeUtils.ts
git commit -m "feat: add YouTube embed with URL parsing utilities"

# All needed for the gallery feature
git add src/models/schema/imageGallery.ts \
         src/components/ImageGalleryCarousel.tsx \
         src/lib/sanity/queries.ts
git commit -m "feat(gallery): add schema, component, and queries"
```

These changes are tightly coupled and make sense together.

### ❌ Unrelated Changes (Separate Commits)

Changes that serve different purposes:

```bash
# BAD: Unrelated features in one commit
git commit -m "feat: add gallery and fix footer styling"

# GOOD: Separate commits
git commit -m "feat(gallery): add image carousel component"
git commit -m "fix(footer): correct social icon alignment"
```

Even if you made both changes in one session, split them into separate commits.

---

## During Feature Development

### Timeline: Building a Feature in Multiple Commits

Let's say you're building an image gallery feature:

**Day 1:**
```
Commit 1: feat(schema): add imageGallery field to article
Commit 2: feat(components): add ImageGalleryCarousel component
Commit 3: perf(gallery): add image preloading and auto-rotation
```

**Day 2:**
```
Commit 4: feat(queries): update article GROQ query to include gallery
Commit 5: feat(pages): integrate gallery on article detail page
```

**Day 3:**
```
Commit 6: style(gallery): adjust carousel spacing and button styling
Commit 7: fix(gallery): resolve keyboard navigation edge case
```

**Day 4:**
```
Commit 8: test(gallery): add unit tests for carousel component
Commit 9: docs: add gallery documentation to schema guide
```

Each commit is independently understandable. Someone reviewing the history can see exactly what was added and when.

---

## Benefits of Frequent Commits

### 1. Easy Debugging

When a bug appears, you can narrow it down:

```bash
git log --oneline src/components/YouTubeEmbed.tsx
```

See exactly which commits touched that file. Bisect to find the culprit:

```bash
git bisect start
git bisect bad      # Current version has the bug
git bisect good v3.0.0  # Last known good version
# Git checks out intermediate commits
```

### 2. Revert Specific Changes

If one change breaks something, revert just that commit:

```bash
git revert 9f2a7e8  # Revert only the problematic commit
```

vs. reverting a massive 50-file commit that had both good and bad changes.

### 3. Code Review Clarity

Reviewers see exactly what changed and why:

```
✅ Easy to review:
- Commit 1: Add schema field (5 lines changed)
- Commit 2: Create component (50 lines)
- Commit 3: Update query (3 lines)

❌ Hard to review:
- Commit 1: Implement entire feature (200 lines across 10 files)
```

### 4. Feature Documentation

Your commit history tells the story:

```
feat(gallery): add schema field
feat(gallery): add carousel component
perf(gallery): add preloading
style(gallery): adjust spacing
test(gallery): add unit tests
```

Someone reading this history understands the feature development.

### 5. Blame & History

When someone (including you) asks "why is this here?":

```bash
git blame src/components/YouTubeEmbed.tsx
```

Shows which commit added each line, with message, author, date. That message tells you *why*.

---

## Practical Workflow

### Example: Implementing a New Server Action

```bash
# 1. Create the server action file
vim src/app/actions/submitForm.ts

git add src/app/actions/submitForm.ts
git commit -m "feat(actions): add submitForm server action"

# 2. Add validation (same commit? or separate?)
# If it's part of the action, add to the commit:
git add src/app/actions/submitForm.ts
git commit --amend -m "feat(actions): add submitForm with Zod validation"
# (or in a separate commit if you prefer)

# 3. Add tests
vim src/__tests__/submitForm.test.ts

git add src/__tests__/submitForm.test.ts
git commit -m "test: add submitForm validation tests"

# 4. Wire up in a component
vim src/components/forms/ContactForm.tsx

git add src/components/forms/ContactForm.tsx
git commit -m "feat(forms): integrate submitForm action in ContactForm"

# 5. Add styling for the form
vim src/components/forms/ContactForm.module.css

git add src/components/forms/ContactForm.module.css
git commit -m "style(forms): improve ContactForm spacing and layout"
```

Result: 5 logical commits, each one understandable, each one revertible.

---

## When NOT to Commit

❌ **Don't commit incomplete work:**

```
# Bad: Work-in-progress that doesn't compile
git commit -m "wip: working on gallery carousel"

# Better: Finish the feature, THEN commit
# (or use `git stash` if you need to switch branches)
```

❌ **Don't mix unrelated changes:**

```
# Bad:
git commit -m "feat: add gallery and fix footer and update docs"

# Good: Three separate commits
```

❌ **Don't commit with no message:**

```
# Bad:
git commit -m "."

# Good:
git commit -m "feat(gallery): add image carousel component"
```

---

## When to Amend vs New Commit

### Use `git commit --amend` When...

The new change is part of the same logical unit:

```bash
# Added a function
git commit -m "feat(util): add formatDate helper"

# Realized you forgot error handling, add it
git add src/util/formatDate.ts
git commit --amend --no-edit

# Still one atomic commit, just improved
```

### Use `git commit` (New) When...

The change is a separate logical unit:

```bash
# Added formatDate
git commit -m "feat(util): add formatDate helper"

# Now writing tests for it
git add src/__tests__/formatDate.test.ts
git commit -m "test: add formatDate unit tests"

# Different concern, different commit
```

---

## Merge Strategy Reminder

**Always use `--no-ff` (merge commit)** when merging feature branches:

```bash
git merge --no-ff feature/gallery
```

This preserves the full commit history of the feature. Your frequent, atomic commits are now part of the permanent record.

The merge commit itself documents that these commits were part of one feature:

```
Commit: Merge branch 'feature/gallery'

Parents: main, feature/gallery

Children commits (from feature branch):
  - feat(schema): add imageGallery field
  - feat(components): add carousel
  - perf(gallery): add preloading
  - test(gallery): add tests
```

---

## Real-World Example: Issue Tracking

### Scenario: A Bug in Production

**Problem:** Gallery carousel is jumping on image load.

**Investigation:**

```bash
git log --oneline src/components/ImageGalleryCarousel.tsx

9f2a7e8 perf(gallery): add image preloading
8c3b5d2 fix(gallery): resolve keyboard navigation edge case
7a1c4e9 style(gallery): adjust carousel spacing
6d5e2f1 feat(components): add ImageGalleryCarousel component
```

**Next step:** Check if it's the preloading change:

```bash
git show 9f2a7e8
# See exactly what changed, understand the issue
```

**If it's that commit:**

```bash
git revert 9f2a7e8
# Remove just that change, keep the rest of the feature
```

---

## Related Skills

- **[Feature Branch Workflow](./feature-branch-workflow.md)** — When to push commits
- **[Commit Message Conventions](./commit-message-conventions.md)** — How to write commit messages
- **[Branching Strategy](./branching-strategy.md)** — How commits flow through branches
