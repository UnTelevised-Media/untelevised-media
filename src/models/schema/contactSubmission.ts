// src/models/schemas/contactSubmission.ts
import { defineField, defineType } from 'sanity';
import { MessageSquare } from 'lucide-react';

export default defineType({
  name: 'contactSubmission',
  title: 'Contact Submission',
  type: 'document',
  icon: MessageSquare,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'Name of the person who submitted the contact form',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      description: 'Email address of the person who submitted the form',
      type: 'string',
    }),
    defineField({
      name: 'message',
      title: 'Message',
      description: 'The message content submitted through the contact form',
      type: 'text',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      description: 'When this contact form was submitted',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
    },
  },
});
