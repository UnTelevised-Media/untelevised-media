// src/app/(user)/join/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join UnTelevised Media — Membership & Supporter Tiers',
  description:
    'Become a member and support independent journalism from $5/month. Recurring memberships fund reporters, investigations, and editorial independence.',
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
