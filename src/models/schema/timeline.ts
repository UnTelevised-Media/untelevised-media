import { defineField, defineType } from 'sanity';
import { Clock } from 'lucide-react';

export default defineType({
  name: 'timeline',
  title: 'Timeline Collection',
  type: 'document',
  icon: Clock,
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
      title: 'Timeline Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      description: 'Detailed description of this timeline collection',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      description: 'Brief description for timeline overview and cards',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
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
      name: 'timelineType',
      title: 'Timeline Type',
      type: 'string',
      options: {
        list: [
          { title: 'Event Timeline', value: 'event' },
          { title: 'Investigation Timeline', value: 'investigation' },
          { title: 'Breaking News Timeline', value: 'breaking' },
          { title: 'Historical Timeline', value: 'historical' },
          { title: 'Live Coverage Timeline', value: 'live' },
          { title: 'Custom Timeline', value: 'custom' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'timeRange',
      title: 'Time Range',
      type: 'object',
      fields: [
        {
          name: 'startDate',
          title: 'Start Date',
          type: 'datetime',
          description: 'When this timeline begins',
        },
        {
          name: 'endDate',
          title: 'End Date',
          type: 'datetime',
          description: 'When this timeline ends (leave empty for ongoing)',
        },
      ],
    }),
    defineField({
      name: 'events',
      title: 'Timeline Events',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'timelineEvent' } }],
      description: 'Events included in this timeline',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'timelineCategory' } }],
      description: 'Categories that apply to this timeline',
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
      name: 'isFeatured',
      title: 'Featured Timeline',
      type: 'boolean',
      description: 'Whether this timeline should be featured prominently',
      initialValue: false,
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      description: 'Whether this timeline is publicly visible',
      initialValue: true,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'When this timeline was published',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: { type: 'author' },
      description: 'Who created this timeline',
    }),
    defineField({
      name: 'collaborators',
      title: 'Collaborators',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'author' } }],
      description: 'Additional authors who contributed to this timeline',
    }),
    defineField({
      name: 'viewSettings',
      title: 'View Settings',
      type: 'object',
      fields: [
        {
          name: 'defaultZoomLevel',
          title: 'Default Zoom Level',
          type: 'string',
          options: {
            list: [
              { title: 'Year View', value: 'year' },
              { title: 'Month View', value: 'month' },
              { title: 'Week View', value: 'week' },
              { title: 'Day View', value: 'day' },
              { title: 'Hour View', value: 'hour' },
            ],
          },
          initialValue: 'month',
        },
        {
          name: 'showMilestonesOnly',
          title: 'Show Milestones Only by Default',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'allowPublicComments',
          title: 'Allow Public Comments',
          type: 'boolean',
          initialValue: false,
        },
      ],
    }),
    defineField({
      name: 'seoSettings',
      title: 'SEO Settings',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'Custom title for search engines',
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          description: 'Custom description for search engines',
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'string',
          description: 'SEO keywords for this timeline',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      timelineType: 'timelineType',
      isFeatured: 'isFeatured',
      isPublished: 'isPublished',
      media: 'coverImage',
    },
    prepare(selection) {
      const { title, timelineType, isFeatured, isPublished, media } = selection;
      const status = isPublished ? '✓' : '✗';
      const featured = isFeatured ? '⭐' : '';

      return {
        title,
        subtitle: `${timelineType} ${featured} • Published: ${status}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: 'Published Date, Newest',
      name: 'publishedDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        { field: 'isFeatured', direction: 'desc' },
        { field: 'publishedAt', direction: 'desc' },
      ],
    },
  ],
});
