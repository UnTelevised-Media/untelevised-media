import { defineField, defineType } from 'sanity';
import { Calendar } from 'lucide-react';

export default defineType({
  name: 'timelineEvent',
  title: 'Timeline Event',
  type: 'document',
  icon: Calendar,
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of the event for timeline display',
    }),
    defineField({
      name: 'detailedDescription',
      title: 'Detailed Description',
      type: 'blockContent',
      description: 'Full detailed description with rich text formatting',
    }),
    defineField({
      name: 'eventDate',
      title: 'Event Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      description: 'The date and time when this event occurred',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      description: 'Optional end date for events that span multiple days',
    }),
    defineField({
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      options: {
        list: [
          { title: 'Breaking News', value: 'breaking' },
          { title: 'Investigation', value: 'investigation' },
          { title: 'Live Event', value: 'live' },
          { title: 'Political Event', value: 'political' },
          { title: 'Social Movement', value: 'social' },
          { title: 'Economic Event', value: 'economic' },
          { title: 'Environmental', value: 'environmental' },
          { title: 'Technology', value: 'technology' },
          { title: 'Cultural', value: 'cultural' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'importanceLevel',
      title: 'Importance Level',
      type: 'string',
      options: {
        list: [
          { title: 'Critical', value: 'critical' },
          { title: 'High', value: 'high' },
          { title: 'Medium', value: 'medium' },
          { title: 'Low', value: 'low' },
        ],
      },
      initialValue: 'medium',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isMilestone',
      title: 'Is Milestone Event',
      type: 'boolean',
      description: 'Mark this as a key milestone event for special highlighting',
      initialValue: false,
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Geographic location where the event occurred',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        },
      ],
    }),
    defineField({
      name: 'mediaAttachments',
      title: 'Media Attachments',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
        {
          type: 'object',
          name: 'video',
          title: 'Video',
          fields: [
            {
              name: 'url',
              type: 'url',
              title: 'Video URL',
            },
            {
              name: 'title',
              type: 'string',
              title: 'Video Title',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'timelineCategories',
      title: 'Timeline Categories',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'timelineCategory' } }],
      description: 'Categories for organizing timeline events',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'article' } }],
      description: 'Articles related to this timeline event',
    }),
    defineField({
      name: 'relatedLiveEvents',
      title: 'Related Live Events',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'liveEvent' } }],
      description: 'Live events related to this timeline event',
    }),
    defineField({
      name: 'relatedTimelineEvents',
      title: 'Related Timeline Events',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'timelineEvent' } }],
      description: 'Other timeline events related to this one',
    }),
    defineField({
      name: 'externalLinks',
      title: 'External Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Link Title',
            },
            {
              name: 'url',
              type: 'url',
              title: 'URL',
            },
            {
              name: 'description',
              type: 'text',
              title: 'Description',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      description: 'Whether this event should be visible on the timeline',
      initialValue: true,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'When this timeline event was published',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: { type: 'author' },
      description: 'Who created this timeline event',
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'string',
      description: 'SEO keywords for this timeline event',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      eventDate: 'eventDate',
      eventType: 'eventType',
      importanceLevel: 'importanceLevel',
      media: 'mainImage',
    },
    prepare(selection) {
      const { title, eventDate, eventType, importanceLevel, media } = selection;
      const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString() : 'No date';

      return {
        title,
        subtitle: `${formattedDate} • ${eventType} • ${importanceLevel} importance`,
        media,
      };
    },
  },
  orderings: [
    {
      title: 'Event Date, Newest',
      name: 'eventDateDesc',
      by: [{ field: 'eventDate', direction: 'desc' }],
    },
    {
      title: 'Event Date, Oldest',
      name: 'eventDateAsc',
      by: [{ field: 'eventDate', direction: 'asc' }],
    },
    {
      title: 'Importance Level',
      name: 'importanceLevel',
      by: [{ field: 'importanceLevel', direction: 'desc' }],
    },
  ],
});
