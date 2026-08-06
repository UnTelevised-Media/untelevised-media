#!/usr/bin/env node
/**
 * YEAR ARTICLE ARCHIVER (month-sorted)
 *
 * Archives only the articles belonging to a given year — resolved the same
 * way the live site's /archive page buckets articles by year:
 *   eventDate → publishedAt → _createdAt (first one present wins)
 *
 * Output is organized into month subfolders under the year:
 *   <output-dir>/<year>/<MM>_<Mon>/<slug>/body.md
 *   <output-dir>/<year>/<MM>_<Mon>/<slug>/metadata.json
 *   <output-dir>/<year>/<MM>_<Mon>/<slug>/Images/main.ext
 *   <output-dir>/<year>/<MM>_<Mon>/<slug>/Images/gallery-N.ext
 *   <output-dir>/<year>/<MM>_<Mon>/<slug>/Images/image-N.ext
 *   <output-dir>/<year>/<MM>_<Mon>/<slug>/Images/metadata.json
 *
 * Within an already-resolved year, the MONTH is picked by when the article
 * actually appeared: publishedAt → updatedAt → eventDate → _createdAt (first
 * candidate whose year matches wins). This keeps retrospective pieces (e.g.
 * an article published in 2026 about a 1974 event) filed under the year
 * they're about, while still sorting them into the month they were published.
 *
 * Before fetching anything new, it also re-sorts every article folder it
 * finds under <output-dir>/<year>/ — flat ones from an older archive run,
 * and ones already in a month folder that no longer matches — using only
 * the already-saved metadata.json, no re-download needed.
 *
 * Usage:
 *   node scripts/archive-year.mjs                    # Archive all of 2026, sorted by month
 *   node scripts/archive-year.mjs --month 7           # Only fetch/archive July 2026
 *   node scripts/archive-year.mjs --year 2025         # Archive a different year
 *   node scripts/archive-year.mjs --refresh           # Re-download even already-archived articles
 *   node scripts/archive-year.mjs --help
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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthFolderName(monthIndex1) {
  return `${String(monthIndex1).padStart(2, '0')}_${MONTH_NAMES[monthIndex1 - 1]}`;
}

// Mirrors src/util/date/getArticleDate.ts — eventDate takes priority over
// publishedAt, which takes priority over _createdAt. Used for YEAR bucketing
// only, so retrospective pieces (e.g. an article published in 2026 about a
// 1974 event) stay filed under the year they're actually about.
function resolveDate(obj) {
  return obj.eventDate || obj.publishedAt || obj._createdAt || null;
}

// MONTH bucketing (within an already-resolved year) prioritizes when the
// article actually appeared/was last touched — publishedAt, then the
// editorial `updatedAt` field, then eventDate, then _createdAt — picking the
// first candidate whose year matches, so a stale eventDate from a different
// year never pulls the month folder out of the year it's filed under.
function resolveMonthDate(obj, year) {
  for (const candidate of [obj.publishedAt, obj.updatedAt, obj.eventDate, obj._createdAt]) {
    if (candidate && new Date(candidate).getFullYear() === year) {
      return candidate;
    }
  }
  return resolveDate(obj);
}

// ─────────────────────────────────────────────────────────────────────────────
// PORTABLE TEXT TO MARKDOWN CONVERTER (mirrors archive-article.mjs)
// ─────────────────────────────────────────────────────────────────────────────

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
// IMAGE & EMBED EXTRACTION (mirrors archive-article.mjs)
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
// ARCHIVE ONE ARTICLE INTO A GIVEN DIRECTORY
// ─────────────────────────────────────────────────────────────────────────────

async function archiveArticleInto(article, articleDir, projectId, dataset, token, apiVersion, authorMap) {
  const slug = article.slug?.current;

  console.log(`\n📄 ${article.title}`);
  console.log(`   Slug: ${slug}`);

  const imagesDir = path.join(articleDir, 'Images');
  if (!fs.existsSync(articleDir)) {
    fs.mkdirSync(articleDir, { recursive: true });
  }

  const body = article.body || [];
  const markdownContent = portableTextToMarkdown(body);

  const images = extractImages(markdownContent);
  const embeds = extractEmbeds(markdownContent);
  console.log(`   Images found: ${images.length}`);
  if (embeds.length > 0) {
    console.log(`   Embeds found: ${embeds.length} (${embeds.map(e => e.platform).join(', ')})`);
  }

  const metadata = {};
  const excludeFields = new Set(['body', 'sources', '_rev', '_createdAt']);

  for (const [key, value] of Object.entries(article)) {
    if (!excludeFields.has(key)) {
      metadata[key] = value;
    }
  }

  if (metadata.author && metadata.author._ref && authorMap[metadata.author._ref]) {
    metadata.author = {
      ...metadata.author,
      name: authorMap[metadata.author._ref]
    };
  }

  const mdFile = path.join(articleDir, 'body.md');
  fs.writeFileSync(mdFile, markdownContent, 'utf-8');
  console.log(`   ✓ body.md`);

  const jsonFile = path.join(articleDir, 'metadata.json');
  fs.writeFileSync(jsonFile, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`   ✓ metadata.json`);

  const sources = article.sources || [];
  const sourcesFile = path.join(articleDir, 'source.json');
  fs.writeFileSync(sourcesFile, JSON.stringify({ slug, totalSources: sources.length, sources }, null, 2), 'utf-8');
  console.log(`   ✓ source.json (${sources.length} source${sources.length === 1 ? '' : 's'})`);

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

  return { slug, title: article.title, dir: articleDir, imagesSummary: imageSummary };
}

// ─────────────────────────────────────────────────────────────────────────────
// SORT EXISTING ARTICLE FOLDERS INTO MONTH SUBFOLDERS (no network calls)
// ─────────────────────────────────────────────────────────────────────────────

const MONTH_FOLDER_PATTERN = /^\d{2}_[A-Za-z]{3}$/;

// Re-sorts every article folder under yearDir into its correct month bucket,
// using only what's already saved locally in each article's metadata.json.
// Handles both flat folders (sitting directly under yearDir, e.g. from an
// older archive-article.mjs run) and folders already inside a month
// subfolder that no longer belongs there (e.g. after a month-priority change).
function reorganizeExisting(yearDir, year) {
  const archivedSlugs = new Map(); // slug -> absolute dir path
  if (!fs.existsSync(yearDir)) {
    return { moved: 0, archivedSlugs };
  }

  const entries = fs.readdirSync(yearDir, { withFileTypes: true }).filter((e) => e.isDirectory());

  // Collect every article folder first, regardless of where it currently sits.
  const articleFolders = []; // { name, currentPath, currentMonthFolder }
  for (const entry of entries) {
    const name = entry.name;
    const entryPath = path.join(yearDir, name);

    if (MONTH_FOLDER_PATTERN.test(name)) {
      const subEntries = fs.readdirSync(entryPath, { withFileTypes: true }).filter((e) => e.isDirectory());
      for (const sub of subEntries) {
        articleFolders.push({ name: sub.name, currentPath: path.join(entryPath, sub.name), currentMonthFolder: name });
      }
      continue;
    }

    const metaPath = path.join(entryPath, 'metadata.json');
    if (!fs.existsSync(metaPath)) continue; // not an article folder
    articleFolders.push({ name, currentPath: entryPath, currentMonthFolder: null });
  }

  let moved = 0;

  for (const item of articleFolders) {
    const metaPath = path.join(item.currentPath, 'metadata.json');

    let metadata;
    try {
      metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    } catch {
      console.log(`   ⚠️  ${item.name}: unreadable metadata.json, left in place`);
      archivedSlugs.set(item.name, item.currentPath);
      continue;
    }

    const monthDate = resolveMonthDate(metadata, year);
    if (!monthDate) {
      console.log(`   ⚠️  ${item.name}: no resolvable date, left in place`);
      archivedSlugs.set(item.name, item.currentPath);
      continue;
    }

    const correctMonthFolder = monthFolderName(new Date(monthDate).getMonth() + 1);

    if (item.currentMonthFolder === correctMonthFolder) {
      archivedSlugs.set(item.name, item.currentPath);
      continue;
    }

    const destDir = path.join(yearDir, correctMonthFolder);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const dest = path.join(destDir, item.name);
    fs.renameSync(item.currentPath, dest);
    archivedSlugs.set(item.name, dest);
    moved++;
    const from = item.currentMonthFolder ? `${item.currentMonthFolder}/` : '(flat)';
    console.log(`   ✓ ${item.name}: ${from} → ${correctMonthFolder}/`);
  }

  return { moved, archivedSlugs };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  let year = 2026;
  let month = null; // 1-12, optional
  let outputDir = 'archive/Articles';
  let refresh = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      console.log(`
YEAR ARTICLE ARCHIVER (month-sorted)

Usage:
  node scripts/archive-year.mjs                  Archive all of 2026, sorted by month
  node scripts/archive-year.mjs --month 7         Only fetch/archive July 2026
  node scripts/archive-year.mjs --year 2025       Archive a different year
  node scripts/archive-year.mjs --refresh         Re-download already-archived articles too
  node scripts/archive-year.mjs --help            Show this help

Options:
  --year YYYY           Target year (default: 2026)
  --month 1-12           Only fetch/archive this month (existing folders are
                         still fully re-sorted regardless of this flag)
  --output-dir PATH     Base output directory (default: archive/Articles)
  --refresh             Re-download articles that are already archived

An article's YEAR is resolved the same way the live site does:
  eventDate → publishedAt → _createdAt (first one present wins)
Its MONTH (within that year) is resolved by when it was published/updated:
  publishedAt → updatedAt → eventDate → _createdAt (first match in-year wins)

Output layout:
  <output-dir>/<year>/<MM>_<Mon>/<slug>/body.md
  <output-dir>/<year>/<MM>_<Mon>/<slug>/metadata.json
  <output-dir>/<year>/<MM>_<Mon>/<slug>/Images/...
      `);
      process.exit(0);
    } else if (arg.startsWith('--year=')) {
      year = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--year' && i + 1 < args.length) {
      year = parseInt(args[++i], 10);
    } else if (arg.startsWith('--month=')) {
      month = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--month' && i + 1 < args.length) {
      month = parseInt(args[++i], 10);
    } else if (arg.startsWith('--output-dir=')) {
      outputDir = arg.split('=')[1];
    } else if (arg === '--output-dir' && i + 1 < args.length) {
      outputDir = args[++i];
    } else if (arg === '--refresh') {
      refresh = true;
    }
  }

  if (!Number.isInteger(year)) {
    console.error('❌ --year must be a number, e.g. --year 2026');
    process.exit(1);
  }
  if (month !== null && (!Number.isInteger(month) || month < 1 || month > 12)) {
    console.error('❌ --month must be a number from 1-12');
    process.exit(1);
  }

  const yearDir = path.join(outputDir, String(year));

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`YEAR ARTICLE ARCHIVER — ${year}${month ? ` / ${monthFolderName(month)}` : ''}`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`Year directory: ${yearDir}`);

  // Step 1: sort any pre-existing flat folders into month subfolders first —
  // pure filesystem work, no Sanity calls needed.
  console.log(`\n📁 Sorting existing articles into month folders...`);
  const { moved, archivedSlugs } = reorganizeExisting(yearDir, year);
  console.log(`   ${moved} folder(s) sorted. ${archivedSlugs.size} article(s) already archived for ${year}.`);

  // Step 2: validate Sanity config
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_API_READ_TOKEN;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-06-04';

  if (!projectId || !dataset) {
    console.error('❌ Missing Sanity configuration');
    process.exit(1);
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    console.log(`\n🔍 Querying Sanity for all articles...`);
    const query =
      '*[_type == "article" && defined(slug.current)] | order(coalesce(eventDate, publishedAt, _createdAt) asc) ' +
      '{_id, _createdAt, title, slug, description, leadParagraph, body, mainImage, hasEmbeddedVideo, videoLink, ' +
      'imageGallery, author, publishedAt, updatedAt, eventDate, location, categories, tags, keywords, featured, ' +
      'breakingNews, isFieldReport, needsReview, allowComments, relatedArticles, linkedPitch, deletionRequest, ' +
      'methodology, correction, reviewedBy, seo, faqs, readingTimeMinutes, ' +
      '"sources": sources[]->{_id, label, type, url, description, isAnonymous}}';

    const encodedQuery = encodeURIComponent(query);
    const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodedQuery}`;

    const response = await fetch(url, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Sanity API error: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    const allArticles = result.result || [];
    console.log(`✓ Found ${allArticles.length} total article(s) in Sanity`);

    // Step 3: filter to the target year (and month, if given)
    const matched = allArticles.filter((article) => {
      const resolved = resolveDate(article);
      if (!resolved) return false;
      if (new Date(resolved).getFullYear() !== year) return false;
      if (month !== null) {
        const monthDate = resolveMonthDate(article, year);
        if (!monthDate || new Date(monthDate).getMonth() + 1 !== month) return false;
      }
      return true;
    });

    console.log(`✓ ${matched.length} article(s) match ${year}${month ? `/${monthFolderName(month)}` : ''}\n`);

    if (matched.length === 0) {
      console.log('Nothing to archive.');
      return;
    }

    // Load authors
    console.log('📝 Loading author data...');
    const authorQuery = '*[_type == "author"] { _id, name }';
    const authorUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(authorQuery)}`;
    const authorResponse = await fetch(authorUrl, { headers });
    const authorResult = await authorResponse.json();
    const authorList = authorResult.result || [];

    const authorMap = {};
    for (const author of authorList) {
      authorMap[author._id] = author.name;
    }
    console.log(`✓ Loaded ${authorList.length} authors\n`);

    // Step 4: archive each matched article into its month folder, skipping
    // ones already archived unless --refresh was passed.
    console.log(`${'─'.repeat(60)}`);
    const archived = [];
    let skipped = 0;

    for (const article of matched) {
      const slug = article.slug?.current;
      if (!slug) {
        console.error(`⚠️  Article has no slug: ${article._id}`);
        continue;
      }

      if (archivedSlugs.has(slug) && !refresh) {
        skipped++;
        continue;
      }

      const monthDate = resolveMonthDate(article, year);
      const monthFolder = monthFolderName(new Date(monthDate).getMonth() + 1);
      const articleDir = path.join(yearDir, monthFolder, slug);

      const res = await archiveArticleInto(article, articleDir, projectId, dataset, token, apiVersion, authorMap);
      if (res) {
        archived.push(res);
        archivedSlugs.set(slug, articleDir);
      }
    }

    // Summary
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`✅ COMPLETE`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`Matched ${year}${month ? `/${monthFolderName(month)}` : ''}: ${matched.length}`);
    console.log(`Newly archived: ${archived.length}`);
    console.log(`Skipped (already archived): ${skipped}`);
    console.log(`Reorganized from flat layout: ${moved}`);
    console.log(`Directory: ${yearDir}\n`);

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
