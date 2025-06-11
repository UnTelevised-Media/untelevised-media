/* eslint-disable react/function-component-definition */
// src/app/(user)/policies/[slug]/page.tsx
import { groq } from 'next-sanity';
import { PortableText } from '@portabletext/react';
import { RichTextComponents } from '@/components/providers/RichTextComponents';
import client from '@/lib/sanity/lib/client';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryPolicyBySlug } from '@/lib/sanity/lib/queries';

type Props = {
  params: {
    slug: string;
  };
};

export default async function Policies({ params: { slug } }: Props) {
  const policies = await getPolicyBySlug(slug);

  if (!policies) {
    return (
      <div className='mx-auto max-w-4xl p-8 text-center'>
        <h1 className='text-3xl font-bold text-slate-900'>Policy Not Found</h1>
        <p className='mt-4 text-slate-600'>The requested policy could not be found.</p>
      </div>
    );
  }

  return (
    <>
      <hr className='border-untele mx-auto mb-8 max-w-[95wv] md:max-w-[85vw]' />
      <section className='mb-6 py-4'>
        <div className='border-untele/80 mx-auto flex max-w-4xl flex-col justify-center rounded-md border bg-slate-400 px-4 py-6 text-slate-900 shadow-md'>
          <PortableText value={policies.description} components={RichTextComponents} />
        </div>
      </section>
    </>
  );
}

// Call the Sanity Fetch Function for the Author Information
async function getPolicyBySlug(slug: string): Promise<Policy | null> {
  try {
    // Fetch author data from Sanity
    const policy: Policy = await sanityFetch({
      query: queryPolicyBySlug,
      params: { slug },
      tags: ['policies'],
    });
    return policy;
  } catch (error) {
    console.error('Failed to fetch policy:', error);
    return null;
  }
}

// Generate the static params for the author list
export async function generateStaticParams() {
  const query = groq`*[_type=='policies'] { slug }`;
  const slugs: { slug: { current: string } }[] = await client.fetch(query);
  const slugRoutes = slugs ? slugs.map((item) => item.slug.current) : [];
  return slugRoutes.map((slug) => ({
    slug,
  }));
}
