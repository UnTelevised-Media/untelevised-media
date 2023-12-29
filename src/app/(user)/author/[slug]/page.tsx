/* eslint-disable import/prefer-default-export */
import Image from 'next/image';
import { groq } from 'next-sanity';
import { PortableText } from '@portabletext/react';
import { RichTextComponents } from '@/c/RichTextComponents';
import { client } from '@/l/sanity.client';
import urlForImage from '@/u/urlForImage';
import {
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

  const author: any = await client.fetch(query, { slug });

  console.log('Author Data:', author);

  return (
    <>
      <hr className='mx-auto mb-8 max-w-[95wv] border-untele md:max-w-[85vw]' />
      <section className='mb-6 py-4'>
        <div className='mx-auto flex max-w-4xl flex-col justify-center rounded-md border border-untele/80 bg-slate-400 text-slate-900 shadow-md'>
          <div className='flex flex-row space-x-18 py-4'>
            <div>
              <Image
                src={urlForImage(author.image).url()}
                width={320}
                height={320}
                alt='image'
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
    </>
  );
}

export default Author;
