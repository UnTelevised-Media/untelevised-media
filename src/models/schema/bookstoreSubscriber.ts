// src/models/schema/bookstoreSubscriber.ts
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
      name: 'firstName',
      title: 'First Name',
      type: 'string',
      description: 'Optional — used for email personalization',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending (awaiting confirmation)', value: 'pending' },
          { title: 'Active (confirmed)', value: 'active' },
          { title: 'Unsubscribed', value: 'unsubscribed' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'confirmToken',
      title: 'Confirmation Token',
      type: 'string',
      description: 'Single-use token for double opt-in email confirmation',
      readOnly: true,
    }),
    defineField({
      name: 'unsubscribeToken',
      title: 'Unsubscribe Token',
      type: 'string',
      description: 'Token included in email footer for one-click unsubscribe',
      readOnly: true,
    }),
    defineField({
      name: 'gdprConsent',
      title: 'GDPR Consent',
      type: 'boolean',
      initialValue: false,
      description: 'Subscriber explicitly consented to receive emails',
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
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'confirmedAt',
      title: 'Confirmed At',
      type: 'datetime',
    }),
    defineField({
      name: 'unsubscribedAt',
      title: 'Unsubscribed At',
      type: 'datetime',
    }),
    defineField({
      name: 'resendContactId',
      title: 'Resend Contact ID',
      type: 'string',
      readOnly: true,
      description: 'ID returned by Resend API after adding contact to audience',
    }),
  ],
  preview: {
    select: {
      title: 'email',
      subtitle: 'status',
    },
    prepare({ title, subtitle }: { title: string; subtitle?: string }) {
      const emoji = subtitle === 'active' ? '✅' : subtitle === 'pending' ? '⏳' : '🚫';
      return { title: title ?? 'Unknown', subtitle: `${emoji} ${subtitle ?? 'unknown'}` };
    },
  },
});
