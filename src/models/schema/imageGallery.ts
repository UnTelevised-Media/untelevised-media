import { defineField, defineType } from 'sanity';
import { Image as ImageIcon } from 'lucide-react';

export default defineType({
  name: 'imageGallery',
  title: 'Image Gallery',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              description: 'Displayed as caption below the image in the gallery',
              validation: (Rule) => Rule.required(),
            },
          ],
        },
      ],
      validation: (Rule) => Rule.min(1).max(50),
      description: 'Add images to create a photo slideshow. Min 1, max 50 images.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Image Gallery',
        subtitle: 'Photo slideshow carousel',
      };
    },
  },
});
