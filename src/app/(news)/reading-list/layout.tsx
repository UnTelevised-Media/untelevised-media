// src/app/(user)/reading-list/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reading List',
  description: 'Your saved articles on UnTelevised Media — available on any device when signed in.',
  robots: { index: false, follow: false },
};

export default function ReadingListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
