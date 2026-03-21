import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search UnTelevised Media articles, live events, and investigations.',
  robots: { index: false, follow: false },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
