import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'dmcaTakedown',
  title: 'DMCA Takedown Notice',
  type: 'document',
  fields: [
    defineField({
      name: 'noticeeName',
      title: 'Your Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'noticeeEmail',
      title: 'Your Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'noticeePhone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'noticeeAddress',
      title: 'Your Address',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'copyrightOwner',
      title: 'Copyright Owner Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'workTitle',
      title: 'Title(s) of Copyrighted Work(s)',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'workDescription',
      title: 'Description of Copyrighted Work(s)',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'infringingUrl',
      title: 'URL(s) of Infringing Material',
      type: 'text',
      validation: (Rule) => Rule.required(),
      description: 'One URL per line',
    }),
    defineField({
      name: 'infringementStatement',
      title: 'Statement That Material Is Infringing',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'goodFaithBelief',
      title: 'Good Faith Belief Statement',
      type: 'text',
      description: 'Confirm that you have a good faith belief that use is not authorized',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'perjuryDeclaration',
      title: 'Perjury Declaration',
      type: 'boolean',
      description: 'I declare under penalty of perjury that the information is accurate',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'registrationNumber',
      title: 'Copyright Registration Number (if available)',
      type: 'string',
    }),
    defineField({
      name: 'registrationDate',
      title: 'Date of Registration',
      type: 'date',
    }),
    defineField({
      name: 'additionalInfo',
      title: 'Additional Information',
      type: 'text',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'workTitle',
      subtitle: 'noticeeEmail',
    },
  },
});
