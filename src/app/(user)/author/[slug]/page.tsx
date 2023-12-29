/* eslint-disable import/prefer-default-export */
import Image from 'next/image';
import { groq } from 'next-sanity';
import { PortableText } from '@portabletext/react';
import { RichTextComponents } from '@/c/RichTextComponents';
import { client } from '@/l/sanity.client';
import urlForImage from '@/u/urlForImage';
import {
  FaEnvelope,
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa';
import Link from 'next/link';

type Props = {
  params: {
    slug: string;
  };
};

// export const revalidate = 60 * 60 * 24 * 7;
export const revalidate = 15;

export async function generateStaticParams() {
  const query = groq`*[_type=='author']
  {
    slug
  }`;

  const slugs: any = await client.fetch(query);
  const slugRoutes = slugs ? slugs.map((slug: any) => slug.slug.current) : [];

  return slugRoutes.map((slug) => ({
    slug,
  }));
}

async function Author({ params: { slug } }: Props) {
  const query = groq`
    *[_type == "author" && slug.current == $slug][0] {
      ...,
      author-> {
        name,
        image,
        bio,
        title,
        social {
          twitter,
          instagram,
          website,
          facebook,
          youtube,
          linkedin,
          tiktok
        },
      },
    }`;

  const queryPost = groq`
  *[_type=='post'] {
    ...,
    author->,
    publistedAt,
    categories[]->,
  } 
  | order(_createdAt desc)
`;

  const posts = await client.fetch(queryPost);

  const author: any = await client.fetch(query, { slug });

  return (
    <>
      <hr className='mx-auto mb-8 max-w-[95wv] border-untele md:max-w-[85vw]' />
      <section className='mb-6 py-4'>
        <div className='mx-auto flex max-w-4xl flex-col justify-center rounded-md border border-untele/80 bg-slate-400 text-slate-900 shadow-md'>
          <div className='flex flex-row space-x-18 px-6 py-4'>
            <div className='rounded-md border border-untele/80 shadow-md'>
              <Image
                src={urlForImage(author.image).url()}
                width={320}
                height={320}
                alt='image'
                className='rounded-md shadow-md'
              />
            </div>

            <div className='flex flex-col space-y-2'>
              <h1 className='text-4xl font-bold'>{author.name}</h1>
              <h3 className='text-xl font-semibold text-slate-700'>
                {author.title}
              </h3>
              <div className='flex flex-row space-x-4 text-untele/70'>
                {author.website && (
                  <Link href={author.website}>
                    <FaGlobe />
                  </Link>
                )}
                {author.twitter && (
                  <Link href={author.twitter}>
                    <FaTwitter />
                  </Link>
                )}
                {author.instagram && (
                  <Link href={author.instagram}>
                    <FaInstagram />
                  </Link>
                )}
                {author.facebook && (
                  <Link href={author.facebook}>
                    <FaFacebook />
                  </Link>
                )}
                {author.youtube && (
                  <Link href={author.youtube}>
                    <FaYoutube />
                  </Link>
                )}
                {author.tiktok && (
                  <Link href={author.tiktok}>
                    <FaTiktok />
                  </Link>
                )}
                {author.linkedin && (
                  <Link href={author.linkedin}>
                    <FaLinkedin />
                  </Link>
                )}
                {author.email && (
                  <Link href={`mailto:${author.email}`}>
                    <FaEnvelope />
                  </Link>
                )}
              </div>
            </div>
          </div>
          {author.bio && (
            <div className='flex flex-row justify-between px-6 py-5'>
              <div>
                <p>
                  <PortableText
                    value={author.bio}
                    components={RichTextComponents}
                  />
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Authored Articles  */}
      <section className='mx-18 my-12'>
        <h1 className='text-3xl font-bold mb-4 pb-2 border-b border-untele'>Latest Articles</h1>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 '>
          {posts
            .filter((post: Post) => post.author?.slug.current === slug) // Filter by author slug
            .map((post: Post) => {
              const date = new Date(post._createdAt);
              const formattedDate = date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <Link
                  key={post._id}
                  href={`/post/${post.slug.current}`}
                  className='flex flex-col justify-between rounded-md border border-untele/80 bg-slate-400 text-slate-900 shadow-md'
                >
                  <div className='flex flex-col space-y-4'>
                    <div className='relative h-80 w-full drop-shadow-xl transition-transform duration-200 ease-out hover:scale-105'>
                      <Image
                        src={urlForImage(post.mainImage).url()}
                        fill
                        alt='image'
                        className='rounded-md object-fill'
                      />
                    </div>
                    <div className='flex flex-col space-y-2 px-4 pb-3'>
                      <h3 className='text-lg font-semibold'>{post.title}</h3>
                      <p>{formattedDate}</p>
                      {post.categories &&
                        post.categories.map((category) => (
                          <div
                            key={category._id}
                            className='max-w-[160px] rounded-xl border border-untele bg-slate-900/80 px-5 py-2 text-center text-xs font-semibold text-untele lg:text-sm'
                          >
                            <p>{category.title}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>
    </>
  );
}

export default Author;
