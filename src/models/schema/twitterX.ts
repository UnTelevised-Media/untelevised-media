// src/models/schemas/twitterX.ts
import { defineType, defineField } from 'sanity';
import { Twitter } from 'lucide-react';

export default defineType({
  name: 'twitterEmbed',
  type: 'object',
  title: 'Twitter Embed',
  icon: Twitter,
  fields: [
    defineField({
      name: 'tweetId',
      type: 'string',
      title: 'Tweet ID',
      description: 'The unique identifier for the Twitter/X post',
    }),
  ],
});
