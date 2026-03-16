// src/app/(user)/privacy-settings/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Settings — UnTelevised Media',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function PrivacySettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
