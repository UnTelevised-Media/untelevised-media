// src/models/schemas/videoContent.ts
import { defineField, defineType } from 'sanity';
import { Video } from 'lucide-react';

export default defineType({
  name: 'videoContent',
  title: 'Video Content',
  type: 'document',
  icon: Video,
  fields: [
    defineField({
      name: 'title',
      title: 'Video Title',
      description: 'Title of the video as it appears on the original platform',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'platform',
      title: 'Platform',
      description: 'Which social media platform this video is from',
      type: 'string',
      options: {
        list: [
          { title: 'TikTok', value: 'tiktok' },
          { title: 'Instagram', value: 'instagram' },
          { title: 'Twitter/X', value: 'twitter' },
          { title: 'YouTube', value: 'youtube' },
          { title: 'Facebook', value: 'facebook' },
          { title: 'Telegram', value: 'telegram' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'videoId',
      title: 'Video ID',
      description: 'The unique identifier for this video on its platform (found in the URL)',
      type: 'string',
    }),
    defineField({
      name: 'embedUrl',
      title: 'Embed URL',
      description: 'URL that can be used to embed this video on other websites',
      type: 'url',
    }),
    defineField({
      name: 'originalUrl',
      title: 'Original URL',
      description: 'Direct link to view this video on its original platform',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      description: 'Preview image for this video',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      description: 'Length of the video in seconds',
      type: 'number',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      description: 'When this video was originally posted',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'creator',
      title: 'Content Creator',
      description: 'Name or display name of the person who created this video',
      type: 'string',
    }),
    defineField({
      name: 'creatorHandle',
      title: 'Creator Handle',
      description: 'Username or handle of the creator on the platform (e.g., @username)',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'Description or caption that came with the video',
      type: 'text',
    }),
    defineField({
      name: 'campaignTags',
      title: 'Campaign Tags',
      description: 'Tag this video to make it appear in specific campaign feeds',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Global March', value: 'global-march' },
          { title: 'Freedom Flotilla', value: 'freedom-flotilla' },
          { title: 'Campus Protests', value: 'campus-protests' },
          { title: 'Marches', value: 'marches' },
        ],
      },
    }),
    defineField({
      name: 'isVerified',
      title: 'Verified Content',
      description: 'Mark as verified if this video content has been confirmed as legitimate',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'viewCount',
      title: 'View Count',
      description: 'Number of times this video has been viewed (if known)',
      type: 'number',
    }),
    defineField({
      name: 'hashtags',
      title: 'Hashtags',
      description: 'Hashtags that were used with this video',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      platform: 'platform',
      creator: 'creator',
      publishedAt: 'publishedAt',
      media: 'thumbnail',
    },
    prepare(selection) {
      const { platform, creator, publishedAt } = selection;
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : '';
      return {
        ...selection,
        subtitle: `${platform} | ${creator} | ${date}`,
      };
    },
  },
});
