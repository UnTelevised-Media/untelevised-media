import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'mediaListing',
  title: 'Media Listing (Commercial/Marketplace)',
  type: 'document',
  fields: [
    defineField({
      name: 'creatorName',
      title: 'Your Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'creatorEmail',
      title: 'Your Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'creatorPhone',
      title: 'Phone Number',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'companyName',
      title: 'Company/Brand Name',
      type: 'string',
    }),
    defineField({
      name: 'experienceLevel',
      title: 'Experience Level',
      type: 'string',
      options: {
        list: [
          { title: 'Independent Creator', value: 'independent' },
          { title: 'Freelance Journalist/Filmmaker', value: 'freelance' },
          { title: 'News Outlet', value: 'news-outlet' },
          { title: 'Production Company', value: 'production-company' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'portfolioUrl',
      title: 'Portfolio/Website URL',
      type: 'url',
    }),
    defineField({
      name: 'creatorWebsite',
      title: 'Personal Website',
      type: 'url',
    }),
    defineField({
      name: 'creatorBio',
      title: 'Tell Us About Yourself',
      type: 'text',
    }),
    defineField({
      name: 'mediaType',
      title: 'Types of Media You Offer',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Photo', value: 'photo' },
          { title: 'Video', value: 'video' },
          { title: 'Documentary', value: 'documentary' },
          { title: 'Interviews', value: 'interviews' },
          { title: 'Investigation', value: 'investigation' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mediaCategory',
      title: 'Primary Content Categories',
      type: 'string',
      options: {
        list: [
          { title: 'Politics & Government', value: 'politics' },
          { title: 'Conflict & War', value: 'conflict' },
          { title: 'Environment & Climate', value: 'environment' },
          { title: 'Corporate Accountability', value: 'corporate' },
          { title: 'Human Rights', value: 'human-rights' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mediaDescription',
      title: 'What Media Are You Offering?',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'exclusivityRequested',
      title: 'Exclusivity',
      type: 'string',
      options: {
        list: [
          { title: 'Non-Exclusive (I can sell elsewhere)', value: 'no' },
          { title: 'Exclusive (You get exclusive rights)', value: 'yes' },
          { title: 'Negotiable', value: 'negotiable' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'pricingExpectations',
      title: 'Pricing Expectations',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'requestedTerms',
      title: 'Specific Terms You Require',
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
      title: 'creatorName',
      subtitle: 'creatorEmail',
    },
  },
});
