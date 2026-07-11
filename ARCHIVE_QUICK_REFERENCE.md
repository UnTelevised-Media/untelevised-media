# Archive Quick Reference

## One-Line Commands

```bash
# Archive a single article (as it's published)
node scripts/archive-article.mjs article-slug

# Archive all articles (full run)
node scripts/archive-article.mjs

# Get help
node scripts/archive-article.mjs --help
```

## Common Workflows

### Publish New Article → Archive
```bash
# 1. Publish in Sanity Studio
# 2. Run archiver
node scripts/archive-article.mjs new-article-slug

# 3. Commit to Git
git add archive/
git commit -m "archive: add new-article-slug"
git push
```

### Update Article → Re-archive
```bash
# 1. Update article in Sanity (edit body, add images, etc)
# 2. Re-archive (overwrites files)
node scripts/archive-article.mjs article-slug

# 3. Commit updates
git add archive/
git commit -m "archive: update article-slug"
git push
```

### Bulk Re-archive
```bash
# Archive all articles from scratch
rm -rf archive/Articles archive/Images
node scripts/archive-article.mjs
git add archive/
git commit -m "chore: rebuild archive"
git push
```

## What Gets Created

For each article:
```
archive/Articles/article-slug.md              # Body (Markdown)
archive/Articles/article-slug.json            # Metadata (JSON)
archive/Images/article-slug/                  # Images folder
  ├── image-1.webp                            # Actual images
  ├── image-2.webp
  ├── image-3.jpg
  └── images.json                             # Image metadata
```

## File Summary

| File | Purpose |
|------|---------|
| `[slug].md` | Article body in Markdown (human-readable) |
| `[slug].json` | Article metadata (author, date, tags, etc.) |
| `images/[slug]/image-*.{webp,jpg,png}` | Downloaded images |
| `images/[slug]/images.json` | Image alt text, captions, credits |

## Markdown Format

```markdown
# Heading

Paragraph with **bold** and *italic*.

- Bullet list
  - Nested bullet

1. Numbered list
2. Second item

[Link](url)

> Blockquote

<!-- IMAGE alt="..." asset="..." caption="..." credit="..." -->
```

## Metadata Format

Includes:
- `_id`, `title`, `slug`, `description`
- `author` (with name resolved)
- `publishedAt`, `updatedAt`, `eventDate`
- `categories`, `tags`, `keywords`
- `featured`, `breakingNews`, `isFieldReport`
- `seo`, `faqs`, `methodology`, etc.

Excludes:
- `body` (separate markdown file)
- `sources` (as requested)
- `_rev`, `_createdAt`

## Timing

| Task | Time |
|------|------|
| Single article (3-5 images) | 5-10 sec |
| 10 articles | 1-2 min |
| All 209 articles | 3-5 min |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Missing Sanity configuration" | Check `.env.local` for required vars |
| "No articles found" | Verify slug in Sanity Studio |
| "Failed to download image" | Image may be deleted; check images.json |
| Script hangs | Normal for 200+ articles; be patient |

## Environment Variables (in `.env.local`)

```
NEXT_PUBLIC_SANITY_PROJECT_ID=ypejdt32
NEXT_PUBLIC_SANITY_DATASET=articles
NEXT_PUBLIC_SANITY_API_VERSION=2025-06-04
SANITY_API_READ_TOKEN=sk...
```

## Git Workflow

```bash
# Make changes in Sanity Studio

# Archive the article
node scripts/archive-article.mjs article-slug

# Review
git status
git diff archive/

# Commit (include what changed)
git add archive/
git commit -m "archive: add article-slug

- 2,500 word article
- 5 images
- 3 FAQs"

# Push
git push
```

## Output Example

```
════════════════════════════════════════════════════════════
UNIFIED ARTICLE ARCHIVER
════════════════════════════════════════════════════════════
Archive dir: archive/Articles
Images dir:  archive/Images
Target: Single article (kashmir-s-unbroken-revolution)

🔍 Querying Sanity...
✓ Found 1 article(s)

📝 Loading author data...
✓ Loaded 14 authors

────────────────────────────────────────────────────────────

📄 Kashmir's Unbroken Revolution: The Mass Uprising...
   Slug: kashmir-s-unbroken-revolution-...
   Images found: 5
   ✓ Markdown: kashmir-s-unbroken-revolution-....md
   ✓ Metadata: kashmir-s-unbroken-revolution-....json
   Downloading images...
      ✓ image-1.webp
      ✓ image-2.webp
      ✓ image-3.webp
      ✓ image-4.webp
      ✓ image-5.webp
   ✓ Images: 5/5 downloaded

════════════════════════════════════════════════════════════
✅ COMPLETE
════════════════════════════════════════════════════════════
Archived: 1 article(s)
Directory: archive/Articles
Images:   archive/Images

  ✓ kashmir-s-unbroken-revolution (5/5 images)
```

## Script Locations

| Script | Purpose |
|--------|---------|
| `scripts/archive-article.mjs` | **← Main unified archiver (USE THIS)** |
| `scripts/download-archive-images.mjs` | Images only (legacy) |
| `tools/portable-text-to-markdown.py` | Portable Text converter (Python) |
| `tools/archive-articles.ts` | TypeScript implementation (legacy) |

## Tips

1. **Archive often**: Archive articles as they're published for complete version history
2. **Use meaningful commits**: Include article count, image count, changes in commit message
3. **Review before push**: Run `git diff` to verify files before pushing
4. **Backup locally**: Keep a copy of archive/ folder as offline backup
5. **Monitor size**: Archive is ~133 MB; plan accordingly if adding to repository

## Next Steps

- ✅ Archive all published articles
- ✅ Archive each new article as published
- ✅ Archive updates to existing articles
- ⭐ Consider: Automate with GitHub Actions
- ⭐ Consider: Upload archive to S3/GCS for backup
- ⭐ Consider: Generate static site from archive
