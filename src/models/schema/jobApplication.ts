import { defineField, defineType } from 'sanity';
import { UserIcon } from '@heroicons/react/24/outline';

export default defineType({
  name: 'jobApplication',
  title: 'Job Application',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'firstName',
      title: 'First Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'lastName',
      title: 'Last Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Location (City, State/Country)',
      type: 'string',
    }),
    defineField({
      name: 'positionsOfInterest',
      title: 'Position(s) of Interest',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Article Writer', value: 'article-writer' },
          { title: 'Article Editor', value: 'article-editor' },
          { title: 'Video Editor', value: 'video-editor' },
          { title: 'Live Street Journalist', value: 'live-street-journalist' },
          { title: 'Social Media Manager', value: 'social-media-manager' },
          { title: 'Content Creator', value: 'content-creator' },
          { title: 'Radio Host', value: 'radio-host' },
          { title: 'Video Producer', value: 'video-producer' },
          { title: 'Photographer', value: 'photographer' },
          { title: 'Graphic Designer', value: 'graphic-designer' },
          { title: 'Web Developer', value: 'web-developer' },
          { title: 'Research Analyst', value: 'research-analyst' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'otherPosition',
      title: 'Other Position (if selected above)',
      type: 'string',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hidden: ({ document }: any) => !document?.positionsOfInterest?.includes('other'),
    }),
    defineField({
      name: 'socialMediaPlatforms',
      title: 'Social Media Platforms You Create Content On',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'YouTube', value: 'youtube' },
          { title: 'TikTok', value: 'tiktok' },
          { title: 'Instagram', value: 'instagram' },
          { title: 'Twitter/X', value: 'twitter' },
          { title: 'Facebook', value: 'facebook' },
          { title: 'LinkedIn', value: 'linkedin' },
          { title: 'Twitch', value: 'twitch' },
          { title: 'Podcast Platforms', value: 'podcast' },
          { title: 'Blog/Website', value: 'blog' },
          { title: 'Other', value: 'other' },
          { title: 'None', value: 'none' },
        ],
      },
    }),
    defineField({
      name: 'portfolioWebsite',
      title: 'Portfolio Website',
      type: 'url',
      description: 'Your personal website or portfolio',
    }),
    defineField({
      name: 'youtubeChannel',
      title: 'YouTube Channel',
      type: 'url',
      description: 'Link to your YouTube channel',
    }),
    defineField({
      name: 'socialMediaLinks',
      title: 'Other Social Media Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Platform',
              type: 'string',
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'experienceLevel',
      title: 'Experience Level',
      type: 'string',
      options: {
        list: [
          { title: 'Complete Beginner (No experience)', value: 'beginner' },
          { title: 'Some Experience (1-2 years)', value: 'some' },
          { title: 'Experienced (3-5 years)', value: 'experienced' },
          { title: 'Very Experienced (5+ years)', value: 'expert' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'experienceDescription',
      title: 'Tell Us About Your Experience',
      type: 'text',
      description:
        'Describe your relevant experience, skills, or why you want to join us. Remember: enthusiasm and willingness to learn matter more than credentials!',
      validation: (Rule) => Rule.required().min(50).max(1000),
    }),
    defineField({
      name: 'workSamples',
      title: 'Work Samples/Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Sample Title/Description',
              type: 'string',
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
            },
          ],
        },
      ],
      description: 'Share links to your work, articles, videos, or any relevant content',
    }),
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'string',
      options: {
        list: [
          { title: 'Part-time (10-20 hours/week)', value: 'part-time' },
          { title: 'Full-time (40+ hours/week)', value: 'full-time' },
          { title: 'Freelance/Project-based', value: 'freelance' },
          { title: 'Volunteer basis', value: 'volunteer' },
          { title: 'Flexible/Open to discuss', value: 'flexible' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'additionalInfo',
      title: 'Additional Information',
      type: 'text',
      description:
        'Anything else you want us to know? Special skills, equipment you own, unique perspectives, etc.',
    }),
    defineField({
      name: 'applicationStatus',
      title: 'Application Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Under Review', value: 'review' },
          { title: 'Interview Scheduled', value: 'interview' },
          { title: 'Accepted', value: 'accepted' },
          { title: 'Declined', value: 'declined' },
          { title: 'On Hold', value: 'hold' },
        ],
      },
      initialValue: 'new',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: 'notes',
      title: 'Internal Notes',
      type: 'text',
      description: 'Internal notes for review team (not visible to applicant)',
    }),
  ],

  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
      positions: 'positionsOfInterest',
      status: 'applicationStatus',
      submittedAt: 'submittedAt',
    },
    prepare(selection) {
      const { firstName, lastName, email, positions, status, submittedAt } = selection;
      const name = `${firstName} ${lastName}`;
      const positionList = positions?.join(', ') ?? 'No positions selected';
      const date = submittedAt ? new Date(submittedAt).toLocaleDateString() : '';

      return {
        title: name,
        subtitle: `${email} • ${status} • ${date}`,
        description: `Positions: ${positionList}`,
      };
    },
  },

  orderings: [
    {
      title: 'Newest First',
      name: 'newestFirst',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
    {
      title: 'Status',
      name: 'status',
      by: [{ field: 'applicationStatus', direction: 'asc' }],
    },
  ],
});
