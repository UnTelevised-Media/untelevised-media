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
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
});
