import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'string',
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        },
      ],
    }),
    defineField({
      name: 'title',
      title: 'Job Title',
      type: 'string',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [
        {
          title: 'Block',
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
        },
      ],
    }),
    defineField({
      name: 'twitter',
      title: 'Twitter',
      type: 'string',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'string',
    }),
    defineField({
      name: 'facebook',
      title: 'Facebook',
      type: 'string',
    }),
    defineField({
      name: 'tiktok',
      title: 'Tiktok',
      type: 'string',
    }),
    defineField({
      name: 'youtube',
      title: 'Youtube',
      type: 'string',
    }),
    defineField({
      name: 'linkedin',
      title: 'Linkedin',
      type: 'string',
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    // EEAT fields — establish expertise and authority for Google's YMYL guidelines
    defineField({
      name: 'credentials',
      title: 'Credentials',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'Professional credentials (e.g. "Investigative Journalist", "J-School Graduate")',
    }),
    defineField({
      name: 'expertise',
      title: 'Areas of Expertise',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Topics this author covers (e.g. "Criminal Justice", "Housing Policy")',
    }),
    defineField({
      name: 'sameAs',
      title: 'Profile URLs (sameAs)',
      type: 'array',
      of: [{ type: 'url' }],
      description:
        "External profile pages that confirm this person's identity (LinkedIn, Wikipedia, etc.)",
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'City/region this author is based in',
    }),
    defineField({
      name: 'isActive',
      title: 'Active Contributor',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck for former contributors',
    }),
    // Portal linkage — admin-only. Never editable by the author via any API route.
    defineField({
      name: 'clerkId',
      title: 'Clerk User ID',
      type: 'string',
      // readOnly: true,
      description: 'Linked Clerk account ID — set by Admin only. Do not share or edit directly.',
      hidden: ({ currentUser }) => !currentUser?.roles?.some((r) => r.name === 'administrator'),
    }),
    // Bookstore fields
    defineField({
      name: 'isLiteraryAuthor',
      title: 'Literary Author',
      type: 'boolean',
      initialValue: false,
      description: 'Enable to show this author in the bookstore and allow book associations',
    }),
    defineField({
      name: 'payoutEmail',
      title: 'Payout Email',
      type: 'string',
      description: 'Author payout recipient address (for future Stripe Connect integration)',
      hidden: ({ currentUser }) => !currentUser?.roles?.some((r) => r.name === 'administrator'),
    }),
    defineField({
      name: 'tipStripeProductId',
      title: 'Tip — Stripe Product ID',
      type: 'string',
      description:
        "Stripe Product ID (prod_xxx) for this author's tip product. Tips are name-your-price, so link the Product here — not a Price. The amount is set by the buyer at checkout.",
    }),
    defineField({
      name: 'tipAmount',
      title: 'Tip — Recommended Amount (USD)',
      type: 'number',
      description: 'Default tip amount shown to buyers, e.g. 5. Buyers can change it freely.',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
});
