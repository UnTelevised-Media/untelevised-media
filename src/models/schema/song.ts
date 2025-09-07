import { defineField, defineType } from 'sanity';
import { Music } from 'lucide-react';

export default defineType({
  name: 'song',
  title: 'Song',
  type: 'document',
  icon: Music,
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
      title: 'Song Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'primaryArtist',
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
      description: 'Artists featured on this song',
    }),
    defineField({
      name: 'contributingArtists',
      title: 'Contributing Artists',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'artist',
              title: 'Artist',
              type: 'reference',
              to: { type: 'musicArtist' },
            }),
            defineField({
              name: 'role',
              title: 'Role',
              type: 'string',
              options: {
                list: [
                  { title: 'Producer', value: 'producer' },
                  { title: 'Songwriter', value: 'songwriter' },
                  { title: 'Composer', value: 'composer' },
                  { title: 'Backing Vocals', value: 'backing-vocals' },
                  { title: 'Additional Vocals', value: 'additional-vocals' },
                  { title: 'Instrumentalist', value: 'instrumentalist' },
                  { title: 'Engineer', value: 'engineer' },
                  { title: 'Mixer', value: 'mixer' },
                ],
              },
            }),
          ],
          preview: {
            select: {
              title: 'artist.name',
              subtitle: 'role',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'album',
      title: 'Album',
      type: 'reference',
      to: { type: 'album' },
      description: 'Album this song belongs to (if any)',
    }),
    defineField({
      name: 'trackArt',
      title: 'Track Artwork',
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
      description:
        'Individual artwork for this track (optional - will fallback to album artwork if not provided)',
    }),
    defineField({
      name: 'trackNumber',
      title: 'Track Number',
      type: 'number',
      description: 'Track number on the album',
    }),
    defineField({
      name: 'lyrics',
      title: 'Lyrics',
      type: 'text',
      description:
        'Song lyrics - ONLY use placeholder content or original lyrics owned by the organization',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'lyricsStructure',
      title: 'Lyrics Structure',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'sectionType',
              title: 'Section Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Verse', value: 'verse' },
                  { title: 'Chorus', value: 'chorus' },
                  { title: 'Bridge', value: 'bridge' },
                  { title: 'Pre-Chorus', value: 'pre-chorus' },
                  { title: 'Outro', value: 'outro' },
                  { title: 'Intro', value: 'intro' },
                  { title: 'Hook', value: 'hook' },
                  { title: 'Refrain', value: 'refrain' },
                ],
              },
            }),
            defineField({
              name: 'content',
              title: 'Section Content',
              type: 'text',
            }),
            defineField({
              name: 'order',
              title: 'Order',
              type: 'number',
            }),
          ],
          preview: {
            select: {
              title: 'sectionType',
              subtitle: 'content',
              order: 'order',
            },
            prepare(selection) {
              const { title, subtitle, order } = selection;
              return {
                title: `${order}. ${title}`,
                subtitle: subtitle ? `${subtitle.substring(0, 50)}...` : '',
              };
            },
          },
        },
      ],
      description: 'Structured breakdown of song sections (optional - for enhanced display)',
    }),
    defineField({
      name: 'releaseDate',
      title: 'Release Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'Song duration (e.g., "3:45")',
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
      name: 'description',
      title: 'Song Description',
      type: 'blockContent',
      description: 'Background information about the song',
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
          title: 'YouTube',
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
      title: 'Featured Song',
      type: 'boolean',
      description: 'Whether to feature this song prominently',
      initialValue: false,
    }),
    defineField({
      name: 'keywords',
      title: 'SEO Keywords',
      type: 'string',
      description: 'Keywords for SEO optimization',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      artist: 'primaryArtist.name',
      album: 'album.title',
      media: 'album.albumArt',
    },
    prepare(selection) {
      const { title, artist, album } = selection;
      return {
        ...selection,
        title,
        subtitle: `${artist}${album ? ` • ${album}` : ''}`,
      };
    },
  },
});
