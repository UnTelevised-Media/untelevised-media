import { defineType, defineField } from 'sanity';

// twitter.ts
export default defineType({
  name: 'twitterEmbed',
  type: 'object',
  title: 'Twitter Embed',
  fields: [
    defineField({
      name: 'tweetId',
      type: 'string',
      title: 'Tweet ID',
    }),
  ],
});
