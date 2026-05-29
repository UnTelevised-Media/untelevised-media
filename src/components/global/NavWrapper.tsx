// src/components/global/NavWrapper.tsx
// Uses CDN-backed ISR fetch (not Live API) — category nav updates via
// Sanity webhook tag revalidation, not real-time subscription.
import React from 'react';
import { groq } from 'next-sanity';
import sanityFetch from '@/lib/sanity/lib/fetch';
import Nav from './Nav';

const queryCategory = groq`
  *[_type=='category'] {
    ...,
    title,
    order,
  }
`;

type Category = { _id: string; title: string; order: number };

const NavWrapper = async () => {
  let categories: Category[] = [];
  try {
    const data = await sanityFetch<Category[]>({ query: queryCategory, tags: ['category'] });
    categories = data ?? [];
  } catch (err) {
    console.error('[NavWrapper] sanityFetch failed:', err);
  }

  return <Nav categories={categories} />;
};

export default NavWrapper;
