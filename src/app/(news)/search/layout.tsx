import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search UnTelevised Media articles, live events, and investigations.',
  robots: { index: false, follow: false },
};

// Force dynamic rendering — the search client initialises at request time
// and requires runtime env vars (NEXT_PUBLIC_ALGOLIA_APP_ID).
export const dynamic = 'force-dynamic';

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
