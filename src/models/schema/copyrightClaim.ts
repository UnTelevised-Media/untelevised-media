import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'copyrightClaim',
  title: 'Copyright Claim',
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
      name: 'copyrightOwner',
      title: 'Copyright Owner',
      type: 'string',
      description: 'Who owns the copyright? If you, say "myself"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'workTitle',
      title: 'Title of Copyrighted Work',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'registrationNumber',
      title: 'Copyright Registration Number (if applicable)',
      type: 'string',
    }),
    defineField({
      name: 'registrationDate',
      title: 'Date of Registration',
      type: 'date',
    }),
    defineField({
      name: 'infringingUrl',
      title: 'URL of Infringing Content',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'infringingDescription',
      title: 'Describe the Infringing Content',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'originalWorkDescription',
      title: 'Description of Your Original Work',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'firstDiscoveryDate',
      title: 'When Did You First Discover the Infringement?',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'damageClaim',
      title: 'Claimed Damages',
      type: 'string',
      description: 'Describe the harm caused by infringement',
    }),
    defineField({
      name: 'licenseAllowed',
      title: 'Have You Licensed This Work to Anyone?',
      type: 'string',
      options: {
        list: [
          { title: 'Yes', value: 'yes' },
          { title: 'No', value: 'no' },
        ],
      },
    }),
    defineField({
      name: 'licenseDetails',
      title: 'If Yes, Describe the License',
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
      title: 'workTitle',
      subtitle: 'claimantEmail',
    },
  },
});
