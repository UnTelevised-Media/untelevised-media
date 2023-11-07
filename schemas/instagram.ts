import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'instagram',
  type: 'object',
  title: 'Instagram Embed',
  fields: [
    {
      name: 'id',
      type: 'string',
      title: 'Instagram post ID',
    },
  ],
});
