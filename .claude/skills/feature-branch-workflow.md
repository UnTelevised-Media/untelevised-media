# Feature Branch Workflow — UnTelevised Media

Step-by-step guide for creating, developing, and merging feature branches in this project.

---

## Quick Start

```bash
# 1. Start from development
git checkout development
git pull origin development

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Work & commit
# (make changes with conventional commits)

# 4. Push to remote
git push origin feature/your-feature-name

# 5. Create Pull Request on GitHub
# (request review, address feedback)

# 6. Merge with --no-ff
git merge --no-ff feature/your-feature-name

# 7. Delete branch (after main/production merge)
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## Detailed Workflow

### 1. Prepare Your Local Repository

Always start from a clean, up-to-date `development` branch:

```bash
git checkout development
git pull origin development
git status  # Verify working tree is clean
```

If your working tree has changes, either commit them or stash:
```bash
git stash  # Temporarily save changes
# ... switch branches ...
git stash pop  # Restore changes later
```

---

### 2. Create Feature Branch

Branch naming follows the pattern: `feature/[description]`, `fix/[description]`, `chore/[description]`, etc.

Use hyphens for multi-word names; keep names short and descriptive:

```bash
# Good examples:
git checkout -b feature/youtube-embed-fallback
git checkout -b fix/hydration-error-ticker
git checkout -b feature/image-gallery-carousel

# Not recommended:
git checkout -b my-awesome-feature  # Too vague
git checkout -b feature/wip          # Incomplete
```

---

### 3. Develop on Your Branch

Make changes to your code:

```bash
# Edit files
vim src/components/MyComponent.tsx
vim src/lib/myUtils.ts

# Stage changes
git add src/components/MyComponent.tsx src/lib/myUtils.ts

# Commit with conventional format
git commit -m "feat(components): add MyComponent with prop validation"
```

**Important:** Use [Conventional Commit](./commit-message-conventions.md) format for all commits.

Make small, logical commits. Don't commit everything at the end.

```bash
# Good: Multiple focused commits
git commit -m "feat(gallery): add image carousel component"
git commit -m "feat(gallery): add auto-rotation to carousel"
git commit -m "feat(gallery): add keyboard navigation"

# Not ideal: One massive commit
git commit -m "add gallery feature with carousel, rotation, and keyboard nav"
```

---

### 4. Push to Remote

Push your branch regularly (at least once per day, or after completing a logical section):

```bash
git push origin feature/your-feature-name
```

**First push?** Git will prompt you to set upstream tracking:
```bash
git push -u origin feature/your-feature-name
```

After that, simple `git push` will work.

---

### 5. Keep Your Branch Updated

If `development` receives new commits while you're working, sync your branch:

```bash
git fetch origin
git rebase origin/development
# OR
git merge origin/development  # Keeps merge history if you prefer
```

**Prefer rebase over merge** to keep feature history clean, unless you specifically want merge commits for documentation.

If you get conflicts:
```bash
# Resolve conflicts in your editor
git add src/conflicted-file.ts
git rebase --continue  # (or git merge --continue if merging)
```

---

### 6. Create Pull Request

Once your feature is complete:

1. **Push to remote** (if not already pushed)
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Go to GitHub** and create a PR:
   - Title: Concise summary (e.g., "Add YouTube embed fallback system")
   - Description: Include:
     - What problem does this solve?
     - How does it work?
     - Any testing notes
     - Screenshots/demos (if UI change)
     - Breaking changes (if applicable)
   - Target branch: `development`
   - Request reviewers

3. **Example PR description:**
   ```
   ## Summary
   Implements hybrid YouTube embed system with smart fallback for age-restricted videos.
   
   ## Changes
   - New `YouTubeEmbed.tsx` component with IFrame API support
   - Fallback to basic iframe with timeout detection
   - Safe SSR initialization via lazy loading
   
   ## Testing
   - Tested with age-restricted videos
   - Verified timeout fallback at 5s
   - Checked hydration safety on SSR pages
   
   ## Screenshots
   [attach screenshot showing embed in action]
   ```

---

### 7. Respond to Review Feedback

When reviewers comment:

1. **Read feedback carefully** — Ask for clarification if needed (reply in PR)
2. **Make changes** on your branch
   ```bash
   # Fix the issue
   vim src/components/YouTubeEmbed.tsx
   git add src/components/YouTubeEmbed.tsx
   git commit -m "refactor: improve error handling in YouTubeEmbed"
   git push origin feature/your-feature-name
   ```
3. **Reply to comments** — Mark as resolved when fixed
4. **Re-request review** if needed

**Do not squash during review** — Keep all commits visible. They'll be squashed during merge if needed (unlikely in this project).

---

### 8. Merge to Development

Once approved:

1. **Ensure your branch is up-to-date:**
   ```bash
   git fetch origin
   git rebase origin/development
   git push origin feature/your-feature-name
   ```

2. **Switch to development and merge:**
   ```bash
   git checkout development
   git pull origin development
   git merge --no-ff feature/your-feature-name
   ```

   This creates a **merge commit** (preserves feature history):
   ```
   Merge branch 'feature/youtube-embed-fallback'
   ```

3. **Push the merge:**
   ```bash
   git push origin development
   ```

**Never squash** unless explicitly told. Merge commits preserve feature context in the history.

---

### 9. Delete Feature Branch

**Only after** `development` is merged into `main` or `production`:

```bash
# Delete locally
git branch -d feature/your-feature-name

# Delete on remote
git push origin --delete feature/your-feature-name
```

To verify it's deleted:
```bash
git branch -a  # Should not show feature/your-feature-name
```

---

## Common Scenarios

### Scenario: Working on Multiple Features

You can have multiple feature branches. Switch between them:

```bash
git checkout feature/gallery-carousel
# ... work and commit ...

git checkout feature/youtube-fallback
# ... work and commit ...

git checkout feature/gallery-carousel  # Back to first feature
```

Each branch is independent and can be pushed/merged separately.

---

### Scenario: You Committed to `development` by Mistake

If you committed directly to `development` instead of a feature branch:

```bash
# Create a feature branch from current position
git branch feature/new-feature-name

# Reset development to before your commits
git checkout development
git reset --hard origin/development

# Your commits are safe in feature/new-feature-name
git checkout feature/new-feature-name
```

---

### Scenario: Your Branch is Stale (Many Commits Behind)

If `development` has moved far ahead:

```bash
git fetch origin
git rebase origin/development

# If conflicts arise, resolve them:
# vim src/conflicted-file.ts
git add src/conflicted-file.ts
git rebase --continue

git push origin feature/your-feature-name --force-with-lease
```

Use `--force-with-lease` (safer than `--force`) to prevent accidentally overwriting others' work.

---

### Scenario: You Need to Switch Branches Mid-Work

If you need to switch branches but have uncommitted changes:

```bash
# Option 1: Commit your work
git add .
git commit -m "wip: incomplete feature work"  # Mark as work-in-progress

# Option 2: Stash your work
git stash
git checkout other-branch
# ... do other work ...
git checkout feature/your-feature-name
git stash pop  # Restore your work
```

---

## Best Practices

✅ **Do**
- Create a new branch for each feature/fix
- Commit frequently with clear messages
- Push regularly to avoid losing work
- Request review before merging
- Keep branches focused (one feature per branch)
- Pull/rebase to stay in sync with `development`

❌ **Don't**
- Work directly on `development`, `main`, `staging`, or `production`
- Push to someone else's feature branch without permission
- Merge your own feature (always get review)
- Leave stale branches around (delete after merge)
- Commit large unrelated changes together
- Use vague branch names like `feature/fix` or `wip`

---

## Related Skills

- **[Branching Strategy](./branching-strategy.md)** — Understanding the overall branch structure
- **[Commit Message Conventions](./commit-message-conventions.md)** — How to write good commit messages
