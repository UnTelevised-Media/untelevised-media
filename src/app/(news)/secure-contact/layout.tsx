// src/app/(user)/secure-contact/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Contact — UnTelevised Media',
  description: 'Send a secure, encrypted message to the UnTelevised Media editorial team.',
};

export default function SecureContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
