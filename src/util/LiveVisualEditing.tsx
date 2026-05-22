/* eslint-disable react/function-component-definition */
// src/util/LiveVisualEditing.tsx
'use client';

import { useLiveMode } from '@sanity/react-loader';
import { VisualEditing } from 'next-sanity/visual-editing';
import { useEffect } from 'react';

import { client } from '@/lib/sanity/lib/client';

// Always enable stega in Live Mode
// This function may be unused in the final version hanging on to it to see if it's needed for draft mode

const stegaClient = client.withConfig({ stega: true });

export default function LiveVisualEditing() {
  useLiveMode({ client: stegaClient });
  useEffect(() => {
    // If not an iframe or a Vercel Preview deployment, turn off Draft Mode
    if (process.env.NEXT_PUBLIC_VERCEL_ENV !== 'preview' && window === parent) {
      location.href = '/api/disable-draft';
    }
  }, []);

  return <VisualEditing />;
}
