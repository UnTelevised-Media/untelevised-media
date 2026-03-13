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
      type: 'string',
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
      name: 'corrections',
      title: 'Corrections',
      type: 'text',
      rows: 3,
      description:
        'Any corrections or updates to the original article (displayed as a notice block)',
    }),
    defineField({
      name: 'sources',
      title: 'Sources',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Source Name', type: 'string' }),
            defineField({ name: 'url', title: 'Source URL', type: 'url' }),
          ],
          preview: { select: { title: 'label', subtitle: 'url' } },
        },
      ],
      description: 'Source links displayed at the bottom of the article',
    }),
    defineField({
      name: 'leadParagraph',
      title: 'Lead / Summary',
      type: 'text',
      rows: 3,
      description:
        '2–3 sentence plain text summary. Used for AI extraction and featured snippets. Falls back to description field.',
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
