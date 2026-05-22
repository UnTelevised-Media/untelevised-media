import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download Vault — Hurriya Publications',
  robots: { index: false, follow: false },
};

export default function DownloadsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
