import { defineField, defineType } from 'sanity';

// Embedded object: a single purchasable format within a book
const bookFormat = {
  name: 'bookFormat',
  title: 'Book Format',
  type: 'object',
  fields: [
    defineField({
      name: 'formatType',
      title: 'Format Type',
      type: 'string',
      options: {
        list: [
          { title: 'Physical', value: 'physical' },
          { title: 'Digital', value: 'digital' },
          { title: 'Bundle (Physical + Digital)', value: 'bundle' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (USD)',
      type: 'number',
      description: 'Price in dollars, e.g. 19.99',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Compare-at Price (USD)',
      type: 'number',
      description: 'Original price for strike-through display (optional)',
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe Price ID',
      type: 'string',
      description: 'e.g. price_1ABC... — from Stripe Dashboard',
    }),
    defineField({
      name: 'stripeProductId',
      title: 'Stripe Product ID',
      type: 'string',
      description: 'e.g. prod_1ABC... — from Stripe Dashboard',
    }),
    // Physical / bundle inventory tracking
    defineField({
      name: 'inventory',
      title: 'Inventory',
      type: 'object',
      hidden: ({ parent }) => (parent as { formatType?: string })?.formatType === 'digital',
      fields: [
        defineField({
          name: 'trackInventory',
          title: 'Track Inventory',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'quantity',
          title: 'Quantity',
          type: 'number',
          initialValue: 0,
        }),
        defineField({
          name: 'lowStockThreshold',
          title: 'Low Stock Threshold',
          type: 'number',
          initialValue: 5,
        }),
        defineField({
          name: 'allowBackorder',
          title: 'Allow Backorder',
          type: 'boolean',
          initialValue: false,
        }),
      ],
    }),
    // Digital / bundle asset info
    defineField({
      name: 'digitalAsset',
      title: 'Digital Asset',
      type: 'object',
      hidden: ({ parent }) => (parent as { formatType?: string })?.formatType === 'physical',
      fields: [
        defineField({
          name: 'supabaseStoragePath',
          title: 'Supabase Storage Path',
          type: 'string',
          description: 'Path inside the digital-books bucket, e.g. books/my-book-v1.pdf',
        }),
        defineField({
          name: 'fileSize',
          title: 'File Size',
          type: 'string',
          description: 'e.g. "4.2 MB"',
        }),
        defineField({
          name: 'fileFormat',
          title: 'File Format',
          type: 'string',
          description: 'e.g. PDF, EPUB, MOBI',
        }),
        defineField({
          name: 'version',
          title: 'Version',
          type: 'string',
          description: 'e.g. "1.0.0"',
        }),
      ],
    }),
    // Physical shipping data
    defineField({
      name: 'weight',
      title: 'Weight (grams)',
      type: 'number',
      hidden: ({ parent }) => (parent as { formatType?: string })?.formatType === 'digital',
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions',
      type: 'string',
      description: 'e.g. "8.5 x 5.5 x 0.8 in"',
      hidden: ({ parent }) => (parent as { formatType?: string })?.formatType === 'digital',
    }),
  ],
  preview: {
    select: { title: 'formatType', subtitle: 'price' },
    prepare({ title, subtitle }: { title?: string; subtitle?: number }) {
      const labels: Record<string, string> = {
        physical: 'Physical',
        digital: 'Digital',
        bundle: 'Bundle',
      };
      return {
        title: labels[title ?? ''] ?? title ?? 'Format',
        subtitle: subtitle != null ? `$${subtitle.toFixed(2)}` : undefined,
      };
    },
  },
};

export default defineType({
  name: 'book',
  title: 'Book',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
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
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image (Sanity)',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        },
      ],
    }),
    defineField({
      name: 'coverImageUrl',
      title: 'Cover Image URL (Supabase)',
      type: 'url',
      description: 'Managed automatically — set via the author portal upload.',
      readOnly: true,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'genre',
      title: 'Genre',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'bookGenre' }] }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'date',
    }),
    defineField({
      name: 'isbn',
      title: 'ISBN',
      type: 'string',
    }),
    defineField({
      name: 'pages',
      title: 'Pages',
      type: 'number',
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      initialValue: 'en',
    }),
    defineField({
      name: 'formats',
      title: 'Formats',
      type: 'array',
      of: [{ type: 'bookFormat' }],
      description: 'Add one entry per purchasable format (physical, digital, bundle)',
    }),
    defineField({
      name: 'samplePdfUrl',
      title: 'Sample / Preview URL',
      type: 'url',
      description: 'Publicly accessible URL to a free sample PDF (optional)',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
          { title: 'Out of Stock', value: 'out-of-stock' },
          { title: 'Discontinued', value: 'discontinued' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Published Date, Newest',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'status',
      media: 'coverImage',
    },
  },
});

// Export the embedded object type so schema/index.ts can register it separately
export { bookFormat };
