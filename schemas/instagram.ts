import { defineType, defineField } from 'sanity';

// instagram.ts
export default defineType({
  name: 'instagramEmbed',
  type: 'object',
  title: 'Instagram Embed',
  fields: [
    defineField({
      name: 'postId',
      type: 'string',
      title: 'Instagram Post ID',
    }),
  ],
});
