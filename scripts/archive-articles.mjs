#!/usr/bin/env node
/**
 * Article Archiver
 * Exports articles from Sanity as Markdown + JSON metadata
 *
 * Usage:
 *   node scripts/archive-articles.mjs [slug] [--output-dir path]
 *   node scripts/archive-articles.mjs                          # archive all
 *   node scripts/archive-articles.mjs the-attack-on-nuseirat   # archive one
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(__dirname);
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
 * Convert Portable Text blocks to Markdown
 */
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

      // Handle list items
      if (listItem) {
        const indent = '  '.repeat(level);
        if (listItem === 'bullet') {
          return `${indent}- ${inlineText}`;
        } else if (listItem === 'number') {
          return `${indent}1. ${inlineText}`;
        }
      }

      // Handle regular block styles
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

/**
 * Archive a single article
 */
function archiveArticle(article, outputDir, authorMap = {}) {
  const slug = article.slug?.current;
  if (!slug) {
    console.error(`Warning: Article has no slug: ${article._id}`);
    return null;
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const body = article.body || [];
  const markdownContent = portableTextToMarkdown(body);

  const metadata = {};
  const excludeFields = new Set(['body', 'sources', '_rev', '_createdAt']);

  for (const [key, value] of Object.entries(article)) {
    if (!excludeFields.has(key)) {
      metadata[key] = value;
    }
  }

  // Resolve author reference to author name if available
  if (metadata.author && metadata.author._ref && authorMap[metadata.author._ref]) {
    metadata.author = {
      ...metadata.author,
      name: authorMap[metadata.author._ref]
    };
  }

  const mdFile = path.join(outputDir, `${slug}.md`);
  fs.writeFileSync(mdFile, markdownContent, 'utf-8');
  console.log(`✓ Created: ${mdFile}`);

  const jsonFile = path.join(outputDir, `${slug}.json`);
  fs.writeFileSync(jsonFile, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`✓ Created: ${jsonFile}`);

  return { md: mdFile, json: jsonFile };
}

/**
 * Main function
 */
async function main() {
  let slug = null;
  let outputDir = 'archive/Articles';

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--output-dir=')) {
      outputDir = arg.split('=')[1];
    } else if (arg === '--output-dir' && i + 1 < process.argv.length) {
      outputDir = process.argv[++i];
    } else if (!arg.startsWith('--')) {
      slug = arg;
    }
  }

  console.log(`📁 Output directory: ${outputDir}`);
  if (slug) {
    console.log(`📄 Archiving single article: ${slug}`);
  } else {
    console.log(`📄 Archiving all articles...`);
  }

  try {
    // Use Sanity REST API directly
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
    const token = process.env.SANITY_API_READ_TOKEN;
    const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-06-04';

    if (!projectId || !dataset) {
      throw new Error('Missing Sanity configuration: NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET');
    }

    let query = '*[_type == "article"';
    if (slug) {
      query += ` && slug.current == "${slug}"`;
    }
    query += '] | order(publishedAt desc) {_id, title, slug, description, leadParagraph, body, mainImage, hasEmbeddedVideo, videoLink, imageGallery, author, publishedAt, updatedAt, eventDate, location, categories, tags, keywords, featured, breakingNews, isFieldReport, needsReview, allowComments, relatedArticles, linkedPitch, deletionRequest, methodology, correction, reviewedBy, seo, faqs, readingTimeMinutes}';

    console.log('\n🔍 Querying Sanity...');
    const encodedQuery = encodeURIComponent(query);
    const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodedQuery}`;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Sanity API error: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    const articleList = result.result || [];

    if (articleList.length === 0) {
      console.error('❌ No articles found');
      process.exit(1);
    }

    console.log(`✓ Found ${articleList.length} article(s)\n`);

    // Fetch all authors to resolve references
    console.log('📝 Loading author data...');
    const authorQuery = '*[_type == "author"] { _id, name }';
    const authorEncodedQuery = encodeURIComponent(authorQuery);
    const authorUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${authorEncodedQuery}`;
    const authorResponse = await fetch(authorUrl, { headers });
    const authorResult = await authorResponse.json();
    const authorList = authorResult.result || [];

    // Build author map: _id -> name
    const authorMap = {};
    for (const author of authorList) {
      authorMap[author._id] = author.name;
    }
    console.log(`✓ Loaded ${authorList.length} authors\n`);

    const archived = [];
    for (const article of articleList) {
      const result = archiveArticle(article, outputDir, authorMap);
      if (result) {
        archived.push({
          slug: article.slug?.current || '',
          title: article.title || '',
        });
      }
    }

    console.log(`\n✅ Archived ${archived.length} article(s)`);
    for (const item of archived) {
      console.log(`   • ${item.slug}: ${item.title}`);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    console.error(error);
    process.exit(1);
  }
}

main();
