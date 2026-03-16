// src/models/schema/siteSettings.ts
// Singleton document for global brand/organization settings
// Powers Organization structured data and global metadata

import { defineField, defineType } from 'sanity';
import { Settings } from 'lucide-react';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: Settings,
  groups: [
    {
      name: 'breaking',
      title: '🔴 Breaking News Banner',
      default: true,
    },
    {
      name: 'general',
      title: 'General',
    },
  ],
  fields: [
    defineField({
      name: 'breakingNewsBanner',
      title: 'Breaking News Banner',
      type: 'object',
      group: 'breaking',
      description: 'Configure the site-wide breaking news banner. Toggle on/off instantly.',
      fields: [
        defineField({
          name: 'isActive',
          title: 'Show Banner',
          type: 'boolean',
          initialValue: false,
          description:
            'Toggle ON to show the breaking news banner across the entire site. Toggle OFF to hide it.',
        }),
        defineField({
          name: 'headline',
          title: 'Headline',
          type: 'string',
          description: 'Short breaking news headline. Keep under 80 characters.',
          validation: (Rule) => Rule.max(100).warning('Aim for 80 characters or fewer.'),
        }),
        defineField({
          name: 'linkUrl',
          title: 'Link URL',
          type: 'string',
          description: 'Internal path (e.g. /articles/my-article) or full external URL.',
        }),
        defineField({
          name: 'linkLabel',
          title: 'Link Label',
          type: 'string',
          initialValue: 'Read More',
          description: 'Text for the CTA link. e.g. "Read More", "Watch Live", "Follow Coverage".',
        }),
        defineField({
          name: 'expiresAt',
          title: 'Auto-Expire At',
          type: 'datetime',
          description:
            'Optional: banner automatically hides after this time without manual toggle.',
        }),
      ],
      preview: {
        select: {
          isActive: 'isActive',
          headline: 'headline',
        },
        prepare({ isActive, headline }: { isActive: boolean; headline: string }) {
          return {
            title: isActive ? '🔴 ACTIVE' : '⚫ Inactive',
            subtitle: headline ?? 'No headline set',
          };
        },
      },
    }),
    defineField({
      name: 'name',
      title: 'Site Name',
      type: 'string',
      initialValue: 'UnTelevised Media',
      group: 'general',
    }),
    defineField({
      name: 'description',
      title: 'Site Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'foundingDate',
      title: 'Founding Date',
      type: 'date',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        defineField({ name: 'twitter', title: 'Twitter / X', type: 'url' }),
        defineField({ name: 'instagram', title: 'Instagram', type: 'url' }),
        defineField({ name: 'facebook', title: 'Facebook', type: 'url' }),
        defineField({ name: 'youtube', title: 'YouTube', type: 'url' }),
        defineField({ name: 'tiktok', title: 'TikTok', type: 'url' }),
      ],
    }),
    defineField({
      name: 'defaultOgImage',
      title: 'Default OG Image',
      type: 'image',
      description: 'Fallback social share image used when no page-specific image is available',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: 'name', media: 'logo' },
  },
});
