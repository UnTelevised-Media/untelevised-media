/* eslint-disable react/function-component-definition */
import { draftMode } from 'next/headers';
import { LiveQuery } from 'next-sanity/preview/live-query';
import DocumentsCount, { query } from '@/components/DocumentsCount';
import PreviewDocumentsCount from '@/components/PreviewDocumentsCount';
import { sanityFetch } from '@/lib/sanity.fetch';
import Link from 'next/link';

export default async function HomePage() {
  const data = await sanityFetch<number>({ query, tags: ['post'] });

  if (draftMode().isEnabled) {
    return (
      <div>
        <h1>This is Draft Mode</h1>
        <DocumentsCount data={data} />
        <Link href='/api/exit-draft'>Exit Draft Mode</Link>
      </div>
    );
  }

  // const post = await client.fetch(query);
  return (
    <div>
      <h1>Regular View</h1>
      <Link href='/api/draft'> Activate Draft Mode</Link>
    </div>
  );
}
