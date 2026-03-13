// src/app/(user)/join/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join the Mission — UnTelevised Media',
  description:
    'Apply to join the UnTelevised Media team as a journalist, editor, videographer, or contributor.',
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
