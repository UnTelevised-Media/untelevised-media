// src/models/schema/factCheck.ts
import { defineField, defineType } from 'sanity';
import { CheckSquare } from 'lucide-react';

export default defineType({
  name: 'factCheck',
  title: 'Fact Check',
  type: 'document',
  icon: CheckSquare,
  groups: [
    { name: 'claim', title: 'The Claim', default: true },
    { name: 'verdict', title: 'Verdict' },
    { name: 'analysis', title: 'Analysis' },
    { name: 'meta', title: 'Meta / SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Article Title',
      type: 'string',
      group: 'meta',
      description: 'Headline for the fact-check article (not the claim itself)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'meta',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'meta',
    }),
    defineField({
      name: 'author',
      title: 'Fact-Checker / Author',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'meta',
    }),
    // Claim fields
    defineField({
      name: 'claim',
      title: 'The Claim Being Checked',
      type: 'text',
      rows: 3,
      group: 'claim',
      description: 'Quote the claim verbatim or as close to verbatim as possible.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'claimSource',
      title: 'Who Made This Claim',
      type: 'string',
      group: 'claim',
      description:
        'Full name or entity. E.g. "Sen. John Smith", "Facebook post circulating April 2024"',
    }),
    defineField({
      name: 'claimUrl',
      title: 'URL Where Claim Was Made',
      type: 'url',
      group: 'claim',
      description: 'Direct link to original claim (tweet, speech transcript, article, etc.)',
    }),
    defineField({
      name: 'claimDate',
      title: 'Date Claim Was Made',
      type: 'datetime',
      group: 'claim',
    }),
    // Verdict fields
    defineField({
      name: 'rating',
      title: 'Verdict',
      type: 'string',
      group: 'verdict',
      options: {
        list: [
          { title: '✅ True', value: 'true' },
          { title: '🟢 Mostly True', value: 'mostly-true' },
          { title: '🟡 Misleading', value: 'misleading' },
          { title: '🟠 Mostly False', value: 'mostly-false' },
          { title: '🔴 False', value: 'false' },
          { title: '⬜ Unverifiable', value: 'unverifiable' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ratingExplanation',
      title: 'Verdict Explanation',
      type: 'text',
      rows: 3,
      group: 'verdict',
      description:
        '1–2 sentence plain-language explanation of the verdict. Used in search snippets.',
      validation: (Rule) => Rule.required().max(300),
    }),
    // Analysis
    defineField({
      name: 'body',
      title: 'Full Analysis',
      type: 'blockContent',
      group: 'analysis',
    }),
    defineField({
      name: 'sources',
      title: 'Sources',
      type: 'array',
      group: 'analysis',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', title: 'Source Label' }),
            defineField({ name: 'url', type: 'url', title: 'URL' }),
          ],
          preview: { select: { title: 'label', subtitle: 'url' } },
        },
      ],
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      group: 'analysis',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
      validation: (Rule) => Rule.max(5),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      rating: 'rating',
      publishedAt: 'publishedAt',
    },
    prepare({ title, rating, publishedAt }) {
      const ratingEmoji: Record<string, string> = {
        true: '✅',
        'mostly-true': '🟢',
        misleading: '🟡',
        'mostly-false': '🟠',
        false: '🔴',
        unverifiable: '⬜',
      };
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'No date';
      return {
        title: `${ratingEmoji[rating] ?? '?'} ${title}`,
        subtitle: date,
      };
    },
  },
});
