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
  const { data: categories } = await sanityFetch({ query: queryCategory, tags: ['category'] });

  return <Nav categories={categories} />;
};

export default NavWrapper;
