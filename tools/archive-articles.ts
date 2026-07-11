#!/usr/bin/env node

/**
 * ARTICLE ARCHIVER
 *
 * Retrieves articles from Sanity and exports them as:
 * - [slug].md: Article body converted from Portable Text to Markdown
 * - [slug].json: All metadata (excluding sources field)
 *
 * Usage:
 *   npx ts-node tools/archive-articles.ts [slug]
 *   node tools/archive-articles.mjs [slug]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Convert Portable Text blocks to Markdown
 */
function portableTextToMarkdown(blocks: any[]): string {
  if (!blocks || blocks.length === 0) return '';

  interface MarkDef {
    _key: string;
    _type: string;
    href?: string;
  }

  interface Span {
    _type: string;
    text: string;
    marks?: string[];
  }

  const resolveMarkDefs = (
    children: Span[],
    markDefs: MarkDef[] = []
  ): Record<string, MarkDef> => {
    const lookup: Record<string, MarkDef> = {};
    if (markDefs) {
      for (const markDef of markDefs) {
        if (markDef._key) {
          lookup[markDef._key] = markDef;
        }
      }
    }
    return lookup;
  };

  const renderInlineChildren = (children: Span[], markDefs: MarkDef[] = []): string => {
    const markLookup = resolveMarkDefs(children, markDefs);
    const result: string[] = [];

    for (const child of children) {
      if (child._type !== 'span') continue;

      let text = child.text || '';
      const marks = child.marks || [];

      // Separate link marks from other marks
      let linkUrl: string | null = null;
      const nonLinkMarks: string[] = [];

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

      // Apply non-link marks (order: code, em, strong for proper nesting)
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

      // Apply link
      if (linkUrl) {
        formattedText = `[${formattedText}](${linkUrl})`;
      }

      result.push(formattedText);
    }

    return result.join('');
  };

  const renderBlock = (block: any): string => {
    const blockType = block._type || 'block';

    if (blockType === 'block') {
      const style = block.style || 'normal';
      const children = block.children || [];
      const markDefs = block.markDefs || [];

      const inlineText = renderInlineChildren(children, markDefs);

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
          return lines.map((line) => `> ${line}`).join('\n');
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

      const markdownRows: string[] = [];
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

  // Add spacing between blocks
  const result: string[] = [];
  for (let i = 0; i < markdownLines.length; i++) {
    result.push(markdownLines[i]);
    if (i < markdownLines.length - 1) {
      const nextLine = markdownLines[i + 1];
      const isCurrentList = /^[-*\d+.]/.test(markdownLines[i].trimStart());
      const isNextList = /^[-*\d+.]/.test(nextLine.trimStart());

      if (!(isCurrentList && isNextList)) {
        result.push('');
      }
    }
  }

  // Remove excessive blank lines
  const finalResult: string[] = [];
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
async function archiveArticle(
  article: any,
  outputDir: string
): Promise<{ md: string; json: string } | null> {
  const slug = article.slug?.current;
  if (!slug) {
    console.error(`Warning: Article has no slug: ${article._id}`);
    return null;
  }

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Convert body to markdown
  const body = article.body || [];
  const markdownContent = portableTextToMarkdown(body);

  // Prepare metadata (exclude sources, body, _rev, _createdAt)
  const metadata: any = {};
  const excludeFields = new Set(['body', 'sources', '_rev', '_createdAt']);

  for (const [key, value] of Object.entries(article)) {
    if (!excludeFields.has(key)) {
      metadata[key] = value;
    }
  }

  // Write markdown file
  const mdFile = path.join(outputDir, `${slug}.md`);
  fs.writeFileSync(mdFile, markdownContent, 'utf-8');
  console.log(`Created: ${mdFile}`);

  // Write metadata JSON file
  const jsonFile = path.join(outputDir, `${slug}.json`);
  fs.writeFileSync(jsonFile, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`Created: ${jsonFile}`);

  return { md: mdFile, json: jsonFile };
}

/**
 * Main function
 */
async function main() {
  let slug: string | null = null;
  let outputDir = 'archive/Articles';

  // Parse arguments
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--output-dir=')) {
      outputDir = arg.split('=')[1];
    } else if (!arg.startsWith('--')) {
      slug = arg;
    }
  }

  console.error(`Archiving articles to: ${outputDir}`);
  if (slug) {
    console.error(`Fetching single article: ${slug}`);
  } else {
    console.error('Fetching all articles...');
  }

  try {
    // Import Sanity client from project
    const { default: sanityClient } = await import('../src/lib/sanity/lib/client.ts');

    // Build GROQ query
    let query = '*[_type == "article"';
    if (slug) {
      query += ` && slug.current == "${slug}"`;
    }
    query +=
      '] | order(publishedAt desc) {_id, title, slug, description, leadParagraph, body, mainImage, hasEmbeddedVideo, videoLink, imageGallery, author, publishedAt, updatedAt, eventDate, location, categories, tags, keywords, featured, breakingNews, isFieldReport, needsReview, allowComments, relatedArticles, linkedPitch, deletionRequest, methodology, correction, reviewedBy, seo, faqs, readingTimeMinutes}';

    const articles = await sanityClient.fetch(query);
    const articleList = Array.isArray(articles) ? articles : [articles];

    if (articleList.length === 0) {
      console.error('No articles found');
      process.exit(1);
    }

    console.error(`Found ${articleList.length} article(s)`);

    // Archive each article
    const archived: Array<{ slug: string; title: string; markdown: string; metadata: string }> =
      [];

    for (const article of articleList) {
      const result = await archiveArticle(article, outputDir);
      if (result) {
        archived.push({
          slug: article.slug?.current || '',
          title: article.title || '',
          markdown: result.md,
          metadata: result.json,
        });
      }
    }

    console.error(`\nArchived ${archived.length} article(s)`);
    for (const item of archived) {
      console.error(`  - ${item.slug}: ${item.title}`);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
