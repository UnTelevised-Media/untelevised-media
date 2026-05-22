// src/models/schema/source.ts
import { defineField, defineType } from 'sanity';
import { Link } from 'lucide-react';

export default defineType({
  name: 'source',
  title: 'Source',
  type: 'document',
  icon: Link,
  description:
    'A reusable source record. Articles, live events, and key events can all reference sources from this library.',
  fields: [
    defineField({
      name: 'label',
      title: 'Source Label',
      type: 'string',
      description:
        'E.g. "Court Filing — Fulton County Superior Court", "Interview with city official"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Source Type',
      type: 'string',
      options: {
        list: [
          { title: 'Document / Filing', value: 'document' },
          { title: 'Interview', value: 'interview' },
          { title: 'Official Statement', value: 'statement' },
          { title: 'Data / Dataset', value: 'data' },
          { title: 'Video / Audio', value: 'media' },
          { title: 'On-Scene Reporting', value: 'onscene' },
          { title: 'News Article', value: 'article' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'url',
      title: 'URL (optional)',
      type: 'url',
      description:
        'Link to the primary source document, recording, or statement if publicly available.',
    }),
    defineField({
      name: 'description',
      title: 'Note',
      type: 'text',
      rows: 2,
      description: 'Additional context about this source. Not shown to readers if anonymous.',
    }),
    defineField({
      name: 'isAnonymous',
      title: 'Anonymous Source',
      type: 'boolean',
      initialValue: false,
      description:
        'If true, the label and note are hidden from readers — only the source type is shown.',
    }),
  ],

  preview: {
    select: {
      title: 'label',
      subtitle: 'type',
      isAnonymous: 'isAnonymous',
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare(selection: any) {
      const { title, subtitle, isAnonymous } = selection;
      return {
        title: isAnonymous ? '🔒 Anonymous Source' : title,
        subtitle: subtitle ?? 'No type set',
      };
    },
  },
});
