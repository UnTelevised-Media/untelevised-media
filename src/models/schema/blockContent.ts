/* eslint-disable @typescript-eslint/no-explicit-any */

// src/models/schemas/blockContent.ts
import { defineType, defineArrayMember, defineField } from 'sanity';
import { CodeIcon, ImageIcon, LinkIcon } from '@sanity/icons';

/**
 * This is the schema type for block content used in the blog document type
 * Importing this type into the studio configuration's `schema` property
 * lets you reuse it in other document types with:
 *  {
 *    name: 'someName',
 *    title: 'Some title',
 *    type: 'blockContent'
 *  }
 */

export default defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      // Styles let you define what blocks can be marked up as. The default
      // set corresponds with HTML tags, but you can set any title or value
      // you want, and decide how you want to deal with it where you want to
      // use your content.
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Number', value: 'number' },
      ],
      // Marks let you mark up inline text in the Portable Text Editor
      marks: {
        // Decorators usually describe a single property – e.g. a typographic
        // preference or highlighting
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
        ],
        // Annotations can be any object structure – e.g. a link or a footnote.
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              defineField({
                title: 'URL',
                name: 'href',
                type: 'url',
                description: 'The web address this link should go to',
              }),
            ],
          },
        ],
      },
    }),
    // You can add additional types here. Note that you can't use
    // primitive types such as 'string' and 'number' in the same array
    // as a block type.
    defineArrayMember({
      type: 'image',
      icon: ImageIcon,
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Describe the image for screen readers and SEO',
        }),
      ],
    }),
    defineArrayMember({
      name: 'code',
      title: 'Code Block',
      type: 'object',
      icon: CodeIcon,
      fields: [
        defineField({
          name: 'code',
          title: 'Code',
          type: 'text',
          description: 'The actual code content to display',
          validation: (Rule: any) => Rule.required(),
        }),
        defineField({
          name: 'language',
          title: 'Language',
          type: 'string',
          description: 'Programming language for syntax highlighting',
          options: {
            list: [
              { title: 'JavaScript', value: 'javascript' },
              { title: 'TypeScript', value: 'typescript' },
              { title: 'HTML', value: 'html' },
              { title: 'CSS', value: 'css' },
              { title: 'Python', value: 'python' },
              { title: 'Java', value: 'java' },
              { title: 'C++', value: 'cpp' },
              { title: 'Ruby', value: 'ruby' },
              { title: 'PHP', value: 'php' },
              { title: 'Shell', value: 'shell' },
              { title: 'SQL', value: 'sql' },
            ],
          },
        }),
      ],
      preview: {
        select: {
          code: 'code',
          language: 'language',
        },
        prepare({ code, language }) {
          return {
            title: 'Code Block',
            subtitle: `${language ?? 'No language'} - ${code?.slice(0, 50)}${code?.length > 50 ? '...' : ''}`,
          };
        },
      },
    }),
    defineArrayMember({
      name: 'mermaidDiagram',
      title: 'Mermaid Diagram',
      type: 'object',
      icon: CodeIcon,
      fields: [
        defineField({
          name: 'code',
          title: 'Diagram Code',
          type: 'text',
          description: 'Mermaid diagram code for creating flowcharts, sequences, etc.',
          validation: (Rule: any) => Rule.required(),
        }),
      ],
      preview: {
        select: {
          code: 'code',
        },
        prepare({ code }) {
          return {
            title: 'Mermaid Diagram',
            subtitle: code?.slice(0, 50) + (code?.length > 50 ? '...' : ''),
          };
        },
      },
    }),
    defineArrayMember({
      name: 'table',
      type: 'object',
      title: 'Table',
      fields: [
        {
          name: 'rows',
          type: 'array',
          title: 'Rows',
          of: [
            {
              type: 'object',
              name: 'row',
              fields: [
                {
                  name: 'cells',
                  type: 'array',
                  title: 'Cells',
                  of: [{ type: 'string' }],
                },
              ],
            },
          ],
        },
      ],
      preview: {
        select: {
          rows: 'rows',
        },
        prepare({ rows }) {
          return {
            title: 'Table',
            subtitle: `${rows?.length ?? 0} rows`,
          };
        },
      },
    }),
    defineArrayMember({
      type: 'youtubeEmbed',
    }),
    defineArrayMember({
      type: 'twitterEmbed',
    }),
    defineArrayMember({
      type: 'instagramEmbed',
    }),
    defineArrayMember({
      type: 'facebookEmbed',
    }),
    defineArrayMember({
      type: 'tiktokEmbed',
    }),
    defineArrayMember({
      type: 'vimeoEmbed',
    }),
    defineArrayMember({
      name: 'iframeEmbed',
      title: 'Iframe Embed',
      type: 'object',
      icon: LinkIcon,
      description: 'Embed external content via iframe (video players, maps, etc)',
      fields: [
        defineField({
          name: 'src',
          title: 'Iframe Source URL',
          type: 'url',
          description:
            'The full URL of the iframe source (e.g., https://abc7chicago.com/video/embed?pid=...)',
          validation: (Rule: any) => Rule.required().uri({ scheme: ['http', 'https'] }),
        }),
        defineField({
          name: 'width',
          title: 'Width',
          type: 'number',
          description: 'Width in pixels (default: 640)',
          initialValue: 640,
        }),
        defineField({
          name: 'height',
          title: 'Height',
          type: 'number',
          description: 'Height in pixels (default: 360)',
          initialValue: 360,
        }),
        defineField({
          name: 'title',
          title: 'Title/Description',
          type: 'string',
          description: 'Accessibility title for the embedded content',
        }),
      ],
      preview: {
        select: {
          src: 'src',
          title: 'title',
          width: 'width',
          height: 'height',
        },
        prepare({
          src,
          title,
          width,
          height,
        }: {
          src?: string;
          title?: string;
          width?: number;
          height?: number;
        }) {
          const displayTitle = title || new URL(src || '').hostname || 'Iframe Embed';
          return {
            title: displayTitle,
            subtitle: `${width ?? 640}x${height ?? 360} - ${src?.substring(0, 40) ?? ''}...`,
          };
        },
      },
    }),
    defineArrayMember({
      name: 'factCheckEmbed',
      title: 'Fact Check',
      type: 'object',
      fields: [
        defineField({
          name: 'factCheck',
          title: 'Fact Check',
          type: 'reference',
          to: [{ type: 'factCheck' }],
          description: 'Select a published fact-check to embed inline.',
          validation: (Rule: any) => Rule.required(),
        }),
      ],
      preview: {
        select: {
          title: 'factCheck.title',
          rating: 'factCheck.rating',
        },
        prepare({ title, rating }: { title?: string; rating?: string }) {
          const ratingEmoji: Record<string, string> = {
            true: '✅',
            'mostly-true': '🟢',
            misleading: '🟡',
            'mostly-false': '🟠',
            false: '🔴',
            unverifiable: '⬜',
          };
          return {
            title: `${ratingEmoji[rating ?? ''] ?? '?'} ${title ?? 'Fact Check'}`,
            subtitle: 'Embedded Fact Check',
          };
        },
      },
    }),
  ],
});
