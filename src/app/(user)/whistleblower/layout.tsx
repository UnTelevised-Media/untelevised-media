// src/app/(user)/whistleblower/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Whistleblower Portal — UnTelevised Media',
  description:
    'Securely submit tips, documents, and whistleblower reports to UnTelevised Media journalists.',
};

export default function WhistleblowerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
