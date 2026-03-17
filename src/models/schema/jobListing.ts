// src/models/schema/jobListing.ts
import { defineField, defineType } from 'sanity';
import { BriefcaseIcon } from '@heroicons/react/24/outline';

export default defineType({
  name: 'jobListing',
  title: 'Job Listing',
  type: 'document',
  icon: BriefcaseIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Job Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'department',
      title: 'Department',
      type: 'string',
      options: {
        list: [
          { title: 'Editorial', value: 'editorial' },
          { title: 'Photography', value: 'photography' },
          { title: 'Video', value: 'video' },
          { title: 'Technology', value: 'technology' },
          { title: 'Operations', value: 'operations' },
          { title: 'Community', value: 'community' },
        ],
      },
    }),
    defineField({
      name: 'type',
      title: 'Employment Type',
      type: 'string',
      options: {
        list: [
          { title: 'Full-Time', value: 'full-time' },
          { title: 'Part-Time', value: 'part-time' },
          { title: 'Freelance / Per-Story', value: 'freelance' },
          { title: 'Volunteer', value: 'volunteer' },
        ],
      },
      initialValue: 'freelance',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g. "Remote", "New York, NY", "Hybrid — NYC"',
      initialValue: 'Remote',
    }),
    defineField({
      name: 'description',
      title: 'Job Description',
      type: 'blockContent',
      description: 'Full job description with responsibilities and context.',
    }),
    defineField({
      name: 'requirements',
      title: 'Requirements',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Bullet-pointed requirements list.',
    }),
    defineField({
      name: 'compensation',
      title: 'Compensation',
      type: 'string',
      description: 'e.g. "Per-story rates", "$X/hour", "Volunteer — byline + portfolio"',
    }),
    defineField({
      name: 'isActive',
      title: 'Active Listing',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck to hide this listing from the public careers page.',
    }),
    defineField({
      name: 'closingDate',
      title: 'Application Deadline',
      type: 'date',
      description: 'Optional. Listing is automatically hidden after this date.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'department',
      isActive: 'isActive',
    },
    prepare({
      title,
      subtitle,
      isActive,
    }: {
      title?: string;
      subtitle?: string;
      isActive?: boolean;
    }) {
      return {
        title: `${isActive === false ? '[CLOSED] ' : ''}${title ?? 'Untitled'}`,
        subtitle: subtitle ?? '',
      };
    },
  },
  orderings: [
    {
      title: 'Department A–Z',
      name: 'departmentAsc',
      by: [{ field: 'department', direction: 'asc' as const }],
    },
    {
      title: 'Newest First',
      name: 'createdDesc',
      by: [{ field: '_createdAt', direction: 'desc' as const }],
    },
  ],
});
