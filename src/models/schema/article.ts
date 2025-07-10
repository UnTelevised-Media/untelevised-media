// src/models/schema/article.ts
import { defineField, defineType } from 'sanity';
import { FileText } from 'lucide-react';

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: FileText,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
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
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: { type: 'author' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
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
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    defineField({
      name: 'eventDate',
      title: 'Event Date',
      type: 'datetime',
      description: 'When did this event happen?',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (Rule) =>
        Rule.max(200).warning('Keep descriptions under 200 characters for better SEO'),
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'string',
      description: 'SEO keywords separated by commas',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Where did this event take place?',
    }),
    defineField({
      name: 'videoLink',
      title: 'Video Link',
      type: 'url',
      description: 'YouTube, Vimeo, or other video embed URL',
    }),
    defineField({
      name: 'hasEmbeddedVideo',
      title: 'Has Embedded Video',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasEmbeddedTweet',
      title: 'Has Embedded Tweet',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isCurrentEvent',
      title: 'Is Current Event',
      type: 'boolean',
      initialValue: false,
      description: "Mark this if it's an ongoing/breaking news event",
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
      publishedAt: 'publishedAt',
    },
    prepare(selection) {
      const { author, publishedAt } = selection;
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'No date';
      return {
        ...selection,
        subtitle: author ? `by ${author} • ${date}` : `${date}`,
      };
    },
  },
});
