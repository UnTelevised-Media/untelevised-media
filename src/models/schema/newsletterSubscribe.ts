// src/models/schemas/newsletterSubscribe.ts
import { defineField, defineType } from 'sanity';
import { Mail } from 'lucide-react';

export default defineType({
  name: 'newsletterSubscribe',
  title: 'Newsletter Subscribe',
  type: 'document',
  icon: Mail,
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      description: 'Email address of the subscriber',
      type: 'string',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      description: 'When this subscription was submitted',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'email',
      subtitle: 'email',
    },
  },
});
