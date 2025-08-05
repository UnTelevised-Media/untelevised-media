// src/components/global/NavWrapper.tsx
import React from 'react';
import { groq } from 'next-sanity';
import sanityClient from '@/lib/sanity/lib/client';
import Nav from './Nav';

const queryCategory = groq`
  *[_type=='category'] {
    ...,
    title,
    order,
  } 
`;

const NavWrapper = async () => {
  const categories = await sanityClient.fetch(queryCategory);
  
  return <Nav categories={categories} />;
};

export default NavWrapper;
