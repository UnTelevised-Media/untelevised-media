import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'liveEvent',
  title: 'Live Event',
  type: 'document',
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
      name: 'isCurrentEvent',
      title: 'Is Current Event',
      type: 'boolean', // Adding a boolean field for isCurrentEvent
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
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
      name: 'videoLink',
      title: 'Video Link',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
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
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'article' } }],
    }),
    defineField({
      name: 'keyEvent',
      title: 'Event',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'keyEvent' } }],
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
      name: 'eventTag',
      title: 'Event Tag',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'eventTag' } }],
    }),
    defineField({ name: 'endDate', title: 'Event End Date', type: 'datetime' }),
    defineField({
      name: 'eventStatus',
      title: 'Event Status',
      type: 'string',
      options: {
        list: [
          { title: 'Scheduled', value: 'EventScheduled' },
          { title: 'Cancelled', value: 'EventCancelled' },
          { title: 'Postponed', value: 'EventPostponed' },
          { title: 'Moved Online', value: 'EventMovedOnline' },
        ],
      },
      initialValue: 'EventScheduled',
    }),
    defineField({
      name: 'sources',
      title: 'Sources',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'source' }] }],
      description: 'Reference source documents from the Sources library.',
    }),
    defineField({
      name: 'methodology',
      title: 'Methodology Note',
      type: 'text',
      rows: 4,
      description:
        'Optional note on how this live event is being covered — shown in the Sources panel.',
    }),
    defineField({
      name: 'correction',
      title: 'Correction',
      type: 'correctionObject',
      description:
        'Use for post-publication corrections or clarifications. Live events cannot be retracted — use the Correction, Clarification, or Update types only.',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoObject',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      date: 'eventDate',
    },
    prepare(selection) {
      const { title, date } = selection;
      return {
        title,
        subtitle: `${date ? new Date(date).toDateString() : 'No date'}`,
      };
    },
  },
});
