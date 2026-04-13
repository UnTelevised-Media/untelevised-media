// src/models/schema/article.ts
import { defineField, defineType } from 'sanity';
import { FileText } from 'lucide-react';

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: FileText,
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'hasEmbeddedVideo',
      title: 'Has Embedded Youtube Video?',
      type: 'boolean', // Adding a boolean field for isCurrentEvent
    }),
    defineField({
      name: 'videoLink',
      title: 'Video Link',
      type: 'string',
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Type a keyword and press Enter or comma to add it. Used for SEO metadata.',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: { type: 'author' },
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        },
      ],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
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
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    defineField({
      name: 'eventDate',
      title: 'Event Date',
      type: 'datetime',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
    // Location field — used in UI, now explicit in schema
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Where the story is reported from (e.g. "Atlanta, GA")',
    }),
    // EEAT fields — updated date, corrections, sources
    defineField({
      name: 'updatedAt',
      title: 'Last Updated',
      type: 'datetime',
      description:
        'When this article was last materially updated (shown as "Updated: [date]" near byline)',
    }),
    defineField({
      name: 'correction',
      title: 'Correction / Retraction',
      type: 'correctionObject',
      description:
        'Fill this out only when issuing a formal correction, clarification, update, or retraction. Leave empty if no correction applies.',
    }),
    defineField({
      name: 'sources',
      title: 'Sources',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'source' }] }],
      description:
        'Reference source documents from the Sources library. Create new sources via the Sources section in the Studio.',
    }),
    defineField({
      name: 'methodology',
      title: 'Methodology Note',
      type: 'text',
      rows: 4,
      description:
        'Optional editorial note on how this story was reported — shown in the Sources panel. E.g. "This story was reported over three weeks. Documents were obtained via FOIA request #2024-1234."',
    }),
    defineField({
      name: 'leadParagraph',
      title: 'Lead / Summary',
      type: 'text',
      rows: 3,
      description:
        '2–3 sentence plain text summary. Used for AI extraction and featured snippets. Falls back to description field.',
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
    }),
    defineField({
      name: 'reviewedBy',
      title: 'Reviewed By',
      type: 'reference',
      to: [{ type: 'author' }],
      description: 'Editorial reviewer or fact-checker',
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
      validation: (Rule) => Rule.max(6),
      description: 'Up to 6 related articles displayed at end of article',
    }),
    // Portal fields — featured, breaking news, editorial review
    defineField({
      name: 'featured',
      title: 'Featured Article',
      type: 'boolean',
      initialValue: false,
      description: 'Show in featured slots on the homepage. Editors and Admins only.',
    }),
    defineField({
      name: 'breakingNews',
      title: 'Breaking News',
      type: 'boolean',
      initialValue: false,
      description: 'Flag for breaking news ticker. Editors and Admins only.',
    }),
    defineField({
      name: 'needsReview',
      title: 'Needs Editorial Review',
      type: 'boolean',
      initialValue: false,
      description: 'Author has submitted this draft for editor review.',
    }),
    // Comments
    defineField({
      name: 'allowComments',
      title: 'Allow Comments',
      type: 'boolean',
      description:
        'Enable the Coral comment section for this article. Disable for sensitive breaking news or articles where discussion is inappropriate.',
      initialValue: true,
    }),
    // SEO overrides
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seoObject',
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
