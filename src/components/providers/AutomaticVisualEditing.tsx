/* eslint-disable react/function-component-definition */
'use client';

import { VisualEditing } from 'next-sanity/visual-editing';
import { useEffect } from 'react';

export default function AutomaticVisualEditing() {
  useEffect(() => {
    // If not an iframe or a Vercel Preview deployment, turn off Draft Mode
    if (process.env.NEXT_PUBLIC_VERCEL_ENV !== 'preview' && window === parent) {
      location.href = '/api/disable-draft';
    }
  }, []);

  return <VisualEditing />;
}
