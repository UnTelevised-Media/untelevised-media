#!/usr/bin/env node
/**
 * UNIFIED ARTICLE ARCHIVER
 *
 * Archives a single article (or all) with:
 * - Markdown body (converted from Portable Text, with images and social
 *   embeds tagged inline as HTML comment markers)
 * - JSON metadata (with author name)
 * - Downloaded images: mainImage, imageGallery, and images embedded in the
 *   body (organized in a per-article subfolder)
 *
 * Output layout:
 *   <output-dir>/<slug>/body.md
 *   <output-dir>/<slug>/metadata.json
 *   <output-dir>/<slug>/source.json           Dereferenced source-library citations
 *   <output-dir>/<slug>/Images/main.ext          (article's mainImage)
 *   <output-dir>/<slug>/Images/gallery-N.ext      (imageGallery items)
 *   <output-dir>/<slug>/Images/image-N.ext        (images embedded in body)
 *   <output-dir>/<slug>/Images/metadata.json
 *
 * Usage:
 *   node scripts/archive-article.mjs [slug]              # Archive one article
 *   node scripts/archive-article.mjs                      # Archive all articles
 *   node scripts/archive-article.mjs --sources-only        # Backfill source.json only
 *   node scripts/archive-article.mjs --help               # Show help
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

// ─────────────────────────────────────────────────────────────────────────────
// PORTABLE TEXT TO MARKDOWN CONVERTER
// ─────────────────────────────────────────────────────────────────────────────

// Social embed block types → { platform label, field holding the embed's
// content }. Some platforms store a bare ID (youtube/vimeo/twitter/instagram),
// others store a full URL (facebook/tiktok/iframe) — the marker just carries
// whatever Sanity has, verbatim.
const EMBED_TYPE_MAP = {
  youtubeEmbed: { platform: 'youtube', field: 'videoId' },
  vimeoEmbed: { platform: 'vimeo', field: 'videoId' },
  twitterEmbed: { platform: 'twitter', field: 'tweetId' },
  instagramEmbed: { platform: 'instagram', field: 'postId' },
  facebookEmbed: { platform: 'facebook', field: 'postUrl' },
  tiktokEmbed: { platform: 'tiktok', field: 'videoUrl' },
  iframeEmbed: { platform: 'iframe', field: 'src' },
};

function escapeAttr(value) {
  return String(value ?? '').replace(/"/g, '&quot;');
}

function portableTextToMarkdown(blocks) {
  if (!blocks || blocks.length === 0) return '';

  const resolveMarkDefs = (children = [], markDefs = []) => {
    const lookup = {};
    if (markDefs) {
      for (const markDef of markDefs) {
        if (markDef._key) {
          lookup[markDef._key] = markDef;
        }
      }
    }
    return lookup;
  };

  const renderInlineChildren = (children = [], markDefs = []) => {
    const markLookup = resolveMarkDefs(children, markDefs);
    const result = [];

    for (const child of children) {
      if (child._type !== 'span') continue;

      let text = child.text || '';
      const marks = child.marks || [];

      let linkUrl = null;
      const nonLinkMarks = [];

      for (const mark of marks) {
        if (mark in markLookup) {
          const markDef = markLookup[mark];
          if (markDef._type === 'link') {
            linkUrl = markDef.href || '';
          }
        } else {
          nonLinkMarks.push(mark);
        }
      }

      let formattedText = text;
      if (nonLinkMarks.includes('code')) {
        formattedText = `\`${formattedText}\``;
      }
      if (nonLinkMarks.includes('em')) {
        formattedText = `*${formattedText}*`;
      }
      if (nonLinkMarks.includes('strong')) {
        formattedText = `**${formattedText}**`;
      }

      if (linkUrl) {
        formattedText = `[${formattedText}](${linkUrl})`;
      }

      result.push(formattedText);
    }

    return result.join('');
  };

  const renderBlock = (block) => {
    const blockType = block._type || 'block';

    if (blockType === 'block') {
      const style = block.style || 'normal';
      const children = block.children || [];
      const markDefs = block.markDefs || [];
      const listItem = block.listItem;
      const level = block.level || 0;

      const inlineText = renderInlineChildren(children, markDefs);

      if (listItem) {
        const indent = '  '.repeat(level);
        if (listItem === 'bullet') {
          return `${indent}- ${inlineText}`;
        } else if (listItem === 'number') {
          return `${indent}1. ${inlineText}`;
        }
      }

      switch (style) {
        case 'h1':
          return `# ${inlineText}`;
        case 'h2':
          return `## ${inlineText}`;
        case 'h3':
          return `### ${inlineText}`;
        case 'h4':
          return `#### ${inlineText}`;
        case 'h5':
          return `##### ${inlineText}`;
        case 'h6':
          return `###### ${inlineText}`;
        case 'blockquote': {
          const lines = inlineText.split('\n');
          return lines.map(line => `> ${line}`).join('\n');
        }
        default:
          return inlineText;
      }
    }

    if (blockType === 'image') {
      const alt = block.alt || '';
      const assetRef = block.asset?._ref || '';
      const caption = block.caption || '';
      const credit = block.credit || '';

      // `asset` is always emitted (even empty) so extractImages() always
      // captures the block — a block with a broken/missing asset ref should
      // surface as a failed download, not silently disappear from the count.
      const parts = [`alt="${escapeAttr(alt)}"`, `asset="${escapeAttr(assetRef)}"`];
      if (caption) parts.push(`caption="${escapeAttr(caption)}"`);
      if (credit) parts.push(`credit="${escapeAttr(credit)}"`);

      return `<!-- IMAGE ${parts.join(' ')} -->`;
    }

    if (blockType in EMBED_TYPE_MAP) {
      const { platform, field } = EMBED_TYPE_MAP[blockType];
      const content = block[field] || '';

      const parts = [`platform="${escapeAttr(platform)}"`, `content="${escapeAttr(content)}"`];
      if (blockType === 'iframeEmbed' && block.title) {
        parts.push(`title="${escapeAttr(block.title)}"`);
      }

      return `<!-- EMBED ${parts.join(' ')} -->`;
    }

    if (blockType === 'code') {
      const codeContent = block.code || '';
      const language = block.language || 'text';
      return `\`\`\`${language}\n${codeContent}\n\`\`\``;
    }

    if (blockType === 'mermaidDiagram') {
      const codeContent = block.code || '';
      return `\`\`\`mermaid\n${codeContent}\n\`\`\``;
    }

    if (blockType === 'table') {
      const rows = block.rows || [];
      if (!rows.length) return '';

      const markdownRows = [];
      for (let idx = 0; idx < rows.length; idx++) {
        const row = rows[idx];
        const cells = row.cells || [];
        const rowText = cells.join(' | ');
        markdownRows.push(`| ${rowText} |`);

        if (idx === 0) {
          const separator = cells.map(() => '---').join(' | ');
          markdownRows.push(`| ${separator} |`);
        }
      }

      return markdownRows.join('\n');
    }

    return '';
  };

  const markdownLines = blocks.map(renderBlock).filter(Boolean);

  const result = [];
  for (let i = 0; i < markdownLines.length; i++) {
    result.push(markdownLines[i]);
    if (i < markdownLines.length - 1) {
      const nextLine = markdownLines[i + 1];
      const isCurrentList = markdownLines[i].trimStart().match(/^[-*\d+.]/);
      const isNextList = nextLine.trimStart().match(/^[-*\d+.]/);

      if (!(isCurrentList && isNextList)) {
        result.push('');
      }
    }
  }

  const finalResult = [];
  let prevBlank = false;
  for (const line of result) {
    if (line.trim() === '') {
      if (!prevBlank) {
        finalResult.push('');
        prevBlank = true;
      }
    } else {
      finalResult.push(line);
      prevBlank = false;
    }
  }

  return finalResult.join('\n').trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE & EMBED EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

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

function extractEmbeds(markdownContent) {
  const embedPattern = /<!-- EMBED platform="([^"]*)" content="([^"]*)"(?: title="([^"]*)")? -->/g;
  const embeds = [];
  let match;

  while ((match = embedPattern.exec(markdownContent)) !== null) {
    embeds.push({
      platform: match[1],
      content: match[2],
      title: match[3] || ''
    });
  }

  return embeds;
}

async function getImageUrl(assetId, projectId, dataset, token, apiVersion) {
  const query = `*[_id == "${assetId}"]`;
  const encodedQuery = encodeURIComponent(query);
  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodedQuery}`;

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) return null;

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
    console.error(`  ⚠️  Error fetching asset ${assetId}`);
    return null;
  }
}

async function downloadImage(imageUrl, outputPath) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return false;

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    return true;
  } catch (error) {
    return false;
  }
}

function getFileExtension(assetId, mimeType, originalFilename) {
  if (originalFilename) {
    const ext = path.extname(originalFilename);
    if (ext) return ext.toLowerCase();
  }

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

  if (mimeType) {
    if (mimeType.includes('webp')) return '.webp';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return '.jpg';
    if (mimeType.includes('png')) return '.png';
    if (mimeType.includes('gif')) return '.gif';
    if (mimeType.includes('svg')) return '.svg';
  }

  return '.jpg';
}

// `requests` is a flat list of { category, filenameBase, alt, caption, credit,
// asset } — category is 'main' | 'gallery' | 'body', filenameBase is the
// output filename without extension (e.g. "main", "gallery-1", "image-1").
async function downloadImages(requests, imagesDir, projectId, dataset, token, apiVersion) {
  if (requests.length === 0) {
    return { downloaded: 0, failed: 0, results: [] };
  }

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  let downloaded = 0;
  let failed = 0;
  const results = [];

  for (const req of requests) {
    const assetId = req.asset;

    if (!assetId) {
      results.push({ ...req, downloaded: false, filename: null });
      failed++;
      console.log(`      ✗ ${req.filenameBase} (missing asset reference)`);
      continue;
    }

    const imageData = await getImageUrl(assetId, projectId, dataset, token, apiVersion);
    if (!imageData) {
      results.push({ ...req, downloaded: false, filename: null });
      failed++;
      console.log(`      ✗ ${req.filenameBase} (asset not found in Sanity)`);
      continue;
    }

    const ext = getFileExtension(assetId, imageData.mimeType, imageData.originalFilename);
    const filename = `${req.filenameBase}${ext}`;
    const outputPath = path.join(imagesDir, filename);

    const success = await downloadImage(imageData.url, outputPath);
    if (success) {
      results.push({ ...req, downloaded: true, filename });
      downloaded++;
      console.log(`      ✓ ${filename}`);
    } else {
      results.push({ ...req, downloaded: false, filename });
      failed++;
      console.log(`      ✗ ${filename}`);
    }
  }

  return { downloaded, failed, results };
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCHIVE ARTICLE
// ─────────────────────────────────────────────────────────────────────────────

async function archiveArticle(article, outputDir, projectId, dataset, token, apiVersion, authorMap) {
  const slug = article.slug?.current;
  if (!slug) {
    console.error(`⚠️  Article has no slug: ${article._id}`);
    return null;
  }

  console.log(`\n📄 ${article.title}`);
  console.log(`   Slug: ${slug}`);

  // Create per-article directory: <outputDir>/<slug>/
  const articleDir = path.join(outputDir, slug);
  const imagesDir = path.join(articleDir, 'Images');
  if (!fs.existsSync(articleDir)) {
    fs.mkdirSync(articleDir, { recursive: true });
  }

  // 1. Convert body to markdown (images and social embeds tagged inline)
  const body = article.body || [];
  const markdownContent = portableTextToMarkdown(body);

  // 2. Extract images & embeds from markdown
  const images = extractImages(markdownContent);
  const embeds = extractEmbeds(markdownContent);
  console.log(`   Images found: ${images.length}`);
  if (embeds.length > 0) {
    console.log(`   Embeds found: ${embeds.length} (${embeds.map(e => e.platform).join(', ')})`);
  }

  // 3. Prepare metadata
  const metadata = {};
  const excludeFields = new Set(['body', 'sources', '_rev', '_createdAt']);

  for (const [key, value] of Object.entries(article)) {
    if (!excludeFields.has(key)) {
      metadata[key] = value;
    }
  }

  // Resolve author reference to author name
  if (metadata.author && metadata.author._ref && authorMap[metadata.author._ref]) {
    metadata.author = {
      ...metadata.author,
      name: authorMap[metadata.author._ref]
    };
  }

  // 4. Save markdown file
  const mdFile = path.join(articleDir, 'body.md');
  fs.writeFileSync(mdFile, markdownContent, 'utf-8');
  console.log(`   ✓ body.md`);

  // 5. Save metadata JSON
  const jsonFile = path.join(articleDir, 'metadata.json');
  fs.writeFileSync(jsonFile, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`   ✓ metadata.json`);

  // 5b. Save sources (dereferenced source-library documents this article cites)
  const sources = article.sources || [];
  const sourcesFile = path.join(articleDir, 'source.json');
  fs.writeFileSync(sourcesFile, JSON.stringify({ slug, totalSources: sources.length, sources }, null, 2), 'utf-8');
  console.log(`   ✓ source.json (${sources.length} source${sources.length === 1 ? '' : 's'})`);

  // 6. Build the full image download list: mainImage + imageGallery + body images
  const requests = [];

  if (article.mainImage?.asset?._ref) {
    requests.push({
      category: 'main',
      filenameBase: 'main',
      alt: article.mainImage.alt || '',
      caption: article.mainImage.caption || '',
      credit: article.mainImage.credit || '',
      asset: article.mainImage.asset._ref
    });
  }

  const galleryImages = article.imageGallery?.images || [];
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

  images.forEach((img, idx) => {
    requests.push({
      category: 'body',
      filenameBase: `image-${idx + 1}`,
      alt: img.alt,
      caption: img.caption,
      credit: img.credit,
      asset: img.asset
    });
  });

  console.log(
    `   Main image: ${article.mainImage?.asset?._ref ? 'yes' : 'no'} | Gallery: ${galleryImages.length} | Body: ${images.length}`
  );

  // 7. Download images
  let imageSummary = '';
  if (requests.length > 0) {
    console.log(`   Downloading images...`);
    const result = await downloadImages(requests, imagesDir, projectId, dataset, token, apiVersion);

    const toPublic = (r) => ({
      alt: r.alt,
      caption: r.caption,
      credit: r.credit,
      asset: r.asset,
      filename: r.filename,
      downloaded: r.downloaded
    });

    // Save image metadata, grouped by where each image came from
    const imgMetadata = {
      slug,
      totalImages: requests.length,
      downloadedAt: new Date().toISOString(),
      mainImage: (() => {
        const r = result.results.find((r) => r.category === 'main');
        return r ? toPublic(r) : null;
      })(),
      gallery: result.results
        .filter((r) => r.category === 'gallery')
        .map((r, idx) => ({ index: idx, ...toPublic(r) })),
      body: result.results
        .filter((r) => r.category === 'body')
        .map((r, idx) => ({ index: idx, ...toPublic(r) }))
    };

    const imgMetaFile = path.join(imagesDir, 'metadata.json');
    fs.writeFileSync(imgMetaFile, JSON.stringify(imgMetadata, null, 2), 'utf-8');
    console.log(`   ✓ Images: ${result.downloaded}/${requests.length} downloaded`);
    if (result.failed > 0) {
      console.log(`   ⚠️  ${result.failed} image(s) failed`);
    }
    imageSummary = ` (${result.downloaded}/${requests.length} images)`;
  } else {
    console.log(`   ℹ️  No images to download`);
  }

  return {
    slug,
    title: article.title,
    dir: articleDir,
    imagesSummary: imageSummary
  };
}

// Recursively finds an existing article folder (a directory containing
// metadata.json) named `slug`, anywhere under `dir`. Used by --sources-only
// to locate already-archived folders regardless of whether they're flat
// (archive-article.mjs layout) or nested under <year>/<MM>_<Mon>/ (archive-year.mjs layout).
function findArticleDir(dir, slug) {
  if (!fs.existsSync(dir)) return null;
  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory());
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.name === slug && fs.existsSync(path.join(entryPath, 'metadata.json'))) {
      return entryPath;
    }
    const found = findArticleDir(entryPath, slug);
    if (found) return found;
  }
  return null;
}

// Lightweight backfill: pulls only { slug, sources } and writes source.json
// into whatever folder that slug is already archived in, without touching
// body.md, metadata.json, or downloading any images.
async function backfillSources(outputDir, projectId, dataset, token, apiVersion, slugFilter) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`SOURCES BACKFILL`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`Output dir: ${outputDir}\n`);

  console.log('🔍 Querying Sanity for sources...');
  let query = '*[_type == "article" && defined(slug.current)';
  if (slugFilter) query += ` && slug.current == "${slugFilter}"`;
  query += '] {"slug": slug.current, "sources": sources[]->{_id, label, type, url, description, isAnonymous}}';

  const encodedQuery = encodeURIComponent(query);
  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodedQuery}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Sanity API error: ${error.message || response.statusText}`);
  }

  const result = await response.json();
  const articles = result.result || [];
  console.log(`✓ Found ${articles.length} article(s) in Sanity\n`);

  let written = 0;
  let noFolder = 0;

  for (const article of articles) {
    const articleDir = findArticleDir(outputDir, article.slug);
    if (!articleDir) {
      noFolder++;
      continue;
    }

    const sources = article.sources || [];
    const sourcesFile = path.join(articleDir, 'source.json');
    fs.writeFileSync(sourcesFile, JSON.stringify({ slug: article.slug, totalSources: sources.length, sources }, null, 2), 'utf-8');
    written++;
    console.log(`  ✓ ${article.slug} (${sources.length} source${sources.length === 1 ? '' : 's'})`);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ COMPLETE`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`source.json written: ${written}`);
  console.log(`Skipped (no archived folder found): ${noFolder}\n`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  let slug = null;
  let outputDir = 'archive/Articles';
  let sourcesOnly = false;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      console.log(`
UNIFIED ARTICLE ARCHIVER

Usage:
  node scripts/archive-article.mjs [slug]           Archive a single article
  node scripts/archive-article.mjs                  Archive all articles
  node scripts/archive-article.mjs --sources-only   Backfill source.json into
                                                     already-archived folders
  node scripts/archive-article.mjs --help           Show this help

Examples:
  # Archive one article
  node scripts/archive-article.mjs kashmir-s-unbroken-revolution

  # Archive all articles
  node scripts/archive-article.mjs

  # Just backfill source.json everywhere without re-downloading anything
  node scripts/archive-article.mjs --sources-only

Options:
  --output-dir PATH     Output directory (default: archive/Articles)
  --sources-only        Only fetch+write source.json into existing article
                         folders (searched recursively under --output-dir).
                         No body/metadata re-fetch, no image downloads.

Output layout:
  <output-dir>/<slug>/body.md               Article body (Portable Text → Markdown,
                                             images & social embeds tagged inline)
  <output-dir>/<slug>/metadata.json         Article metadata (with author name)
  <output-dir>/<slug>/source.json           Dereferenced source-library citations
  <output-dir>/<slug>/Images/main.ext       Downloaded mainImage
  <output-dir>/<slug>/Images/gallery-N.ext  Downloaded imageGallery images
  <output-dir>/<slug>/Images/image-N.ext    Downloaded body images
  <output-dir>/<slug>/Images/metadata.json  Image metadata (mainImage/gallery/body)
      `);
      process.exit(0);
    } else if (arg.startsWith('--output-dir=')) {
      outputDir = arg.split('=')[1];
    } else if ((arg === '--output-dir' || arg === '--archive-dir') && i + 1 < args.length) {
      outputDir = args[++i];
    } else if (arg.startsWith('--archive-dir=')) {
      outputDir = arg.split('=')[1];
    } else if (arg === '--sources-only') {
      sourcesOnly = true;
    } else if (!arg.startsWith('--')) {
      slug = arg;
    }
  }

  // Validate Sanity config
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_API_READ_TOKEN;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-06-04';

  if (!projectId || !dataset) {
    console.error('❌ Missing Sanity configuration');
    process.exit(1);
  }

  if (sourcesOnly) {
    try {
      await backfillSources(outputDir, projectId, dataset, token, apiVersion, slug);
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      if (process.env.DEBUG) console.error(error);
      process.exit(1);
    }
    return;
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`UNIFIED ARTICLE ARCHIVER`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`Output dir: ${outputDir}`);

  if (slug) {
    console.log(`Target: Single article (${slug})\n`);
  } else {
    console.log(`Target: All articles\n`);
  }

  try {
    // Fetch articles
    console.log('🔍 Querying Sanity...');
    let query = '*[_type == "article"';
    if (slug) {
      query += ` && slug.current == "${slug}"`;
    }
    query += '] | order(publishedAt desc) {_id, title, slug, description, leadParagraph, body, mainImage, hasEmbeddedVideo, videoLink, imageGallery, author, publishedAt, updatedAt, eventDate, location, categories, tags, keywords, featured, breakingNews, isFieldReport, needsReview, allowComments, relatedArticles, linkedPitch, deletionRequest, methodology, correction, reviewedBy, seo, faqs, readingTimeMinutes, "sources": sources[]->{_id, label, type, url, description, isAnonymous}}';

    const encodedQuery = encodeURIComponent(query);
    const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodedQuery}`;

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Sanity API error: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    const articles = result.result || [];

    if (articles.length === 0) {
      console.error(`❌ No articles found${slug ? ` with slug: ${slug}` : ''}`);
      process.exit(1);
    }

    console.log(`✓ Found ${articles.length} article(s)\n`);

    // Load authors
    console.log('📝 Loading author data...');
    const authorQuery = '*[_type == "author"] { _id, name }';
    const authorEncodedQuery = encodeURIComponent(authorQuery);
    const authorUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${authorEncodedQuery}`;
    const authorResponse = await fetch(authorUrl, { headers });
    const authorResult = await authorResponse.json();
    const authorList = authorResult.result || [];

    const authorMap = {};
    for (const author of authorList) {
      authorMap[author._id] = author.name;
    }
    console.log(`✓ Loaded ${authorList.length} authors\n`);

    // Archive articles
    console.log(`${'─'.repeat(60)}`);
    const archived = [];
    for (const article of articles) {
      const result = await archiveArticle(article, outputDir, projectId, dataset, token, apiVersion, authorMap);
      if (result) {
        archived.push(result);
      }
    }

    // Summary
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`✅ COMPLETE`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`Archived: ${archived.length} article(s)`);
    console.log(`Directory: ${outputDir}\n`);

    for (const item of archived) {
      console.log(`  ✓ ${item.slug}${item.imagesSummary}`);
    }

    console.log('');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (process.env.DEBUG) console.error(error);
    process.exit(1);
  }
}

main();
