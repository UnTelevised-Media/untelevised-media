// src/models/schema/secureContact.ts
import { defineField, defineType } from 'sanity';
import { Shield } from 'lucide-react';

export default defineType({
  name: 'secureContact',
  title: 'Secure Contact',
  type: 'document',
  icon: Shield,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'Name of the person (can be anonymous)',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      description: 'Contact email (optional for anonymous tips)',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      description: 'Phone number (optional)',
      type: 'string',
    }),
    defineField({
      name: 'subject',
      title: 'Subject',
      description: 'Subject of the secure contact',
      type: 'string',
    }),
    defineField({
      name: 'message',
      title: 'Message',
      description: 'The secure message content',
      type: 'text',
    }),
    defineField({
      name: 'urgency',
      title: 'Urgency Level',
      description: 'How urgent is this matter?',
      type: 'string',
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'high' },
          { title: 'Critical', value: 'critical' },
        ],
      },
    }),
    defineField({
      name: 'contactMethod',
      title: 'Preferred Contact Method',
      description: 'How would you prefer to be contacted?',
      type: 'string',
      options: {
        list: [
          { title: 'Email', value: 'email' },
          { title: 'Phone', value: 'phone' },
          { title: 'Secure Messaging', value: 'secure' },
          { title: 'Do Not Contact', value: 'none' },
        ],
      },
    }),
    defineField({
      name: 'isAnonymous',
      title: 'Anonymous Submission',
      description: 'Is this an anonymous submission?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      description: 'When this secure contact was submitted',
      type: 'datetime',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      description: 'Current status of this contact',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'In Review', value: 'reviewing' },
          { title: 'In Progress', value: 'progress' },
          { title: 'Resolved', value: 'resolved' },
          { title: 'Archived', value: 'archived' },
        ],
      },
      initialValue: 'new',
    }),
  ],
  preview: {
    select: {
      title: 'subject',
      subtitle: 'name',
      urgency: 'urgency',
    },
    prepare(selection) {
      const { title, subtitle, urgency } = selection;
      const urgencyIcon = urgency === 'critical' ? '🚨' : urgency === 'high' ? '⚠️' : '';
      return {
        title: title || 'Secure Contact',
        subtitle: `${urgencyIcon} ${subtitle || 'Anonymous'} - ${urgency || 'medium'} priority`,
      };
    },
  },
});
