// src/components/error/RouteErrorBoundary.tsx
// ErrorBoundary that resets itself on client-side navigation. The root layout
// never remounts, so a plain ErrorBoundary there keeps showing its fallback on
// every page after a single crash — this keys the reset to the pathname.
'use client';

import { usePathname } from 'next/navigation';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <ErrorBoundary resetKey={pathname}>{children}</ErrorBoundary>;
}
