// src/models/schemas/youtube.ts
import { defineType, defineField } from 'sanity';
import { Video } from 'lucide-react';

export default defineType({
  name: 'youtubeEmbed',
  type: 'object',
  title: 'YouTube Embed',
  icon: Video,
  fields: [
    defineField({
      name: 'videoId',
      type: 'string',
      title: 'YouTube Video ID',
      description: 'The unique identifier for the YouTube video (found in the URL)',
    }),
  ],
});
