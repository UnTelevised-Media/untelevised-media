import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'mediaSubmission',
  title: 'Media Submission (Gift Model)',
  type: 'document',
  fields: [
    defineField({
      name: 'submitterName',
      title: 'Your Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'submitterEmail',
      title: 'Your Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'submitterPhone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'mediaType',
      title: 'Type of Media',
      type: 'string',
      options: {
        list: [
          { title: 'Photo', value: 'photo' },
          { title: 'Video', value: 'video' },
          { title: 'Document', value: 'document' },
          { title: 'Audio', value: 'audio' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mediaDescription',
      title: 'Describe Your Media',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Content Category',
      type: 'string',
      options: {
        list: [
          { title: 'Breaking News', value: 'breaking-news' },
          { title: 'Politics & Government', value: 'politics' },
          { title: 'Conflict & War', value: 'conflict' },
          { title: 'Environment & Climate', value: 'environment' },
          { title: 'Corporate Accountability', value: 'corporate' },
          { title: 'Human Rights', value: 'human-rights' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'usageRights',
      title: 'Usage Rights',
      type: 'string',
      options: {
        list: [
          { title: 'Use & Post Only (No Commercial Sale)', value: 'use-only' },
          { title: 'Allow Commercial Use (You Can Sell It)', value: 'commercial' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ownershipStatement',
      title: 'Ownership Confirmation',
      type: 'boolean',
      description: 'I confirm that I own all rights to this media',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'permissionsStatement',
      title: 'Permissions Confirmation',
      type: 'boolean',
      description: 'I have permission from anyone identifiable in the media',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'noInfringementStatement',
      title: 'No Infringement Confirmation',
      type: 'boolean',
      description: "This media does not infringe anyone else's intellectual property",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'additionalInfo',
      title: 'Additional Information',
      type: 'text',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'mediaType',
      subtitle: 'submitterEmail',
    },
  },
});
