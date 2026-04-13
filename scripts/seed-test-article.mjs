/**
 * scripts/seed-test-article.mjs
 * Creates a comprehensive draft test article in Sanity covering every field
 * and every Portable Text block type. Safe to run repeatedly — always creates
 * a new draft, never touches live content.
 *
 * Usage:  node scripts/seed-test-article.mjs
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Load .env.local ───────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');

function loadEnv(filePath) {
  const env = {};
  try {
    const content = readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  } catch {
    console.error('Could not read .env.local — make sure you run from the project root.');
    process.exit(1);
  }
  return env;
}

const env = loadEnv(envPath);

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset   = env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2025-06-04';
const token     = env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error('Missing required env vars. Check .env.local for NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token });

// ── Helpers ───────────────────────────────────────────────────────────────────

let _keyCounter = 0;
function k() {
  return `seed${++_keyCounter}${Math.random().toString(36).slice(2, 5)}`;
}

function span(text, marks = []) {
  return { _type: 'span', _key: k(), text, marks };
}

function block(style, children, markDefs = [], extra = {}) {
  return { _type: 'block', _key: k(), style, children, markDefs, ...extra };
}

function heading(level, text) {
  return block(`h${level}`, [span(text)]);
}

function paragraph(...children) {
  return block('normal', children);
}

function listItem(type, text, marks = []) {
  return { _type: 'block', _key: k(), style: 'normal', listItem: type, level: 1, children: [span(text, marks)], markDefs: [] };
}

// ── Fetch real sanity author and category IDs ─────────────────────────────────

console.log('Fetching existing authors and categories…');

const [authors, categories] = await Promise.all([
  client.fetch(`*[_type == "author" && isActive == true][0..2]{ _id, name }`),
  client.fetch(`*[_type == "category"][0..3]{ _id, title }`),
]);

if (!authors.length) {
  console.error('No active authors found in Sanity. Create at least one author first.');
  process.exit(1);
}

const authorRef  = authors[0]._id;
const catRefs    = categories.slice(0, 2).map(c => ({ _type: 'reference', _ref: c._id }));

console.log(`Using author: ${authors[0].name}`);
console.log(`Using categories: ${categories.slice(0, 2).map(c => c.title).join(', ')}`);

// ── Build Portable Text body ──────────────────────────────────────────────────

const linkKey = k();

const body = [
  // H1 heading
  heading(1, 'Test Article — All Rich Text Elements'),

  // Normal paragraph with mixed marks
  block('normal', [
    span('This article is a '),
    span('comprehensive test', ['strong']),
    span(' covering '),
    span('every field', ['em']),
    span(' and '),
    span('every Portable Text block type', ['underline']),
    span(' supported by the editor. It should '),
    span('never be published', ['s']),
    span(' to live readers.'),
  ]),

  // Paragraph with an inline link
  {
    _type: 'block', _key: k(), style: 'normal',
    markDefs: [{ _type: 'link', _key: linkKey, href: 'https://untelevised.live' }],
    children: [
      span('Visit the '),
      { _type: 'span', _key: k(), text: 'UnTelevised live site', marks: [linkKey] },
      span(' for live coverage.'),
    ],
  },

  // H2 heading
  heading(2, 'Heading Level 2 — Section Opener'),

  // Blockquote
  block('blockquote', [span('"Journalism is printing what someone else does not want printed; everything else is public relations." — George Orwell')]),

  // H3
  heading(3, 'Heading Level 3 — Sub-section'),

  // Bullet list
  listItem('bullet', 'First bullet — plain text'),
  listItem('bullet', 'Second bullet — bold item', ['strong']),
  listItem('bullet', 'Third bullet — italic item', ['em']),

  // H4
  heading(4, 'Heading Level 4 — Detail'),

  // Numbered list
  listItem('number', 'Step one: gather sources'),
  listItem('number', 'Step two: verify independently'),
  listItem('number', 'Step three: publish with transparency'),

  // Code block
  {
    _type: 'code', _key: k(),
    language: 'javascript',
    code: `// Example: fetch an article from Sanity\nconst article = await client.fetch(\n  \`*[_type == "article" && slug.current == $slug][0]\`,\n  { slug: "test-article" }\n);\nconsole.log(article.title);`,
  },

  // Paragraph after code
  paragraph(
    span('The code block above shows how to query an article from Sanity using GROQ. '),
    span('Note the use of inline code marks: ', []),
    span('*[_type == "article"]', ['code']),
    span(' is a GROQ wildcard query.'),
  ),

  // Table
  {
    _type: 'table', _key: k(),
    rows: [
      { _type: 'row', _key: k(), cells: ['Field', 'Type', 'Required', 'Notes'] },
      { _type: 'row', _key: k(), cells: ['title', 'string', 'Yes', 'Max 300 chars'] },
      { _type: 'row', _key: k(), cells: ['slug', 'slug', 'Yes', 'Lowercase, hyphens'] },
      { _type: 'row', _key: k(), cells: ['body', 'Portable Text', 'No', 'Block content array'] },
      { _type: 'row', _key: k(), cells: ['status', 'enum', 'Yes', 'draft | published'] },
    ],
  },

  // Divider / break
  { _type: 'break', _key: k() },

  // YouTube embed
  {
    _type: 'youtubeEmbed', _key: k(),
    videoId: 'dQw4w9WgXcQ',
  },

  // Twitter embed
  {
    _type: 'twitterEmbed', _key: k(),
    tweetId: '1519480761749016577',
  },

  // Instagram embed
  {
    _type: 'instagramEmbed', _key: k(),
    postId: 'CXnzMpYMoSX',
  },

  // Final paragraph
  paragraph(span('End of test content. All block types rendered successfully.')),
];

// ── Build the full article document ──────────────────────────────────────────

const now = new Date().toISOString();
const slug = `test-article-${Date.now()}`;

const doc = {
  _type: 'article',

  // Core fields
  title: '[TEST] Full Rich Text & Field Coverage Article',
  slug: { _type: 'slug', current: slug },
  status: 'draft',
  featured: false,
  breakingNews: false,
  needsReview: false,

  // Author & categories
  author: { _type: 'reference', _ref: authorRef },
  categories: catRefs,

  // Text fields
  description: 'This is a test article created by the seed script to verify that all fields and rich text elements render correctly in the author portal editor. Do not publish.',
  leadParagraph: 'A comprehensive test article covering every Portable Text block type (headings H1–H4, paragraphs, blockquotes, bullet and numbered lists, code blocks, tables, dividers, YouTube / Twitter / Instagram embeds) plus all metadata fields.',

  // Body
  body,

  // SEO / metadata
  tags: ['test', 'rich-text', 'seed-data', 'portal-qa'],
  keywords: ['test article', 'portable text', 'sanity', 'blocknote', 'qa'],
  location: 'Atlanta, GA',
  allowComments: false,

  // Media
  hasEmbeddedVideo: true,
  videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',

  // Dates
  publishedAt: undefined,
  eventDate: new Date('2026-06-15T19:00:00.000Z').toISOString(),

  // Methodology
  methodology: 'This article was created programmatically by scripts/seed-test-article.mjs for QA purposes. No sources were consulted. No real journalism occurred.',

  // FAQs
  faqs: [
    {
      question: 'What is the purpose of this test article?',
      answer: 'It exists solely to verify that the author portal editor renders and saves all field types correctly without touching any live published content.',
    },
    {
      question: 'Can I publish this article?',
      answer: 'No. This is seed data for QA. Delete it from the portal or Sanity Studio when testing is complete.',
    },
    {
      question: 'What rich text elements does this article include?',
      answer: 'H1–H4 headings, normal paragraphs, blockquotes, bullet lists, numbered lists, code blocks, tables, horizontal dividers, YouTube embeds, Twitter embeds, Instagram embeds, and inline marks (bold, italic, underline, strikethrough, code, links).',
    },
  ],

  // Related articles — left empty (no stable article IDs to reference in seed)
  relatedArticles: [],
  sources: [],

  // Correction — include a sample correction so the correction panel can be tested
  correction: {
    type: 'correction',
    issuedAt: now,
    summary: 'TEST — An earlier version of this article did not exist at all.',
    detail: 'This is a test correction entry. It demonstrates how the correction banner renders on an article page. In production, only issue corrections for genuine editorial errors.',
  },

  updatedAt: now,
};

// ── Create in Sanity ──────────────────────────────────────────────────────────

console.log('\nCreating draft test article in Sanity…');

try {
  const created = await client.create(doc);
  console.log('\n✓ Draft article created successfully.');
  console.log(`  _id:  ${created._id}`);
  console.log(`  slug: ${slug}`);
  console.log(`\n  Open in portal:  /portal/articles/${created._id}/edit`);
  console.log(`  Open in Studio:  /studio/desk/article;${created._id}`);
  console.log('\nRemember to delete this article when QA is complete.');
} catch (err) {
  console.error('\n✗ Failed to create article:', err.message);
  process.exit(1);
}
