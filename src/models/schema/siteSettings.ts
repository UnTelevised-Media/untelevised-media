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
  fields: [
    defineField({
      name: 'name',
      title: 'Site Name',
      type: 'string',
      initialValue: 'UnTelevised Media',
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
