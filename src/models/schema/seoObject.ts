// src/models/schema/seoObject.ts
// Reusable SEO object type — add to article, liveEvent, category schemas

import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'seoObject',
  title: 'SEO Settings',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Override the page title for search engines (50–60 characters recommended)',
      validation: (Rule) => Rule.max(60).warning('Meta title should be under 60 characters'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description:
        'Override the page description for search engines (150–160 characters recommended)',
      validation: (Rule) =>
        Rule.max(160).warning('Meta description should be under 160 characters'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social Share Image',
      type: 'image',
      description: 'Override the default Open Graph image (recommended: 1200×630)',
      options: { hotspot: true },
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      description: 'If enabled, this page will not be indexed by search engines',
      initialValue: false,
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      description:
        'Override the canonical URL (only set if this content is republished elsewhere)',
    }),
  ],
});
