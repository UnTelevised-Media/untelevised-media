import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cart — Hurriya Publications',
  robots: { index: false, follow: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
