# Article Archive System

## Overview
Complete hard-copy archive of all 209 articles from Sanity, converted to human-readable Markdown + JSON metadata.

## Archive Location
`archive/Articles/` — 418 files (209 markdown + 209 JSON)

## File Format

### Markdown Files (`.md`)
- **Name**: `[article-slug].md`
- **Content**: Article body converted from Sanity Portable Text to Markdown
- **Includes**:
  - Headings (H1-H6)
  - Bold, italic, code formatting
  - Links with proper markdown syntax: `[text](url)`
  - Lists with proper indentation:
    - Bullet lists: `- item`
    - Numbered lists: `1. item`
    - Nested items: `  - nested item` (2-space indentation per level)
  - Blockquotes: `> quoted text`
  - Code blocks with language markers: ` ```language ... ``` `
  - Mermaid diagrams: ` ```mermaid ... ``` `
  - Images as HTML comments: `<!-- IMAGE asset="..." alt="..." caption="..." credit="..." -->`

### JSON Files (`.json`)
- **Name**: `[article-slug].json`
- **Content**: Complete article metadata
- **Includes**:
  - `_id`, `title`, `slug`, `description`, `leadParagraph`
  - `author` (with **author name now included**, not just reference ID)
  - `publishedAt`, `updatedAt`, `eventDate`, `location`
  - `categories`, `tags`, `keywords`
  - `featured`, `breakingNews`, `isFieldReport`, `needsReview`, `allowComments`
  - `relatedArticles`, `linkedPitch`, `deletionRequest`
  - `methodology`, `correction`, `reviewedBy`
  - `seo`, `faqs`, `readingTimeMinutes`, `mainImage`, `imageGallery`
  - `hasEmbeddedVideo`, `videoLink`
- **Excludes** (as requested):
  - `sources` (credibility references not included)
  - `body` (separate in markdown file)
  - `_rev`, `_createdAt`

## Archive Script

**Location**: `scripts/archive-articles.mjs`

### Usage
```bash
# Archive all articles
node scripts/archive-articles.mjs

# Archive single article
node scripts/archive-articles.mjs kashmir-s-unbroken-revolution-the-mass-uprising-pakistan-doesn-t-want-you-to-see

# Custom output directory
node scripts/archive-articles.mjs --output-dir custom/path
```

### Features
- ✅ Fetches from Sanity via REST API
- ✅ Loads author data to resolve author references → names
- ✅ Converts Portable Text → Markdown
- ✅ Preserves all formatting (bold, italic, links, images, lists)
- ✅ Handles nested lists with proper indentation
- ✅ Exports body as `.md` and metadata as `.json`
- ✅ Progress indicators during processing

## Example

**Article**: `kashmir-s-unbroken-revolution-the-mass-uprising-pakistan-doesn-t-want-you-to-see`

**Markdown file** (`kashmir-s-unbroken-revolution-the-mass-uprising-pakistan-doesn-t-want-you-to-see.md`):
```markdown
While the world's attention is fixed on other crises...

## A Movement Born From Betrayal

The Jammu Kashmir Joint Awami Action Committee (JAAC)...

<!-- IMAGE alt="Thousands gathered" asset="image-xxx" caption="..." credit="..." -->
```

**JSON file** (`kashmir-s-unbroken-revolution-the-mass-uprising-pakistan-doesn-t-want-you-to-see.json`):
```json
{
  "_id": "kashmir-revolution-aac-pakistan-state-repression-2026",
  "title": "Kashmir's Unbroken Revolution: The Mass Uprising Pakistan Doesn't Want You to See",
  "slug": { "current": "kashmir-s-unbroken-revolution-the-mass-uprising-pakistan-doesn-t-want-you-to-see" },
  "author": {
    "_ref": "6f0d81b5-46c8-4c7a-a1fd-05ef547b3a6e",
    "_type": "reference",
    "name": "Tyler Durden"
  },
  "publishedAt": "2026-07-11T00:00:00.000Z",
  "categories": [...],
  "tags": [...],
  ...
}
```

## Improvements Made

### ✅ Author Names Included
- Script now fetches all authors from Sanity
- Author references are resolved to actual names
- JSON files include `"name"` field alongside reference ID

### ✅ List Items Properly Rendered
- Bullet lists: `- item` (with proper nesting: `  - nested`)
- Numbered lists: `1. item` (with proper nesting: `  1. nested`)
- Indentation follows Markdown conventions (2 spaces per level)
- Works for mixed list types

### ✅ Full Rich Text Support
- All Portable Text features converted correctly
- Links, images, code blocks, blockquotes preserved
- Mermaid diagrams extracted as code blocks
- Image references stored as HTML comments for future processing

## Statistics
- **Total articles**: 209
- **Archive size**: ~3 MB
- **Markdown files**: 209
- **Metadata files**: 209
- **Total fields per article**: 25+

## Reverse Conversion (Optional)

To convert Markdown back to Portable Text JSON:
```bash
python tools/portable-text-to-markdown.py archive/Articles/[slug].md --output /tmp/blocks.json
```

This enables workflows like:
1. Export from Sanity
2. Edit in external tools (Git-friendly Markdown)
3. Re-import back to Sanity if needed
