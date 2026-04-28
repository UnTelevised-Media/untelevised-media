/* eslint-disable react/function-component-definition */
// src/app/(user)/policies/[slug]/page.tsx
import { groq } from 'next-sanity';
import { PortableText } from '@portabletext/react';
import { RichTextComponents } from '@/components/providers/RichTextComponents';
import { sanityFetch } from '@/lib/sanity/lib/live';
import sanityClient from '@/lib/sanity/lib/client';
import { queryPolicyBySlug } from '@/lib/sanity/lib/queries';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function Policies({ params }: Props) {
  const { slug } = await params;
  const policies = await getPolicyBySlug(slug);

  if (!policies) {
    return (
      <div className='mx-auto max-w-4xl p-8 text-center'>
        <h1 className='text-3xl font-bold text-slate-900 dark:text-slate-100'>Policy Not Found</h1>
        <p className='mt-4 text-slate-600 dark:text-slate-400'>
          The requested policy could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 py-16 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'>
        {/* Background Pattern */}
        <div className='absolute inset-0'>
          <div className='bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23dc2626" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] absolute inset-0 opacity-40' />
        </div>

        <div className='relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8'>
          <div className='space-y-6'>
            {/* Icon */}
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-untele to-red-400 shadow-lg'>
              <svg
                className='h-8 w-8 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                />
              </svg>
            </div>

            {/* Title */}
            <h1 className='text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl lg:text-6xl'>
              {policies.title || 'Policy'}
            </h1>

            {/* Subtitle */}
            <p className='mx-auto max-w-2xl text-lg text-slate-700 dark:text-slate-300 sm:text-xl'>
              Understanding our commitment to transparency and responsible journalism
            </p>

            {/* Decorative line */}
            <div className='mx-auto h-1 w-20 bg-gradient-to-r from-untele to-red-400' />
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <main className='mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8'>
        <article className='rounded-xl border border-slate-200 bg-white/50 p-8 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/50 lg:p-12'>
          <div className='prose prose-lg prose-slate dark:prose-invert max-w-none'>
            <PortableText value={policies.description} components={RichTextComponents} />
          </div>
        </article>

        {/* Footer */}
        <div className='mt-12 text-center'>
          <div className='rounded-lg border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-700 dark:bg-slate-800/50'>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Last updated:{' '}
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className='mt-2 text-sm text-slate-600 dark:text-slate-400'>
              For questions about this policy, please{' '}
              <a
                href='/contact'
                className='font-medium text-untele transition-colors hover:text-red-400'
              >
                contact us
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Call the Sanity Fetch Function for the Author Information
async function getPolicyBySlug(slug: string): Promise<Policy | null> {
  try {
    // Fetch author data from Sanity
    const { data: policy } = await sanityFetch({
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
  const queryPolicyStaticParams = groq`*[_type=='policies'] { slug }`;
  // Use sanityClient directly to avoid draftMode() call during static generation
  const slugs: { slug: { current: string } }[] = await sanityClient.fetch(queryPolicyStaticParams);
  const slugRoutes = slugs ? slugs.filter((item) => item?.slug?.current).map((item) => item.slug.current) : [];
  return slugRoutes.map((slug) => ({
    slug,
  }));
}
