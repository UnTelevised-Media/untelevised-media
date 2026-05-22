// src/models/schemas/facebook.ts
import { defineType, defineField } from 'sanity';
import { Globe } from 'lucide-react';

export default defineType({
  name: 'facebookEmbed',
  type: 'object',
  title: 'Facebook Embed',
  icon: Globe,
  fields: [
    defineField({
      name: 'postUrl',
      type: 'url',
      title: 'Facebook Post URL',
      description:
        'The full URL of the Facebook post (e.g. https://www.facebook.com/username/posts/12345)',
      validation: (Rule) => Rule.required().uri({ scheme: ['https', 'http'] }),
    }),
  ],
  preview: {
    select: { postUrl: 'postUrl' },
    prepare({ postUrl }: { postUrl?: string }) {
      return {
        title: 'Facebook Post',
        subtitle: postUrl ?? 'No URL set',
      };
    },
  },
});
