// src/models/schema/article.ts
import { defineField, defineType } from 'sanity';
import {
  AlignLeft,
  BarChart2,
  FileText,
  Flag,
  Image,
  Layers,
  Search,
  ShieldCheck,
  Tag,
} from 'lucide-react';

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: FileText,
  groups: [
    { name: 'all', title: 'All', icon: Layers, default: true },
    { name: 'content', title: 'Content', icon: AlignLeft },
    { name: 'media', title: 'Media', icon: Image },
    { name: 'metadata', title: 'Metadata', icon: Tag },
    { name: 'editorial', title: 'Editorial', icon: Flag },
    { name: 'credibility', title: 'Credibility', icon: ShieldCheck },
    { name: 'seo', title: 'SEO', icon: Search },
    { name: 'analytics', title: 'Analytics', icon: BarChart2 },
  ],
  fields: [
    // ── Content ───────────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: ['content', 'all'],
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      group: ['content', 'all'],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      group: ['content', 'all'],
    }),
    defineField({
      name: 'leadParagraph',
      title: 'Lead / Summary',
      type: 'text',
      rows: 3,
      description:
        '2–3 sentence plain text summary. Used for AI extraction and featured snippets. Falls back to description field.',
      group: ['content', 'all'],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      group: ['content', 'all'],
    }),
    // ── Media ─────────────────────────────────────────────────────────────────
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alternative Text' }],
      group: ['media', 'content', 'all'],
    }),
    defineField({
      name: 'hasEmbeddedVideo',
      title: 'Has Embedded YouTube Video?',
      type: 'boolean',
      group: ['media', 'all'],
    }),
    defineField({
      name: 'videoLink',
      title: 'Video Link',
      type: 'string',
      group: ['media', 'all'],
    }),
    // ── Metadata ──────────────────────────────────────────────────────────────
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: { type: 'author' },
      group: ['metadata', 'all'],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: ['metadata', 'all'],
    }),
    defineField({
      name: 'updatedAt',
      title: 'Last Updated',
      type: 'datetime',
      description:
        'When this article was last materially updated (shown as "Updated: [date]" near byline)',
      group: ['metadata', 'all'],
    }),
    defineField({
      name: 'eventDate',
      title: 'Event Date',
      type: 'datetime',
      group: ['metadata', 'all'],
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Where the story is reported from (e.g. "Atlanta, GA")',
      group: ['metadata', 'all'],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
      group: ['metadata', 'all'],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description:
        'Fine-grained topics, people, places, or events. Use lowercase with hyphens (e.g. "police-brutality", "eric-adams"). These become browsable /tag/[slug] pages.',
      validation: (Rule) => Rule.max(10).warning('Keep tags focused — 10 max per article.'),
      group: ['metadata', 'all'],
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Type a keyword and press Enter or comma to add it. Used for SEO metadata.',
      group: ['metadata', 'seo', 'all'],
    }),
    // ── Editorial ─────────────────────────────────────────────────────────────
    defineField({
      name: 'featured',
      title: 'Featured Article',
      type: 'boolean',
      initialValue: false,
      description: 'Show in featured slots on the homepage. Editors and Admins only.',
      group: ['editorial', 'all'],
    }),
    defineField({
      name: 'breakingNews',
      title: 'Breaking News',
      type: 'boolean',
      initialValue: false,
      description: 'Flag for breaking news ticker. Editors and Admins only.',
      group: ['editorial', 'all'],
    }),
    defineField({
      name: 'isFieldReport',
      title: 'Field Report',
      type: 'boolean',
      initialValue: false,
      description:
        'Marks this article as a field report. Field reports appear in the dedicated Field Reports section on the homepage.',
      group: ['editorial', 'all'],
    }),
    defineField({
      name: 'needsReview',
      title: 'Needs Editorial Review',
      type: 'boolean',
      initialValue: false,
      description: 'Author has submitted this draft for editor review.',
      group: ['editorial', 'all'],
    }),
    defineField({
      name: 'allowComments',
      title: 'Allow Comments',
      type: 'boolean',
      initialValue: true,
      description:
        'Enable the Coral comment section for this article. Disable for sensitive breaking news or articles where discussion is inappropriate.',
      group: ['editorial', 'all'],
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
      validation: (Rule) => Rule.max(6),
      description: 'Up to 6 related articles displayed at end of article',
      group: ['editorial', 'all'],
    }),
    defineField({
      name: 'linkedPitch',
      title: 'Linked Pitch',
      type: 'reference',
      to: [{ type: 'claimedPitch' }],
      weak: true,
      description: 'The claimed pitch from the newsroom brief that led to this article.',
      group: ['editorial', 'all'],
    }),
    defineField({
      name: 'deletionRequest',
      title: 'Deletion Request',
      type: 'object',
      readOnly: true,
      description: 'Set when an author requests removal. Editors approve or deny via the portal.',
      fields: [
        defineField({ name: 'reason', type: 'text', title: 'Reason for removal' }),
        defineField({ name: 'requestedAt', type: 'datetime', title: 'Requested at' }),
        defineField({ name: 'requestedByName', type: 'string', title: 'Requested by' }),
        defineField({
          name: 'originalPublishedAt',
          type: 'datetime',
          title: 'Original published date',
        }),
      ],
      group: ['editorial', 'all'],
    }),
    // ── Credibility ───────────────────────────────────────────────────────────
    defineField({
      name: 'sources',
      title: 'Sources',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'source' }] }],
      description:
        'Reference source documents from the Sources library. Create new sources via the Sources section in the Studio.',
      group: ['credibility', 'all'],
    }),
    defineField({
      name: 'methodology',
      title: 'Methodology Note',
      type: 'text',
      rows: 4,
      description:
        'Optional editorial note on how this story was reported — shown in the Sources panel. E.g. "This story was reported over three weeks. Documents were obtained via FOIA request #2024-1234."',
      group: ['credibility', 'all'],
    }),
    defineField({
      name: 'correction',
      title: 'Correction / Retraction',
      type: 'correctionObject',
      description:
        'Fill this out only when issuing a formal correction, clarification, update, or retraction. Leave empty if no correction applies.',
      group: ['credibility', 'all'],
    }),
    defineField({
      name: 'reviewedBy',
      title: 'Reviewed By',
      type: 'reference',
      to: [{ type: 'author' }],
      description: 'Editorial reviewer or fact-checker',
      group: ['credibility', 'all'],
    }),
    // ── SEO ───────────────────────────────────────────────────────────────────
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seoObject',
      group: ['seo', 'all'],
    }),
    defineField({
      name: 'faqs',
      title: 'FAQ (for structured data)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({ name: 'question', type: 'string', title: 'Question' }),
            defineField({
              name: 'answer',
              type: 'text',
              title: 'Answer',
              description: 'Plain text only — used for FAQPage schema.org structured data',
            }),
          ],
          preview: { select: { title: 'question' } },
        },
      ],
      description:
        'Q&A pairs that appear in FAQPage structured data — increases AI citation chance',
      group: ['seo', 'all'],
    }),
    // ── Analytics ─────────────────────────────────────────────────────────────
    defineField({
      name: 'viewCount',
      title: 'View Count',
      type: 'number',
      description:
        'Populated by the /api/view endpoint and GA import script. Can be edited manually to correct imported values.',
      initialValue: 0,
      validation: (Rule) => Rule.min(0).integer(),
      group: ['analytics', 'all'],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
      publishedAt: 'publishedAt',
    },
    prepare(selection) {
      const { author, publishedAt } = selection;
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'No date';
      return {
        ...selection,
        subtitle: author ? `by ${author} • ${date}` : `${date}`,
      };
    },
  },
});
