import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'twitter',
  type: 'object',
  title: 'Twitter Embed',
  fields: [
    {
      name: 'id',
      type: 'string',
      title: 'Twitter tweet ID',
    },
  ],
});
