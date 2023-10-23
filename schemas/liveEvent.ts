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
      of: [{ type: 'reference', to: { type: 'post' } }],
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
      type: 'string',
    }),
    defineField({
      name: 'eventTag',
      title: 'Event Tag',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'eventTag' } }],
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
