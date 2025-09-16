import { defineField, defineType } from 'sanity';
import { Tag } from 'lucide-react';

export default defineType({
  name: 'timelineCategory',
  title: 'Timeline Category',
  type: 'document',
  icon: Tag,
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
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of this timeline category',
    }),
    defineField({
      name: 'color',
      title: 'Category Color',
      type: 'string',
      options: {
        list: [
          { title: 'Red (Breaking/Critical)', value: 'red' },
          { title: 'Blue (Political)', value: 'blue' },
          { title: 'Green (Environmental)', value: 'green' },
          { title: 'Purple (Social)', value: 'purple' },
          { title: 'Orange (Economic)', value: 'orange' },
          { title: 'Yellow (Technology)', value: 'yellow' },
          { title: 'Pink (Cultural)', value: 'pink' },
          { title: 'Teal (Investigation)', value: 'teal' },
          { title: 'Gray (Other)', value: 'gray' },
        ],
      },
      initialValue: 'gray',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon Name',
      type: 'string',
      description: 'Lucide icon name for this category (e.g., "AlertTriangle", "Users", "Globe")',
      placeholder: 'Calendar',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which this category appears in filters and lists',
      initialValue: 0,
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Whether this category is currently active and visible',
      initialValue: true,
    }),
    defineField({
      name: 'parentCategory',
      title: 'Parent Category',
      type: 'reference',
      to: { type: 'timelineCategory' },
      description: 'Optional parent category for hierarchical organization',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      color: 'color',
      order: 'order',
      isActive: 'isActive',
    },
    prepare(selection) {
      const { title, color, order, isActive } = selection;
      const status = isActive ? '✓' : '✗';

      return {
        title,
        subtitle: `${color} • Order: ${order} • ${status}`,
      };
    },
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
});
