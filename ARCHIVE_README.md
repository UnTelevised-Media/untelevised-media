# Article Archive System

Complete system for archiving UnTelevised Media articles with markdown bodies, metadata, and images in a single pass.

## Quick Start

### Archive a Single Article
```bash
# Archive new article as it's published
node scripts/archive-article.mjs article-slug-here

# Example:
node scripts/archive-article.mjs kashmir-s-unbroken-revolution-the-mass-uprising-pakistan-doesn-t-want-you-to-see
```

### Archive All Articles
```bash
# Full archive run (takes ~5-10 minutes)
node scripts/archive-article.mjs
```

### Update Existing Article
```bash
# Re-archive an article (overwrites markdown, metadata, and images)
node scripts/archive-article.mjs article-slug
```

### Get Help
```bash
node scripts/archive-article.mjs --help
```

## What Gets Archived

For each article, the script creates:

1. **Markdown file** (`[slug].md`)
   - Article body converted from Sanity Portable Text
   - Preserves all formatting: bold, italic, links, lists, blockquotes, code blocks
   - Image references preserved as HTML comments with metadata

2. **Metadata JSON** (`[slug].json`)
   - Complete article metadata
   - Author name resolved from reference
   - All fields except `sources`, `body`, `_rev`, `_createdAt`

3. **Images folder** (`[slug]/`)
   - All images downloaded from Sanity
   - Named sequentially: `image-1.webp`, `image-2.jpg`, etc.
   - `images.json` metadata with alt text, captions, credits

## Directory Structure

```
archive/
├── Articles/                          # Markdown & metadata
│   ├── kashmir-s-unbroken-revolution-the-mass-uprising-pakistan-doesn-t-want-you-to-see.md
│   ├── kashmir-s-unbroken-revolution-the-mass-uprising-pakistan-doesn-t-want-you-to-see.json
│   ├── the-death-of-nolan-wells-a-story-that-doesn-t-add-up.md
│   ├── the-death-of-nolan-wells-a-story-that-doesn-t-add-up.json
│   └── ... (209 articles)
│
└── Images/                            # Downloaded images
    ├── kashmir-s-unbroken-revolution-the-mass-uprising-pakistan-doesn-t-want-you-to-see/
    │   ├── image-1.webp
    │   ├── image-2.webp
    │   └── images.json
    ├── the-death-of-nolan-wells-a-story-that-doesn-t-add-up/
    │   ├── image-1.webp
    │   ├── image-2.webp
    │   ├── image-3.webp
    │   └── images.json
    └── ... (168 articles with images)
```

## Workflow Examples

### Publishing a New Article

1. **Publish article in Sanity Studio**
2. **Archive it**:
   ```bash
   node scripts/archive-article.mjs new-article-slug
   ```
3. **Commit to Git**:
   ```bash
   git add archive/
   git commit -m "archive: add new article - new-article-slug"
   git push
   ```

### Updating Published Article

1. **Update article in Sanity Studio** (edit body, add images, etc.)
2. **Re-archive it** (overwrites markdown and images):
   ```bash
   node scripts/archive-article.mjs article-slug
   ```
3. **Commit changes**:
   ```bash
   git add archive/
   git commit -m "archive: update article - article-slug"
   git push
   ```

### Bulk Re-archive (After Major Edits)

```bash
# Re-archive all articles
node scripts/archive-article.mjs
```

## File Formats

### Markdown (`[slug].md`)

Contains article body with all formatting:

```markdown
# Heading

Paragraph with **bold** and *italic* text.

- Bullet list item 1
- Bullet list item 2
  - Nested bullet
  
1. Numbered list item 1
2. Numbered list item 2

[Link text](https://example.com)

> Blockquote text here

```python
code block
```

<!-- IMAGE alt="Description" asset="image-xxxxx" caption="Image caption" credit="Photo credit" -->
```

### Metadata JSON (`[slug].json`)

```json
{
  "_id": "article-id",
  "title": "Article Title",
  "slug": { "current": "article-slug" },
  "description": "Short description",
  "leadParagraph": "2-3 sentence summary",
  "author": {
    "_ref": "author-id",
    "_type": "reference",
    "name": "Author Name"
  },
  "publishedAt": "2026-07-11T00:00:00.000Z",
  "updatedAt": "2026-07-11T12:00:00.000Z",
  "location": "New York, NY",
  "categories": [...],
  "tags": [...],
  "keywords": [...],
  "featured": false,
  "breakingNews": true,
  "seo": {...},
  "faqs": [...],
  ...
}
```

### Image Metadata (`[slug]/images.json`)

```json
{
  "slug": "article-slug",
  "totalImages": 3,
  "downloadedAt": "2026-07-11T07:37:38.824Z",
  "images": [
    {
      "index": 0,
      "filename": "image-1.webp",
      "alt": "Image description for accessibility",
      "caption": "Image caption shown to readers",
      "credit": "Photo credit attribution",
      "asset": "image-xxxxx-widthxheight-format",
      "downloaded": true
    }
  ]
}
```

## Command Options

```bash
node scripts/archive-article.mjs [slug] [options]

Options:
  --archive-dir PATH    Markdown & metadata output (default: archive/Articles)
  --images-dir PATH     Images output (default: archive/Images)
  --help                Show help message

Examples:
  # Archive one article
  node scripts/archive-article.mjs article-slug

  # Archive all articles
  node scripts/archive-article.mjs

  # Custom output directories
  node scripts/archive-article.mjs article-slug --archive-dir backups/articles --images-dir backups/images

  # Re-archive everything
  node scripts/archive-article.mjs --archive-dir archive/Articles --images-dir archive/Images
```

## How It Works

### 1. Query Sanity
- Fetches article by slug (or all articles)
- Gets body (Portable Text), metadata, and author references

### 2. Convert Body
- Converts Portable Text → Markdown
- Handles all formatting types:
  - Headings (H1-H6)
  - Text formatting (bold, italic, code)
  - Links
  - Lists (bullet and numbered, with nesting)
  - Blockquotes
  - Code blocks with language
  - Tables
  - Mermaid diagrams
  - Image references (as HTML comments)

### 3. Resolve Author
- Fetches all authors from Sanity
- Resolves author reference to author name
- Includes both `_ref` (ID) and `name` in metadata

### 4. Extract & Download Images
- Parses markdown for image references
- Queries Sanity API for image URLs
- Downloads from Sanity CDN
- Auto-detects image format (WebP, JPG, PNG, GIF)
- Saves to `archive/Images/[slug]/image-N.[ext]`
- Creates `images.json` with image metadata

### 5. Save Files
- Markdown body: `archive/Articles/[slug].md`
- Metadata: `archive/Articles/[slug].json`
- Images: `archive/Images/[slug]/image-*.{webp,jpg,png,gif}`
- Image info: `archive/Images/[slug]/images.json`

## Performance

Typical times:
- **Single article** (with 3-5 images): ~5-10 seconds
- **All articles** (209 articles, 550 images): ~3-5 minutes
- **Network dependent**: Download speed depends on image sizes

## Troubleshooting

### "Missing Sanity configuration"
- Check `.env.local` exists with `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`

### "No articles found"
- Slug may be incorrect - check Sanity Studio for correct slug
- Article may not be published

### "Failed to download image"
- Image may have been deleted in Sanity
- Check image.json to see which images failed
- Re-run script to retry failed images

### "Script timeout"
- Archiving 200+ articles takes time; be patient
- For faster processing, archive articles individually as they're published

## Integration with CI/CD

Automate archiving with GitHub Actions:

```yaml
name: Archive Article
on:
  workflow_dispatch:
    inputs:
      slug:
        description: 'Article slug'
        required: true

jobs:
  archive:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: node scripts/archive-article.mjs ${{ github.event.inputs.slug }}
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "archive: ${{ github.event.inputs.slug }}"
```

## Git Strategy

Recommended workflow:

```bash
# Archive article
node scripts/archive-article.mjs new-article-slug

# Review changes
git status
git diff archive/Articles/new-article-slug.md

# Commit
git add archive/
git commit -m "archive: add new article - new-article-slug

- Markdown body
- Metadata with author
- 5 images downloaded"

# Push
git push
```

## Maintenance

### Re-archive All
Useful after updates or system changes:

```bash
rm -rf archive/Articles archive/Images
node scripts/archive-article.mjs
git add archive/
git commit -m "chore: rebuild article archive"
```

### Archive Specific Articles
Archive only articles from a date range (manually):

```bash
# Archive 3 articles
node scripts/archive-article.mjs article-1
node scripts/archive-article.mjs article-2
node scripts/archive-article.mjs article-3
```

## Archive Statistics

Current archive (as of 2026-07-11):
- **Articles archived**: 209
- **Total images**: 550
- **Archive size**: ~133 MB
- **Directory structure**: Git-friendly, easily portable

## Supporting Scripts

Also available:

- `scripts/archive-article.mjs` — Unified archiver (this script)
- `scripts/download-archive-images.mjs` — Download images only
- `tools/portable-text-to-markdown.py` — Portable Text → Markdown converter
- `tools/archive-articles.ts` — TypeScript implementation

## Questions?

Check the generated files:
- `ARCHIVE_SUMMARY.md` — Archive system overview
- `IMAGES_ARCHIVE_SUMMARY.md` — Images archive details
- `archive/Articles/[slug].json` — Any article's metadata
- `archive/Images/[slug]/images.json` — Any article's image info
