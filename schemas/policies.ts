import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'policies',
  title: 'Policies',
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
      name: 'lastUpdate',
      title: 'Last Updated',
      type: 'datetime',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
    },
    prepare(selection) {
      const { title, date } = selection;
      return {
        title,
        subtitle: title && date ? new Date(date).toLocaleString() : 'No date',
      };
    },
  },
});
