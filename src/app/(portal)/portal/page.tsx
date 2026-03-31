// src/app/(portal)/portal/page.tsx
// Author portal root — redirects to the article dashboard.
import { redirect } from 'next/navigation';

export default function PortalRootPage() {
  redirect('/portal/articles');
}
