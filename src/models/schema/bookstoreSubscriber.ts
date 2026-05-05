import { defineField, defineType } from 'sanity';
import { BookIcon } from '@sanity/icons';

export default defineType({
  name: 'bookstoreSubscriber',
  title: 'Bookstore Subscriber',
  type: 'document',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Subscribed At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Signup Source',
      type: 'string',
      options: {
        list: [
          { title: 'Bookstore Home', value: 'bookstore-home' },
          { title: 'Bookstore About', value: 'bookstore-about' },
          { title: 'Book Detail Page', value: 'book-detail' },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: 'email',
      subtitle: 'submittedAt',
    },
    prepare({ title, subtitle }) {
      return {
        title: title ?? 'Unknown',
        subtitle: subtitle ? new Date(subtitle as string).toLocaleDateString() : '',
      };
    },
  },
});
