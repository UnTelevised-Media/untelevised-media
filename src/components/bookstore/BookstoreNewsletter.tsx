'use client';
// src/components/bookstore/BookstoreNewsletter.tsx
// Thin wrapper around the shared NewsletterSignup component for the bookstore list.
// Kept for backward compatibility with existing import sites.

import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup';

type BookstoreSource = 'bookstore-home' | 'bookstore-about' | 'book-detail';

interface Props {
  source?: BookstoreSource;
  variant?: 'full' | 'compact';
}

export default function BookstoreNewsletter({
  source = 'bookstore-home',
  variant = 'full',
}: Props) {
  return <NewsletterSignup list='bookstore' variant={variant} source={source} />;
}
