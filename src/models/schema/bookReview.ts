// src/models/schema/bookReview.ts
// Admin-moderated reader reviews for books.
// Reviews are only visible publicly after admin sets approved: true.

import { defineField, defineType } from 'sanity';
import { StarIcon } from '@sanity/icons';

export default defineType({
  name: 'bookReview',
  title: 'Book Review',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'book',
      title: 'Book',
      type: 'reference',
      to: [{ type: 'book' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reviewerName',
      title: 'Reviewer Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reviewerLocation',
      title: 'Reviewer Location',
      type: 'string',
    }),
    defineField({
      name: 'rating',
      title: 'Rating (1–5)',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(5).integer(),
    }),
    defineField({
      name: 'body',
      title: 'Review',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required().min(20),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Declined', value: 'declined' },
          { title: 'Needs Revision', value: 'needs_revision' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'approved',
      title: 'Approved (legacy)',
      type: 'boolean',
      initialValue: false,
      hidden: true,
      description: 'Legacy field — use status instead.',
    }),
    defineField({
      name: 'clerkUserId',
      title: 'Clerk User ID',
      type: 'string',
      readOnly: true,
      description: 'Set automatically when submitted by a signed-in user.',
    }),
    defineField({
      name: 'adminFeedback',
      title: 'Admin Feedback',
      type: 'text',
      rows: 3,
      description: 'Shown to the reviewer when status is "Needs Revision".',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'reviewerName',
      rating: 'rating',
      status: 'status',
      bookTitle: 'book.title',
    },
    prepare({ title, rating, status, bookTitle }) {
      const stars = '★'.repeat((rating as number) ?? 0);
      const badge = status === 'approved' ? '' : ` [${status ?? 'pending'}]`;
      return {
        title: `${stars} — ${title ?? 'Unknown'}`,
        subtitle: `${bookTitle ?? 'Unknown book'}${badge}`,
      };
    },
  },
});
