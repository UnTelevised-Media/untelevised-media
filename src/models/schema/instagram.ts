// src/models/schemas/instagram.ts
import { defineType, defineField } from 'sanity';
import { Instagram } from 'lucide-react';

export default defineType({
  name: 'instagramEmbed',
  type: 'object',
  title: 'Instagram Embed',
  icon: Instagram,
  fields: [
    defineField({
      name: 'postId',
      type: 'string',
      title: 'Instagram Post ID',
      description: 'The unique identifier for the Instagram post',
    }),
  ],
});
