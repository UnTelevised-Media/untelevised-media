/* eslint-disable react/function-component-definition */
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

  return (
    <>
      <hr className='mx-auto mb-8 max-w-[95wv] border-untele md:max-w-[85vw]' />
      <section className='mb-6 py-4'>
        <div className='mx-auto flex max-w-4xl flex-col justify-center rounded-md border border-untele/80 bg-slate-400 px-4 py-6 text-slate-900 shadow-md'>
          <PortableText
            value={policies.description}
            components={RichTextComponents}
          />
        </div>
      </section>
    </>
  );
}

// Call the Sanity Fetch Function for the Author Information
async function getPolicyBySlug(slug: string) {
  try {
    // Fetch author data from Sanity
    const policy: Policy = await sanityFetch({
      query: queryPolicyBySlug,
      params: { slug },
      tags: ['policies'],
    });
    return policy;
  } catch (error) {
    console.error('Failed to fetch author:', error);
    return null;
  }
}

// Generate the static params for the author list
export async function generateStaticParams() {
  const query = groq`*[_type=='policies'] { slug }`;
  const slugs: any = await client.fetch(query);
  const slugRoutes = slugs ? slugs.map((slug: any) => slug.slug.current) : [];
  return slugRoutes.map((slug) => ({
    slug,
  }));
}
