import Image from 'next/image';
import { groq } from 'next-sanity';
import { client } from '@/l/sanity.client';
import urlForImage from '@/u/urlForImage';
import ClientSideRoute from '@/components/ClientSideRoute';

// export const revalidate = 60 * 60 * 24 * 7;
export const revalidate = 15;

async function StaffPage() {
  const query = groq`
  *[_type == "author" ] {
    ...,
    author-> {
      name,
      image,
      title,
    },
  } 
  | order(author.order desc)
  `;

  const data = await client.fetch(query);

  const sortedData = data.sort((a, b) => a.order - b.order);

  return (
    <div className='flex flex-wrap justify-center space-x-3'>
      {sortedData.map((author) => (
        <ClientSideRoute
          route={`/author/${author.slug?.current}`}
          key={author._id}
        >
          <div className='flex max-w-72 flex-col  items-center justify-center space-y-2'>
            <div className='relative h-64 w-64 rounded-full border border-untele/80 object-contain shadow-md'>
              <Image
                src={urlForImage(author.image).url()}
                fill
                alt='image'
                className='rounded-full object-cover shadow-md'
              />
            </div>
            <div className='flex flex-col items-center justify-center space-y-2'>
              <h1 className='text-2xl'>{author.name}</h1>
              <h2 className='flex items-center justify-center text-lg'>
                {author.title}
              </h2>
            </div>
          </div>
        </ClientSideRoute>
      ))}
    </div>
  );
}

export default StaffPage;
