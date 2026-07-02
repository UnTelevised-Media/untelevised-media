import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'abuseReport',
  title: 'Abuse Report',
  type: 'document',
  fields: [
    defineField({
      name: 'reporterName',
      title: 'Reporter Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reporterEmail',
      title: 'Reporter Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'reporterPhone',
      title: 'Reporter Phone',
      type: 'string',
    }),
    defineField({
      name: 'incidentType',
      title: 'Type of Abuse',
      type: 'string',
      options: {
        list: [
          { title: 'Harassment or Targeted Attack', value: 'harassment' },
          { title: 'Hate Speech', value: 'hate' },
          { title: 'Threats or Violence', value: 'threats' },
          { title: 'Sexual or Intimate Content', value: 'sexual' },
          { title: 'Spam or Manipulation', value: 'spam' },
          { title: 'Impersonation', value: 'impersonation' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'targetName',
      title: 'Name/Account Being Reported',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'dateOfIncident',
      title: 'Date of Incident',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'targetUrl',
      title: 'URL/Link to Content',
      type: 'url',
    }),
    defineField({
      name: 'contentDetails',
      title: 'Description of the Abuse',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'affectedParties',
      title: 'Who is Affected By This',
      type: 'text',
    }),
    defineField({
      name: 'evidenceUrls',
      title: 'Evidence URLs',
      type: 'text',
      description: 'Links to evidence, archives, screenshots (one per line)',
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
      title: 'incidentType',
      subtitle: 'reporterEmail',
    },
  },
});
