# Branching Strategy — UnTelevised Media

Complete guide to the project's git branching model, branch purposes, and standard workflows.

---

## Branch Purposes

### `main` — Release Branch
- **Purpose:** Stable release tracking and version control
- **Protection:** Merge-only (no direct commits)
- **Trigger:** Tagged releases for internal tracking of stable versions
- **Audience:** Release history, version auditing, rollback reference
- **Merges from:** `development` (after feature completion) or emergency hotfixes

### `development` — Development Branch
- **Purpose:** Integration branch where all feature development converges
- **Protection:** PR review required before merge
- **Audience:** Day-to-day development; base branch for all new features
- **Merges from:** Feature branches, bug fix branches, hotfixes (when applicable)
- **Merges to:** `staging` (for testing), `main` (for releases)

### `staging` — Preview Environment
- **Purpose:** Live preview/testing environment before production release
- **Behavior:** Automatic deployment on merge; full testing required before production
- **Protection:** Merge-only from `development`
- **Audience:** QA testing, client preview, stakeholder review
- **Merges from:** `development` (after staging approval)
- **Merges to:** `production` or `main` (after validation)

### `production` — Live Environment
- **Purpose:** Live production code running on actual infrastructure
- **Behavior:** Automatic Docker image build and push to server on merge/commit
- **Protection:** Strict — only emergency hotfixes or finalized releases
- **Audience:** End users; live traffic
- **Merges from:** Emergency hotfixes only; staging (after full approval)
- **Merges to:** None (final destination)

---

## Standard Workflow

### Feature Development

1. **Create feature branch from `development`**
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/[feature-name]
   ```
   
2. **Work on feature**
   - Make commits with [conventional commit messages](./commit-message-conventions.md)
   - Push regularly to remote: `git push origin feature/[feature-name]`
   
3. **Create Pull Request**
   - Push to remote and create PR against `development`
   - PR title should summarize the feature
   - Include testing notes and any breaking changes
   - Request review from team
   
4. **Review & Merge**
   - Address review feedback
   - Merge with `--no-ff` (merge commit, always)
   - Do NOT squash unless explicitly instructed
   - After merge, branch will be cleaned up automatically (or manually after main/production merge)

5. **Delete feature branch**
   - After `development` is merged into `main` or `production`
   - Both local and remote should be deleted
   - ```bash
     git branch -d feature/[feature-name]
     git push origin --delete feature/[feature-name]
     ```

### Testing Pipeline: `development` → `staging` → `production/main`

1. **Merge to `staging` for QA**
   - After features are merged to `development`
   - Deploy to staging environment (automatic)
   - Full testing by QA and stakeholders
   
2. **Approval & Merge to Production**
   - Once staging is approved and tested
   - Merge `staging` into `production`
   - Docker image automatically builds and pushes to server
   - Live deployment begins
   
3. **Release to `main` (Optional)**
   - After `production` is stable (or at planned release cycles)
   - Bump version in `package.json`
   - Update `CHANGELOG.md` with release notes
   - Merge `development` → `main`
   - Create annotated tag: `git tag -a v[X.Y.Z] -m "Release description"`
   - Push tag: `git push origin v[X.Y.Z]`
   - Create GitHub Release (optional, for significant versions)
   - Merge `main` back into `development` to sync

---

## Hotfix Workflow

**Hotfixes are not routine — explicit instructions will be provided for each hotfix depending on:**
- Bug severity level (critical, high, medium, low)
- Current branch status (what's in staging, production, main)
- Timeline constraints

**General principle:** Hotfixes should branch from the affected environment (`production` for live bugs, `development` for non-urgent fixes) and merge back to all affected branches after testing.

---

## Merge Strategy

- **Default:** Always use `--no-ff` (merge commit) to preserve feature history
  ```bash
  git merge --no-ff feature/[feature-name]
  ```
  
- **Exception:** Only squash when explicitly instructed for the specific merge
  ```bash
  git merge --squash feature/[feature-name]
  git commit -m "..."
  ```

---

## Commit Message Conventions

All commits should follow [Conventional Commits](./commit-message-conventions.md) format:
```
type(scope): short description

Optional longer explanation of changes.

Co-Authored-By: Name <email>
```

**Types:** `feat:`, `fix:`, `perf:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`

---

## Branch Lifecycle

```
[feature/xyz] ─────────────┐
                            ↓
                    [development] ──→ [main] (release tag v3.0.0)
                            ↓                          ↑
                        [staging] ────────────────────┘
                            ↓
                      [production] (Docker deploy)
```

### Branch Cleanup Timeline
- Feature branches are deleted **after `development` is merged into `main` or `production`**
- This prevents accidental re-merging and keeps the branch list clean
- Cleanup applies to both local and remote branches

---

## Key Rules

1. ✅ Always create feature branches from `development`
2. ✅ Always use merge commits (`--no-ff`) unless explicitly told otherwise
3. ✅ Require PR review before merging to `development`
4. ✅ Test in `staging` before merging to `production`
5. ✅ Production merges trigger automatic Docker build + deployment
6. ✅ Delete branches after merge to `main` or `production`
7. ✅ Version bumps and releases are tracked on `main`; not every version needs a release
8. ✅ Hotfix procedures are case-by-case; always ask for explicit instructions

---

## Related Skills

- **[Feature Branch Workflow](./feature-branch-workflow.md)** — Detailed step-by-step guide for creating and managing feature branches
- **[Commit Message Conventions](./commit-message-conventions.md)** — Standard format for all commit messages
