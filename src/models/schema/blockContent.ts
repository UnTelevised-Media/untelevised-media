/* eslint-disable @typescript-eslint/no-explicit-any */

// src/models/schemas/blockContent.ts
import { defineType, defineArrayMember, defineField } from 'sanity';
import { CodeIcon, ImageIcon } from '@sanity/icons';

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
        defineField({
          name: 'rows',
          type: 'array',
          title: 'Rows',
          description: 'Table data organized by rows',
          of: [
            {
              type: 'object',
              name: 'row',
              fields: [
                defineField({
                  name: 'cells',
                  type: 'array',
                  title: 'Cells',
                  description: 'Individual cell data for this row',
                  of: [{ type: 'string' }],
                }),
              ],
            },
          ],
        }),
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
  ],
});
