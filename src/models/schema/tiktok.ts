// src/models/schemas/tiktok.ts
import { defineType, defineField } from 'sanity';
import { Music } from 'lucide-react';

export default defineType({
  name: 'tiktokEmbed',
  type: 'object',
  title: 'TikTok Embed',
  icon: Music,
  fields: [
    defineField({
      name: 'videoUrl',
      type: 'url',
      title: 'TikTok Video URL',
      description:
        'The full URL of the TikTok video (e.g. https://www.tiktok.com/@username/video/1234567890)',
      validation: (Rule) => Rule.required().uri({ scheme: ['https', 'http'] }),
    }),
  ],
  preview: {
    select: { videoUrl: 'videoUrl' },
    prepare({ videoUrl }: { videoUrl?: string }) {
      return {
        title: 'TikTok Video',
        subtitle: videoUrl ?? 'No URL set',
      };
    },
  },
});
