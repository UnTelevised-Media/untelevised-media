#!/usr/bin/env node
/**
 * Archive Image Downloader
 * Extracts image references from archived markdown files and downloads them from Sanity
 *
 * Usage:
 *   node scripts/download-archive-images.mjs [--archive-dir archive/Articles] [--output-dir archive/Images]
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
 * Create metadata file for images
 */
function createImageMetadata(slug, images) {
  const metadata = {
    slug,
    totalImages: images.length,
    downloadedAt: new Date().toISOString(),
    images: images.map((img, idx) => ({
      index: idx,
      alt: img.alt,
      caption: img.caption,
      credit: img.credit,
      asset: img.asset,
      filename: img.filename,
      downloaded: img.downloaded
    }))
  };
  return metadata;
}

/**
 * Main function
 */
async function main() {
  let archiveDir = 'archive/Articles';
  let outputDir = 'archive/Images';

  // Parse arguments
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--archive-dir=')) {
      archiveDir = arg.split('=')[1];
    } else if (arg === '--archive-dir' && i + 1 < process.argv.length) {
      archiveDir = process.argv[++i];
    } else if (arg.startsWith('--output-dir=')) {
      outputDir = arg.split('=')[1];
    } else if (arg === '--output-dir' && i + 1 < process.argv.length) {
      outputDir = process.argv[++i];
    }
  }

  console.log(`📁 Archive directory: ${archiveDir}`);
  console.log(`📸 Output directory: ${outputDir}\n`);

  // Get Sanity config
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_API_READ_TOKEN;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-06-04';

  if (!projectId || !dataset) {
    console.error('❌ Missing Sanity configuration');
    process.exit(1);
  }

  // Find all markdown files
  if (!fs.existsSync(archiveDir)) {
    console.error(`❌ Archive directory not found: ${archiveDir}`);
    process.exit(1);
  }

  const mdFiles = fs.readdirSync(archiveDir).filter(f => f.endsWith('.md'));
  console.log(`📄 Found ${mdFiles.length} markdown files\n`);

  let totalImages = 0;
  let downloadedImages = 0;
  const results = [];

  for (const mdFile of mdFiles) {
    const slug = mdFile.replace('.md', '');
    const mdPath = path.join(archiveDir, mdFile);
    const markdownContent = fs.readFileSync(mdPath, 'utf-8');

    // Extract images
    const images = extractImages(markdownContent);
    if (images.length === 0) {
      continue;
    }

    totalImages += images.length;
    console.log(`\n📄 ${slug}`);
    console.log(`   Found ${images.length} image(s)`);

    // Create slug folder
    const slugFolder = path.join(outputDir, slug);
    if (!fs.existsSync(slugFolder)) {
      fs.mkdirSync(slugFolder, { recursive: true });
    }

    // Download each image
    const downloadedImagesList = [];
    for (let idx = 0; idx < images.length; idx++) {
      const img = images[idx];
      const assetId = img.asset;

      // Get image URL from Sanity
      const imageData = await getImageUrl(assetId, projectId, dataset, token, apiVersion);
      if (!imageData) {
        console.log(`   ⚠️  [${idx + 1}/${images.length}] Failed to fetch metadata for ${assetId}`);
        img.downloaded = false;
        img.filename = null;
        downloadedImagesList.push(img);
        continue;
      }

      // Determine filename
      const ext = getFileExtension(assetId, imageData.mimeType, imageData.originalFilename);
      const filename = `image-${idx + 1}${ext}`;
      const outputPath = path.join(slugFolder, filename);

      // Download image
      const success = await downloadImage(imageData.url, outputPath);
      if (success) {
        console.log(`   ✓ [${idx + 1}/${images.length}] ${filename}`);
        downloadedImages++;
        img.downloaded = true;
        img.filename = filename;
      } else {
        console.log(`   ✗ [${idx + 1}/${images.length}] Failed to download ${filename}`);
        img.downloaded = false;
        img.filename = filename;
      }

      downloadedImagesList.push(img);
    }

    // Save metadata
    const metadata = createImageMetadata(slug, downloadedImagesList);
    const metadataFile = path.join(slugFolder, 'images.json');
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2), 'utf-8');

    results.push({
      slug,
      total: images.length,
      downloaded: downloadedImagesList.filter(i => i.downloaded).length,
      failed: downloadedImagesList.filter(i => !i.downloaded).length
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
  console.log(`Output directory: ${outputDir}\n`);

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
