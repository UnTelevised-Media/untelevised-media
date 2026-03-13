import { defineField, defineType } from 'sanity';
import { Disc } from 'lucide-react';

export default defineType({
  name: 'album',
  title: 'Album',
  type: 'document',
  icon: Disc,
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Album Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'artist',
      title: 'Primary Artist',
      type: 'reference',
      to: { type: 'musicArtist' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredArtists',
      title: 'Featured Artists',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'musicArtist' } }],
      description: 'Artists featured on this album',
    }),
    defineField({
      name: 'albumArt',
      title: 'Album Artwork',
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'releaseDate',
      title: 'Release Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'albumType',
      title: 'Album Type',
      type: 'string',
      options: {
        list: [
          { title: 'Studio Album', value: 'studio' },
          { title: 'EP', value: 'ep' },
          { title: 'Single', value: 'single' },
          { title: 'Compilation', value: 'compilation' },
          { title: 'Live Album', value: 'live' },
          { title: 'Remix Album', value: 'remix' },
          { title: 'Mixtape', value: 'mixtape' },
        ],
      },
      validation: (Rule) => Rule.required(),
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
      name: 'recordLabel',
      title: 'Record Label',
      type: 'string',
    }),
    defineField({
      name: 'producer',
      title: 'Producer(s)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Producers who worked on this album',
    }),
    defineField({
      name: 'description',
      title: 'Album Description',
      type: 'blockContent',
      description: 'Description or background information about the album',
    }),
    defineField({
      name: 'totalTracks',
      title: 'Total Tracks',
      type: 'number',
      description: 'Total number of tracks on the album',
    }),
    defineField({
      name: 'duration',
      title: 'Total Duration',
      type: 'string',
      description: 'Total album duration (e.g., "45:30")',
    }),
    defineField({
      name: 'streamingLinks',
      title: 'Streaming Links',
      type: 'object',
      fields: [
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
          name: 'youtube',
          title: 'YouTube Music',
          type: 'url',
        }),
        defineField({
          name: 'soundcloud',
          title: 'SoundCloud',
          type: 'url',
        }),
        defineField({
          name: 'bandcamp',
          title: 'Bandcamp',
          type: 'url',
        }),
        defineField({
          name: 'amazonMusic',
          title: 'Amazon Music',
          type: 'url',
        }),
      ],
    }),
    defineField({
      name: 'isExplicit',
      title: 'Explicit Content',
      type: 'boolean',
      description: 'Contains explicit content',
      initialValue: false,
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Album',
      type: 'boolean',
      description: 'Whether to feature this album prominently',
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
      title: 'title',
      artist: 'artist.name',
      media: 'albumArt',
      releaseDate: 'releaseDate',
    },
    prepare(selection) {
      const { title, artist, releaseDate } = selection;
      const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
      return {
        ...selection,
        title,
        subtitle: `${artist}${year ? ` • ${year}` : ''}`,
      };
    },
  },
});
