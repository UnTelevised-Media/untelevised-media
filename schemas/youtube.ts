import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'youtubeEmbed',
  type: 'object',
  title: 'YouTube Embed',
  fields: [
    defineField({
      name: 'videoId',
      type: 'string',
      title: 'YouTube Video ID',
    }),
  ],
});

