// src/models/schema/userWishlist.ts
// Per-user book wishlist document for authenticated Clerk users.
// Mirrors the userBookmark schema pattern.

import { defineField, defineType } from 'sanity';
import { StarIcon } from '@sanity/icons';

export default defineType({
  name: 'userWishlist',
  title: 'User Wishlist',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'clerkUserId',
      title: 'Clerk User ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Book Slug',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Book Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coverImageUrl',
      title: 'Cover Image URL',
      type: 'url',
    }),
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
    }),
    defineField({
      name: 'price',
      title: 'Price (USD)',
      type: 'number',
    }),
    defineField({
      name: 'addedAt',
      title: 'Added At',
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
