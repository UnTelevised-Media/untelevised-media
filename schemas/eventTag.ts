import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'eventTag',
  title: 'Event Tag',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
  ],
});
