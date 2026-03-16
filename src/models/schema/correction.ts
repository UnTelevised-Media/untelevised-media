// src/models/schema/correction.ts
// Reusable correction/retraction object type — shared by article and liveEvent schemas.
// Use `{ name: 'correction', type: 'correctionObject' }` to embed in any document.

import { defineField, defineType } from 'sanity';
import { AlertTriangle } from 'lucide-react';

export default defineType({
  name: 'correctionObject',
  title: 'Correction / Retraction',
  type: 'object',
  icon: AlertTriangle,
  fields: [
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Correction — factual error fixed', value: 'correction' },
          { title: 'Clarification — added context, no error', value: 'clarification' },
          { title: 'Update — new developments added', value: 'update' },
          { title: 'Retraction — article fully withdrawn', value: 'retraction' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'issuedAt',
      title: 'Issued At',
      type: 'datetime',
      description: 'When this correction was issued (not when the article was last edited)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'One-Line Summary',
      type: 'string',
      description:
        'Shown on article cards. Keep under 80 chars. E.g. "An earlier version misstated the vote count."',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'detail',
      title: 'Full Correction Text',
      type: 'text',
      rows: 4,
      description: 'Full editorial notice displayed at the top of the article or event page.',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      type: 'type',
      summary: 'summary',
      issuedAt: 'issuedAt',
    },
    prepare({ type, summary, issuedAt }: Record<string, any>) {
      const label = type ? type.toUpperCase() : 'CORRECTION';
      const date = issuedAt ? new Date(issuedAt).toLocaleDateString() : '';
      return {
        title: `${label}${date ? ` — ${date}` : ''}`,
        subtitle: summary ?? 'No summary set',
      };
    },
  },
});
