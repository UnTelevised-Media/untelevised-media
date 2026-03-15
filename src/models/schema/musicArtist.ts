import { defineField, defineType } from 'sanity';
import { User } from 'lucide-react';

export default defineType({
  name: 'musicArtist',
  title: 'Music Artist',
  type: 'document',
  icon: User,
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Artist Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'stageName',
      title: 'Stage Name',
      type: 'string',
      description: 'Professional name or stage name (if different from real name)',
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'blockContent',
      description: 'Artist biography and background information',
    }),
    defineField({
      name: 'image',
      title: 'Artist Image',
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
      name: 'genres',
      title: 'Genres',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Hip Hop', value: 'hip-hop' },
          { title: 'R&B', value: 'rnb' },
          { title: 'Pop', value: 'pop' },
          { title: 'Rock', value: 'rock' },
          { title: 'Jazz', value: 'jazz' },
          { title: 'Blues', value: 'blues' },
          { title: 'Country', value: 'country' },
          { title: 'Electronic', value: 'electronic' },
          { title: 'Folk', value: 'folk' },
          { title: 'Reggae', value: 'reggae' },
          { title: 'Alternative', value: 'alternative' },
          { title: 'Indie', value: 'indie' },
        ],
      },
    }),
    defineField({
      name: 'debutYear',
      title: 'Debut Year',
      type: 'number',
      description: 'Year the artist started their professional music career',
    }),
    defineField({
      name: 'hometown',
      title: 'Hometown',
      type: 'string',
      description: "Artist's hometown or place of origin",
    }),
    defineField({
      name: 'recordLabel',
      title: 'Record Label',
      type: 'string',
      description: 'Current or primary record label',
    }),
    defineField({
      name: 'website',
      title: 'Official Website',
      type: 'url',
    }),
    defineField({
      name: 'socialMedia',
      title: 'Social Media',
      type: 'object',
      fields: [
        defineField({
          name: 'instagram',
          title: 'Instagram',
          type: 'string',
          description: 'Instagram handle (without @)',
        }),
        defineField({
          name: 'twitter',
          title: 'Twitter/X',
          type: 'string',
          description: 'Twitter/X handle (without @)',
        }),
        defineField({
          name: 'facebook',
          title: 'Facebook',
          type: 'url',
        }),
        defineField({
          name: 'youtube',
          title: 'YouTube',
          type: 'url',
        }),
        defineField({
          name: 'spotify',
          title: 'Spotify',
          type: 'url',
        }),
        defineField({
          name: 'appleMusic',
          title: 'Apple Music',
          type: 'url',
        }),
        defineField({
          name: 'soundcloud',
          title: 'SoundCloud',
          type: 'url',
        }),
        defineField({
          name: 'tiktok',
          title: 'TikTok',
          type: 'string',
          description: 'TikTok handle (without @)',
        }),
      ],
    }),
    defineField({
      name: 'isActive',
      title: 'Currently Active',
      type: 'boolean',
      description: 'Whether the artist is currently active in music',
      initialValue: true,
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Artist',
      type: 'boolean',
      description: 'Whether to feature this artist prominently on the site',
      initialValue: false,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoObject',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'stageName',
      media: 'image',
    },
    prepare(selection) {
      const { title, subtitle } = selection;
      return {
        ...selection,
        title: subtitle ?? title,
        subtitle: subtitle ? `(${title})` : undefined,
      };
    },
  },
});
