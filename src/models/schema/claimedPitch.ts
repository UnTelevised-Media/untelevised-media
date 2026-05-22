// src/models/schema/claimedPitch.ts
// A snapshot of a story pitch that was claimed or assigned to an author.
// Created automatically when a pitch is claimed in the portal.
// Persists independently of the brief so old briefs can be archived.
import { defineField, defineType } from 'sanity';
import { BookIcon } from '@sanity/icons';

export default defineType({
  name: 'claimedPitch',
  title: 'Claimed Pitch',
  type: 'document',
  icon: BookIcon,
  groups: [
    { name: 'pitch', title: 'Pitch' },
    { name: 'notes', title: 'Notes & Progress' },
  ],
  fields: [
    // ── Source reference ────────────────────────────────────────────────────
    defineField({
      name: 'briefId',
      title: 'Brief ID',
      type: 'string',
      group: 'pitch',
      description: 'ID of the source brief document.',
      readOnly: true,
    }),
    defineField({
      name: 'briefTitle',
      title: 'Brief Title',
      type: 'string',
      group: 'pitch',
      readOnly: true,
    }),
    defineField({
      name: 'storyKey',
      title: 'Story Key',
      type: 'string',
      group: 'pitch',
      description: '_key of the pitch within the source brief.',
      readOnly: true,
    }),

    // ── Pitch copy ──────────────────────────────────────────────────────────
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'pitch',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'angle',
      title: 'Angle / Hook',
      type: 'text',
      rows: 3,
      group: 'pitch',
    }),
    defineField({
      name: 'beat',
      title: 'Beat',
      type: 'string',
      group: 'pitch',
    }),
    defineField({
      name: 'urgency',
      title: 'Urgency',
      type: 'string',
      group: 'pitch',
      options: {
        list: [
          { title: '🚨 Breaking', value: 'breaking' },
          { title: '🔴 High', value: 'high' },
          { title: '🟡 Medium', value: 'medium' },
          { title: '🟢 Low', value: 'low' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'sourceSuggestions',
      title: 'Suggested Sources',
      type: 'text',
      rows: 2,
      group: 'pitch',
    }),
    defineField({
      name: 'links',
      title: 'Reference Links',
      type: 'array',
      group: 'pitch',
      of: [
        {
          type: 'object',
          name: 'referenceLink',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
          preview: { select: { title: 'label', subtitle: 'url' } },
        },
      ],
    }),

    // ── Ownership ───────────────────────────────────────────────────────────
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'pitch',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'assignedBy',
      title: 'Assigned By',
      type: 'reference',
      to: [{ type: 'author' }],
      weak: true,
      group: 'pitch',
      description: 'Set when an editor assigned this pitch rather than the author self-claiming.',
    }),
    defineField({
      name: 'claimedAt',
      title: 'Claimed At',
      type: 'datetime',
      group: 'pitch',
    }),

    // ── Status & linked article ─────────────────────────────────────────────
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'notes',
      options: {
        list: [
          { title: 'Claimed', value: 'claimed' },
          { title: 'In Progress', value: 'in_progress' },
          { title: 'Published', value: 'published' },
          { title: 'Abandoned', value: 'abandoned' },
        ],
      },
      initialValue: 'claimed',
    }),
    defineField({
      name: 'linkedArticle',
      title: 'Linked Article',
      type: 'reference',
      to: [{ type: 'article' }],
      weak: true,
      group: 'notes',
      description: 'Article written from this pitch once published.',
    }),

    // ── Working notes (block content) ───────────────────────────────────────
    defineField({
      name: 'notes',
      title: 'Working Notes',
      type: 'array',
      group: 'notes',
      description: "Author's private working notes for this story.",
      of: [{ type: 'block' }],
    }),
  ],

  preview: {
    select: {
      title: 'headline',
      author: 'author.name',
      status: 'status',
      urgency: 'urgency',
    },
    prepare({ title, author, status, urgency }) {
      const icons: Record<string, string> = {
        breaking: '🚨',
        high: '🔴',
        medium: '🟡',
        low: '🟢',
      };
      return {
        title: title ?? 'Claimed Pitch',
        subtitle: `${icons[urgency] ?? ''} ${author ?? 'Unknown'} — ${status ?? 'claimed'}`,
      };
    },
  },

  orderings: [
    {
      title: 'Newest First',
      name: 'newestFirst',
      by: [{ field: 'claimedAt', direction: 'desc' }],
    },
    {
      title: 'By Author',
      name: 'byAuthor',
      by: [{ field: 'author.name', direction: 'asc' }],
    },
  ],
});
