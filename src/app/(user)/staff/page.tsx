/* eslint-disable react/function-component-definition */
// src/app/(user)/staff/page.tsx
import Image from 'next/image';
import urlForImage from '@/u/urlForImage';
import ClientSideRoute from '@/components/providers/ClientSideRoute';
import resolveHref from '@/util/resolveHref';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryAllAuthors } from '@/lib/sanity/lib/queries';

export default async function StaffPage() {
  const staff = await getAllStaff();
  const sortedStaff = staff.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className='flex flex-wrap justify-center space-x-3'>
      {staff &&
        sortedStaff.map((author) => (
          <ClientSideRoute
            route={resolveHref('author', author.slug?.current) ?? ''}
            key={author._id}
          >
            <div className='flex max-w-72 flex-col items-center justify-center space-y-2'>
              <div className='border-untele/80 relative h-64 w-64 rounded-full border object-contain shadow-md'>
                <Image
                  src={urlForImage(author.image as any).url() ?? ''}
                  fill
                  alt='image'
                  className='rounded-full object-cover shadow-md'
                />
              </div>
              <div className='flex flex-col items-center justify-center space-y-2'>
                <h1 className='text-2xl'>{author.name}</h1>
                <h2 className='flex items-center justify-center text-lg'>{author.title}</h2>
              </div>
            </div>
          </ClientSideRoute>
        ))}
    </div>
  );
}

// Call the Sanity Fetch Function for a list of All Authors
async function getAllStaff(): Promise<Author[]> {
  try {
    // Fetch author data from Sanity
    const staff: Author[] = await sanityFetch({
      query: queryAllAuthors,
      tags: ['author'],
    });
    return staff;
  } catch (error) {
    console.error('Failed to fetch author:', error);
    return [];
  }
}
