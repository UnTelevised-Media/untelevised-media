// src/models/schemas/buttons.ts
import { defineField, defineType } from 'sanity';
import { MousePointer } from 'lucide-react';

export default defineType({
  name: 'ctaButton',
  title: 'CTA Button',
  type: 'document',
  icon: MousePointer,
  fields: [
    defineField({
      name: 'path',
      title: 'Path',
      description: 'The URL or route where this button should navigate to when clicked',
      type: 'string',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      description: 'The text that will be displayed on the button',
      type: 'string',
    }),
  ],
});
