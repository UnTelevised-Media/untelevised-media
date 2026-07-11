#!/usr/bin/env node
/**
 * UNIFIED ARTICLE ARCHIVER
 *
 * Archives a single article (or all) with:
 * - Markdown body (converted from Portable Text)
 * - JSON metadata (with author name)
 * - Downloaded images (organized in subfolder)
 *
 * Usage:
 *   node scripts/archive-article.mjs [slug]              # Archive one article
 *   node scripts/archive-article.mjs                      # Archive all articles
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

      const parts = [`alt="${alt}"`];
      if (assetRef) parts.push(`asset="${assetRef}"`);
      if (caption) parts.push(`caption="${caption}"`);
      if (credit) parts.push(`credit="${credit}"`);

      return `<!-- IMAGE ${parts.join(' ')} -->`;
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
// IMAGE EXTRACTION & DOWNLOAD
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

async function downloadImages(slug, images, imagesDir, projectId, dataset, token, apiVersion) {
  if (images.length === 0) {
    return { downloaded: 0, failed: 0, images: [] };
  }

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  let downloaded = 0;
  let failed = 0;
  const downloadedImages = [];

  for (let idx = 0; idx < images.length; idx++) {
    const img = images[idx];
    const assetId = img.asset;

    const imageData = await getImageUrl(assetId, projectId, dataset, token, apiVersion);
    if (!imageData) {
      img.downloaded = false;
      img.filename = null;
      downloadedImages.push(img);
      failed++;
      continue;
    }

    const ext = getFileExtension(assetId, imageData.mimeType, imageData.originalFilename);
    const filename = `image-${idx + 1}${ext}`;
    const outputPath = path.join(imagesDir, filename);

    const success = await downloadImage(imageData.url, outputPath);
    if (success) {
      img.downloaded = true;
      img.filename = filename;
      downloaded++;
      console.log(`      ✓ ${filename}`);
    } else {
      img.downloaded = false;
      img.filename = filename;
      failed++;
      console.log(`      ✗ ${filename}`);
    }

    downloadedImages.push(img);
  }

  return { downloaded, failed, images: downloadedImages };
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCHIVE ARTICLE
// ─────────────────────────────────────────────────────────────────────────────

async function archiveArticle(article, archiveDir, imagesDir, projectId, dataset, token, apiVersion, authorMap) {
  const slug = article.slug?.current;
  if (!slug) {
    console.error(`⚠️  Article has no slug: ${article._id}`);
    return null;
  }

  console.log(`\n📄 ${article.title}`);
  console.log(`   Slug: ${slug}`);

  // Create directories
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  // 1. Convert body to markdown
  const body = article.body || [];
  const markdownContent = portableTextToMarkdown(body);

  // 2. Extract images from markdown
  const images = extractImages(markdownContent);
  console.log(`   Images found: ${images.length}`);

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
  const mdFile = path.join(archiveDir, `${slug}.md`);
  fs.writeFileSync(mdFile, markdownContent, 'utf-8');
  console.log(`   ✓ Markdown: ${slug}.md`);

  // 5. Save metadata JSON
  const jsonFile = path.join(archiveDir, `${slug}.json`);
  fs.writeFileSync(jsonFile, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`   ✓ Metadata: ${slug}.json`);

  // 6. Download images
  let imageSummary = '';
  if (images.length > 0) {
    console.log(`   Downloading images...`);
    const slugImagesDir = path.join(imagesDir, slug);
    const result = await downloadImages(slug, images, slugImagesDir, projectId, dataset, token, apiVersion);

    // Save image metadata
    const imgMetadata = {
      slug,
      totalImages: images.length,
      downloadedAt: new Date().toISOString(),
      images: result.images.map((img, idx) => ({
        index: idx,
        alt: img.alt,
        caption: img.caption,
        credit: img.credit,
        asset: img.asset,
        filename: img.filename,
        downloaded: img.downloaded
      }))
    };

    const imgMetaFile = path.join(slugImagesDir, 'images.json');
    fs.writeFileSync(imgMetaFile, JSON.stringify(imgMetadata, null, 2), 'utf-8');
    console.log(`   ✓ Images: ${result.downloaded}/${images.length} downloaded`);
    if (result.failed > 0) {
      console.log(`   ⚠️  ${result.failed} image(s) failed`);
    }
    imageSummary = ` (${result.downloaded}/${images.length} images)`;
  } else {
    console.log(`   ℹ️  No images to download`);
  }

  return {
    slug,
    title: article.title,
    markdown: mdFile,
    metadata: jsonFile,
    imagesSummary: imageSummary
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  let slug = null;
  let archiveDir = 'archive/Articles';
  let imagesDir = 'archive/Images';

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      console.log(`
UNIFIED ARTICLE ARCHIVER

Usage:
  node scripts/archive-article.mjs [slug]           Archive a single article
  node scripts/archive-article.mjs                  Archive all articles
  node scripts/archive-article.mjs --help           Show this help

Examples:
  # Archive one article
  node scripts/archive-article.mjs kashmir-s-unbroken-revolution

  # Archive all articles
  node scripts/archive-article.mjs

Options:
  --archive-dir PATH    Markdown & metadata output directory
  --images-dir PATH     Images output directory

What gets archived:
  ✓ Article body (Portable Text → Markdown)
  ✓ Article metadata (JSON with author name)
  ✓ All body images (downloaded from Sanity)
      `);
      process.exit(0);
    } else if (arg.startsWith('--archive-dir=')) {
      archiveDir = arg.split('=')[1];
    } else if (arg === '--archive-dir' && i + 1 < args.length) {
      archiveDir = args[++i];
    } else if (arg.startsWith('--images-dir=')) {
      imagesDir = arg.split('=')[1];
    } else if (arg === '--images-dir' && i + 1 < args.length) {
      imagesDir = args[++i];
    } else if (!arg.startsWith('--')) {
      slug = arg;
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`UNIFIED ARTICLE ARCHIVER`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`Archive dir: ${archiveDir}`);
  console.log(`Images dir:  ${imagesDir}`);

  if (slug) {
    console.log(`Target: Single article (${slug})\n`);
  } else {
    console.log(`Target: All articles\n`);
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

  try {
    // Fetch articles
    console.log('🔍 Querying Sanity...');
    let query = '*[_type == "article"';
    if (slug) {
      query += ` && slug.current == "${slug}"`;
    }
    query += '] | order(publishedAt desc) {_id, title, slug, description, leadParagraph, body, mainImage, hasEmbeddedVideo, videoLink, imageGallery, author, publishedAt, updatedAt, eventDate, location, categories, tags, keywords, featured, breakingNews, isFieldReport, needsReview, allowComments, relatedArticles, linkedPitch, deletionRequest, methodology, correction, reviewedBy, seo, faqs, readingTimeMinutes}';

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
      const result = await archiveArticle(article, archiveDir, imagesDir, projectId, dataset, token, apiVersion, authorMap);
      if (result) {
        archived.push(result);
      }
    }

    // Summary
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`✅ COMPLETE`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`Archived: ${archived.length} article(s)`);
    console.log(`Directory: ${archiveDir}`);
    console.log(`Images:   ${imagesDir}\n`);

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
