// src/models/schemas/vimeo.ts
import { defineType, defineField } from 'sanity';
import { PlayIcon } from '@sanity/icons';

export default defineType({
  name: 'vimeoEmbed',
  type: 'object',
  title: 'Vimeo Embed',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'videoId',
      type: 'string',
      title: 'Vimeo Video ID',
      description: 'The numeric ID from the Vimeo URL (e.g. 123456789)',
      validation: (Rule) =>
        Rule.required()
          .regex(/^\d+$/, { name: 'numeric ID', invert: false })
          .error('Enter only the numeric video ID, not the full URL'),
    }),
  ],
  preview: {
    select: { videoId: 'videoId' },
    prepare({ videoId }) {
      return {
        title: 'Vimeo Embed',
        subtitle: videoId ? `ID: ${videoId}` : 'No ID set',
      };
    },
  },
});
