import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'defamationClaim',
  title: 'Defamation Claim',
  type: 'document',
  fields: [
    defineField({
      name: 'claimantName',
      title: 'Your Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'claimantEmail',
      title: 'Your Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'claimantPhone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'affectedParty',
      title: 'Who Is Affected By This Defamation?',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'relationship',
      title: 'Your Relationship to the Affected Party',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'falseMaterials',
      title: 'Describe the False Statement(s)',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sourceUrl',
      title: 'URL/Source of Defamatory Content',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publicationDate',
      title: 'When Was This Published?',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'harmDescription',
      title: 'How Has This Harmed You?',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priorRequest',
      title: 'Have You Requested Removal Before?',
      type: 'string',
      options: {
        list: [
          { title: 'Yes', value: 'yes' },
          { title: 'No', value: 'no' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priorRequestDetails',
      title: 'If Yes, When and What Was Their Response?',
      type: 'text',
    }),
    defineField({
      name: 'truthClaim',
      title: 'Why Is This Statement False? What Is the Truth?',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'evidence',
      title: 'Evidence Supporting Your Claim (URLs, documents, etc.)',
      type: 'text',
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
      title: 'affectedParty',
      subtitle: 'claimantEmail',
    },
  },
});
