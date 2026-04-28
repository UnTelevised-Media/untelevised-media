/* eslint-disable react/function-component-definition */
// src/app/(user)/staff/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import urlForImage from '@/util/urlForImage';

export const metadata: Metadata = {
  title: 'Our Team — UnTelevised Media',
  description: 'Meet the journalists, editors, and contributors behind UnTelevised Media.',
};
import ClientSideRoute from '@/components/providers/ClientSideRoute';
import AuthorLinks from '@/components/global/AuthorLinks';
import resolveHref from '@/util/resolveHref';
import { sanityFetch } from '@/lib/sanity/lib/live';
import { queryAllAuthors } from '@/lib/sanity/lib/queries';

export default async function StaffPage() {
  const staff = await getAllStaff();
  const sortedStaff = staff.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {/* STAFF HEADER SECTION */}
      <section className='border-b border-slate-300 bg-gradient-to-b from-slate-50 to-white py-12 dark:border-slate-800 dark:from-slate-950 dark:to-black'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-2xl font-black uppercase tracking-widest text-white'>
                OUR TEAM
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-400 dark:bg-slate-700' />
          </div>
          <p className='max-w-3xl text-lg text-slate-700 dark:text-slate-300'>
            Meet the fearless journalists and correspondents who bring you the truth from the
            field. Our team operates where mainstream media won&rsquo;t go, delivering unfiltered
            reporting from the frontlines of breaking news.
          </p>
        </div>
      </section>

      {/* STAFF GRID SECTION */}
      <section className='bg-slate-50 py-12 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {staff &&
              sortedStaff.map((author) => (
                <div
                  key={author._id}
                  className='group flex h-full flex-col border border-slate-300 bg-white transition-all hover:border-untele hover:bg-slate-50 dark:border-slate-700 dark:bg-black dark:hover:bg-slate-900'
                >
                  {/* Author Image - Clickable */}
                  <ClientSideRoute route={resolveHref('author', author.slug?.current) ?? ''}>
                    <div className='aspect-square cursor-pointer overflow-hidden'>
                      <Image
                        src={
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          urlForImage(author.image as any).url() ?? ''
                        }
                        width={400}
                        height={400}
                        alt={author.name || 'Staff member'}
                        className='h-full w-full object-cover transition-transform group-hover:scale-105'
                      />
                    </div>
                  </ClientSideRoute>

                  {/* Author Info */}
                  <div className='flex flex-1 flex-col p-6'>
                    <div className='mb-3'>
                      <span className='mb-2 inline-block bg-untele px-2 py-1 text-xs font-black uppercase tracking-widest text-white'>
                        CORRESPONDENT
                      </span>
                    </div>

                    {/* Name - Clickable */}
                    <ClientSideRoute route={resolveHref('author', author.slug?.current) ?? ''}>
                      <h2 className='mb-2 cursor-pointer text-xl font-bold text-slate-800 transition-colors hover:text-untele dark:text-slate-200'>
                        {author.name}
                      </h2>
                    </ClientSideRoute>

                    <p className='mb-4 text-sm uppercase tracking-wide text-slate-600 dark:text-slate-400'>
                      {author.title}
                    </p>

                    {/* Social Links - pushed to bottom */}
                    <div className='mt-auto flex justify-center'>
                      <AuthorLinks author={author} />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA SECTION */}
      <section className='border-t-4 border-untele bg-gradient-to-b from-untele/20 to-black py-12'>
        <div className='mx-auto max-w-4xl px-4 text-center'>
          <h2 className='mb-4 text-2xl font-black uppercase tracking-widest text-white'>
            JOIN OUR MISSION
          </h2>
          <p className='mb-8 text-lg text-slate-300'>
            Think you have what it takes to report the truth? We&rsquo;re always looking for
            fearless journalists who aren&rsquo;t afraid to go where others won&rsquo;t.
          </p>
          <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
            <button className='bg-untele px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600'>
              APPLY NOW
            </button>
            <button className='border-2 border-white bg-transparent px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black'>
              CONTACT US
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Call the Sanity Fetch Function for a list of All Authors
async function getAllStaff(): Promise<Author[]> {
  try {
    // Fetch author data from Sanity
    const { data: staff } = await sanityFetch({
      query: queryAllAuthors,
      tags: ['author'],
    });
    return staff;
  } catch (error) {
    console.error('Failed to fetch author:', error);
    return [];
  }
}
