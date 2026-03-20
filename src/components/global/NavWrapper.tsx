// src/components/global/NavWrapper.tsx
import React from 'react';
import { groq } from 'next-sanity';
import { sanityFetch } from '@/lib/sanity/lib/live';
import Nav from './Nav';

const queryCategory = groq`
  *[_type=='category'] {
    ...,
    title,
    order,
  }
`;

const NavWrapper = async () => {
  let categories: { _id: string; title: string; order: number }[] = [];
  try {
    const { data } = await sanityFetch({ query: queryCategory, tags: ['category'] });
    categories = data ?? [];
  } catch (err) {
    console.error('[NavWrapper] sanityFetch failed:', err);
  }

  return <Nav categories={categories} />;
};

export default NavWrapper;
