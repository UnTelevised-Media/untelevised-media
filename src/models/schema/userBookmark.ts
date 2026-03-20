// src/models/schema/userBookmark.ts
// Server-side bookmark storage for authenticated (Clerk) users.
// Each document represents one bookmarked article for one user.

import { defineField, defineType } from 'sanity';
import { BookmarkIcon } from '@sanity/icons';

export default defineType({
  name: 'userBookmark',
  title: 'User Bookmark',
  type: 'document',
  icon: BookmarkIcon,
  fields: [
    defineField({
      name: 'clerkUserId',
      title: 'Clerk User ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Article Slug',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Article Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Article Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'imageUrl',
      title: 'Thumbnail URL',
      type: 'url',
    }),
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading Time',
      type: 'string',
    }),
    defineField({
      name: 'bookmarkedAt',
      title: 'Bookmarked At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'clerkUserId',
    },
    prepare({ title, subtitle }) {
      return {
        title: title ?? 'Untitled',
        subtitle: `User: ${subtitle}`,
      };
    },
  },
});
