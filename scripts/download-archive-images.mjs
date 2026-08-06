#!/usr/bin/env node
/**
 * Archive Image Downloader (repair/retry utility)
 *
 * Re-scans already-archived articles and (re-)downloads any missing images
 * from Sanity — mainImage + imageGallery (read from metadata.json) and
 * body images (read from body.md's IMAGE markers) — without re-fetching
 * article bodies/metadata. Useful for retrying failed downloads from a
 * prior `archive-article.mjs` run.
 *
 * Expects the archive-article.mjs layout:
 *   <archive-dir>/<slug>/body.md
 *   <archive-dir>/<slug>/metadata.json
 *   <archive-dir>/<slug>/Images/main.ext
 *   <archive-dir>/<slug>/Images/gallery-N.ext
 *   <archive-dir>/<slug>/Images/image-N.ext
 *   <archive-dir>/<slug>/Images/metadata.json
 *
 * Usage:
 *   node scripts/download-archive-images.mjs [--archive-dir archive/Articles]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(__dirname);

// Load environment from .env.local
const envPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      if (key.trim()) {
        process.env[key.trim()] = value;
      }
    }
  }
}

/**
 * Extract image references from markdown content
 */
function extractImages(markdownContent) {
  const imagePattern = /<!-- IMAGE alt="([^"]*)" asset="([^"]*)"(?: caption="([^"]*)")?(?: credit="([^"]*)")? -->/g;
  const images = [];
  let match;

  while ((match = imagePattern.exec(markdownContent)) !== null) {
    images.push({
      alt: match[1],
      asset: match[2],
      caption: match[3] || '',
      credit: match[4] || ''
    });
  }

  return images;
}

/**
 * Fetch image metadata from Sanity
 */
async function getImageUrl(assetId, projectId, dataset, token, apiVersion) {
  const query = `*[_id == "${assetId}"]`;
  const encodedQuery = encodeURIComponent(query);
  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodedQuery}`;

  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error(`❌ API error for asset ${assetId}: ${response.statusText}`);
      return null;
    }

    const result = await response.json();
    if (result.result && result.result[0]) {
      const asset = result.result[0];
      return {
        url: asset.url,
        originalFilename: asset.originalFilename,
        mimeType: asset.mimeType
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching asset ${assetId}:`, error.message);
    return null;
  }
}

/**
 * Download image from URL
 */
async function downloadImage(imageUrl, outputPath) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`❌ Failed to download ${imageUrl}: ${response.statusText}`);
      return false;
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.error(`Error downloading image: ${error.message}`);
    return false;
  }
}

/**
 * Get file extension from asset ID or MIME type
 */
function getFileExtension(assetId, mimeType, originalFilename) {
  // Try to extract from original filename
  if (originalFilename) {
    const ext = path.extname(originalFilename);
    if (ext) return ext.toLowerCase();
  }

  // Try to extract from asset ID (usually format: image-xxxxx-widthxheight-format)
  const assetMatch = assetId.match(/-([a-z]+)$/i);
  if (assetMatch) {
    const format = assetMatch[1].toLowerCase();
    const formatMap = {
      webp: '.webp',
      jpg: '.jpg',
      jpeg: '.jpg',
      png: '.png',
      gif: '.gif',
      svg: '.svg'
    };
    if (formatMap[format]) return formatMap[format];
  }

  // Fallback to MIME type
  if (mimeType) {
    if (mimeType.includes('webp')) return '.webp';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return '.jpg';
    if (mimeType.includes('png')) return '.png';
    if (mimeType.includes('gif')) return '.gif';
    if (mimeType.includes('svg')) return '.svg';
  }

  return '.jpg'; // default
}

/**
 * Build the mainImage + imageGallery + body image request list for one
 * archived article, mirroring archive-article.mjs's request shape.
 */
function buildRequests(metadata, bodyImages) {
  const requests = [];

  if (metadata?.mainImage?.asset?._ref) {
    requests.push({
      category: 'main',
      filenameBase: 'main',
      alt: metadata.mainImage.alt || '',
      caption: metadata.mainImage.caption || '',
      credit: metadata.mainImage.credit || '',
      asset: metadata.mainImage.asset._ref
    });
  }

  const galleryImages = metadata?.imageGallery?.images || [];
  galleryImages.forEach((img, idx) => {
    requests.push({
      category: 'gallery',
      filenameBase: `gallery-${idx + 1}`,
      alt: img.alt || '',
      caption: img.caption || '',
      credit: img.credit || '',
      asset: img.asset?._ref || ''
    });
  });

  bodyImages.forEach((img, idx) => {
    requests.push({
      category: 'body',
      filenameBase: `image-${idx + 1}`,
      alt: img.alt,
      caption: img.caption,
      credit: img.credit,
      asset: img.asset
    });
  });

  return requests;
}

/**
 * Main function
 */
async function main() {
  let archiveDir = 'archive/Articles';

  // Parse arguments
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--archive-dir=')) {
      archiveDir = arg.split('=')[1];
    } else if (arg === '--archive-dir' && i + 1 < process.argv.length) {
      archiveDir = process.argv[++i];
    }
  }

  console.log(`📁 Archive directory: ${archiveDir}\n`);

  // Get Sanity config
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_API_READ_TOKEN;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-06-04';

  if (!projectId || !dataset) {
    console.error('❌ Missing Sanity configuration');
    process.exit(1);
  }

  // Find all archived article folders (each containing a body.md)
  if (!fs.existsSync(archiveDir)) {
    console.error(`❌ Archive directory not found: ${archiveDir}`);
    process.exit(1);
  }

  const slugs = fs
    .readdirSync(archiveDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(archiveDir, entry.name, 'body.md')))
    .map((entry) => entry.name);

  console.log(`📄 Found ${slugs.length} archived article(s)\n`);

  let totalImages = 0;
  let downloadedImages = 0;
  const results = [];

  for (const slug of slugs) {
    const mdPath = path.join(archiveDir, slug, 'body.md');
    const markdownContent = fs.readFileSync(mdPath, 'utf-8');
    const bodyImages = extractImages(markdownContent);

    const metaPath = path.join(archiveDir, slug, 'metadata.json');
    const metadata = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf-8')) : null;

    const requests = buildRequests(metadata, bodyImages);
    if (requests.length === 0) {
      continue;
    }

    totalImages += requests.length;
    console.log(`\n📄 ${slug}`);
    console.log(`   Found ${requests.length} image(s) (main/gallery/body)`);

    // Images live alongside body.md, in <archiveDir>/<slug>/Images/
    const imagesDir = path.join(archiveDir, slug, 'Images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Download each image
    const downloadedList = [];
    for (let idx = 0; idx < requests.length; idx++) {
      const req = requests[idx];
      const assetId = req.asset;

      if (!assetId) {
        console.log(`   ⚠️  [${idx + 1}/${requests.length}] ${req.filenameBase}: missing asset reference`);
        downloadedList.push({ ...req, downloaded: false, filename: null });
        continue;
      }

      // Get image URL from Sanity
      const imageData = await getImageUrl(assetId, projectId, dataset, token, apiVersion);
      if (!imageData) {
        console.log(`   ⚠️  [${idx + 1}/${requests.length}] Failed to fetch metadata for ${assetId}`);
        downloadedList.push({ ...req, downloaded: false, filename: null });
        continue;
      }

      // Determine filename
      const ext = getFileExtension(assetId, imageData.mimeType, imageData.originalFilename);
      const filename = `${req.filenameBase}${ext}`;
      const outputPath = path.join(imagesDir, filename);

      // Download image
      const success = await downloadImage(imageData.url, outputPath);
      if (success) {
        console.log(`   ✓ [${idx + 1}/${requests.length}] ${filename}`);
        downloadedImages++;
        downloadedList.push({ ...req, downloaded: true, filename });
      } else {
        console.log(`   ✗ [${idx + 1}/${requests.length}] Failed to download ${filename}`);
        downloadedList.push({ ...req, downloaded: false, filename });
      }
    }

    // Save metadata, grouped by where each image came from (matches archive-article.mjs)
    const toPublic = (r) => ({
      alt: r.alt,
      caption: r.caption,
      credit: r.credit,
      asset: r.asset,
      filename: r.filename,
      downloaded: r.downloaded
    });
    const imgMetadata = {
      slug,
      totalImages: requests.length,
      downloadedAt: new Date().toISOString(),
      mainImage: (() => {
        const r = downloadedList.find((r) => r.category === 'main');
        return r ? toPublic(r) : null;
      })(),
      gallery: downloadedList
        .filter((r) => r.category === 'gallery')
        .map((r, idx) => ({ index: idx, ...toPublic(r) })),
      body: downloadedList
        .filter((r) => r.category === 'body')
        .map((r, idx) => ({ index: idx, ...toPublic(r) }))
    };
    const metadataFile = path.join(imagesDir, 'metadata.json');
    fs.writeFileSync(metadataFile, JSON.stringify(imgMetadata, null, 2), 'utf-8');

    results.push({
      slug,
      total: requests.length,
      downloaded: downloadedList.filter((i) => i.downloaded).length,
      failed: downloadedList.filter((i) => !i.downloaded).length
    });
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Download Complete`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total images found: ${totalImages}`);
  console.log(`Successfully downloaded: ${downloadedImages}`);
  console.log(`Failed: ${totalImages - downloadedImages}`);
  console.log(`Articles with images: ${results.length}`);
  console.log(`Archive directory: ${archiveDir}\n`);

  // Detailed summary
  console.log('Summary by article:');
  for (const result of results.slice(0, 10)) {
    const status = result.failed === 0 ? '✓' : '⚠';
    console.log(`  ${status} ${result.slug}: ${result.downloaded}/${result.total}`);
  }
  if (results.length > 10) {
    console.log(`  ... and ${results.length - 10} more`);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  console.error(error);
  process.exit(1);
});
