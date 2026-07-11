# Images Archive Summary

## Overview
All article images have been extracted from Sanity and downloaded to `archive/Images/`, organized by article slug.

## Statistics
- **Total images downloaded**: 550
- **Articles with images**: 168
- **Articles without images**: 41 (no body images)
- **Success rate**: 100% (550/550)
- **Image formats**:
  - WebP (modern format, most common)
  - JPG (legacy format)
  - PNG (lossless)
  - GIF (rare)

## Directory Structure

```
archive/Images/
├── article-slug-1/
│   ├── image-1.webp
│   ├── image-2.webp
│   ├── image-3.jpg
│   └── images.json (metadata)
├── article-slug-2/
│   ├── image-1.webp
│   ├── image-2.webp
│   └── images.json (metadata)
└── ... 166 more article folders
```

## Metadata Files

Each article folder contains an `images.json` file with image details:

```json
{
  "slug": "3-more-unrwa-staff-tragically-lost-in-gaza-conflict-urgent-humanitarian-crisis-deepens",
  "totalImages": 3,
  "downloadedAt": "2026-07-11T07:37:38.824Z",
  "images": [
    {
      "index": 0,
      "filename": "image-1.webp",
      "alt": "Firefighters intervene fire broke out...",
      "caption": "",
      "credit": "Ali Jadallah – Anadolu Agency",
      "asset": "image-5b055881e71685afecf98a1640cdb8837a47a1c3-1200x675-webp",
      "downloaded": true
    },
    ...
  ]
}
```

## Usage

### Finding Images for an Article
Each article folder is named by the article slug. For example:

- Article: `kashmir-s-unbroken-revolution-the-mass-uprising-pakistan-doesn-t-want-you-to-see.md`
- Images folder: `archive/Images/kashmir-s-unbroken-revolution-the-mass-uprising-pakistan-doesn-t-want-you-to-see/`
- Images inside:
  - `image-1.webp`
  - `image-2.webp`
  - `images.json`

### Re-downloading or Updating Images
To re-download images (useful if you add new articles or update images in Sanity):

```bash
node scripts/download-archive-images.mjs [--archive-dir archive/Articles] [--output-dir archive/Images]
```

## Script Details

**Location**: `scripts/download-archive-images.mjs`

### How it works:
1. Scans all markdown files in `archive/Articles/`
2. Extracts image references from HTML comments: `<!-- IMAGE asset="..." -->`
3. Queries Sanity API to get image URLs and metadata
4. Downloads images from Sanity CDN
5. Saves images to `archive/Images/[slug]/` folders
6. Creates `images.json` metadata file in each folder

### Features:
- ✅ Automatic format detection (WebP, JPG, PNG, GIF)
- ✅ Preserves original image metadata (alt text, caption, credit)
- ✅ Progress indicators during download
- ✅ Error handling with fallback formats
- ✅ Metadata file for each article with image info

## Image References in Markdown

Original image references in markdown files look like:
```markdown
<!-- IMAGE alt="description" asset="image-xxxxx-widthxheight-format" caption="Caption text" credit="Photo credit" -->
```

Example:
```markdown
<!-- IMAGE alt="Thousands gathered" asset="image-5b055881e71685afecf98a1640cdb8837a47a1c3-1200x675-webp" caption="Protesters gather during the march" credit="WION" -->
```

## Accessing Images

### From Markdown
The markdown files still contain the original HTML comments with Sanity asset references. These can be used to:
- Look up the corresponding image in `archive/Images/[slug]/image-[N].[ext]`
- Access the credit and caption information
- Re-upload to another platform

### Programmatically
Read the `images.json` file in each folder to get structured image data:

```javascript
const metadata = JSON.parse(fs.readFileSync('archive/Images/article-slug/images.json'));
metadata.images.forEach((img, idx) => {
  console.log(`Image ${idx + 1}: ${img.filename}`);
  console.log(`  Alt: ${img.alt}`);
  console.log(`  Caption: ${img.caption}`);
  console.log(`  Credit: ${img.credit}`);
});
```

## Total Archive Contents

After archiving:
- **Markdown files**: 209 (article bodies)
- **JSON metadata files**: 209 (article metadata)
- **Images downloaded**: 550 (across 168 articles)
- **Image metadata files**: 168 (one per article with images)
- **Total files**: 926

## Total Size
- Markdown + JSON metadata: ~3 MB
- Images: ~130 MB (approximately)
- **Total archive size**: ~133 MB

## Backup & Portability

The complete archive is now:
- ✅ Portable (no external dependencies)
- ✅ Backed up (copies of all images)
- ✅ Accessible (organized by article slug)
- ✅ Documented (metadata in JSON format)
- ✅ Git-friendly (text files for versioning)

## Next Steps

Possible uses:
1. **Version control**: Commit to Git for version history
2. **Offline access**: Read without Sanity connection
3. **Migration**: Re-import to different CMS
4. **Analysis**: Process images programmatically
5. **CDN migration**: Use local copies for faster delivery
6. **Archival**: Long-term storage in S3, Google Drive, etc.
