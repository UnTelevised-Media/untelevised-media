/* eslint-disable react/function-component-definition */
import { RichTextComponents } from '@/c/RichTextComponents';
import { client } from '@/l/sanity.client';
import urlForImage from '@/u/urlForImage';
import { groq } from 'next-sanity';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';

import SocialShare from '@/components/SocialShare';

type Props = {
  params: {
    slug: string;
  };
};

export const revalidate = 120;

export async function generateStaticParams() {
  const query = groq`*[_type=='post']
  {
    slug
  }`;

  const slugs: Post[] = await client.fetch(query);
  const slugRoutes = slugs ? slugs.map((slug) => slug.slug.current) : [];

  return slugRoutes.map(slug => ({
    slug,
  }));
}

async function Article({ params: { slug } }: Props) {
  const query = groq`
  *[_type == "post" && slug.current == $slug][0] {
        ...,
        author->,
        categories[]->,
        'comments': *[
          _type == 'comment' &&
          post._ref == ^._id &&
          approved == true],
    }`;

  const post: Post = await client.fetch(query, { slug });

  return (
    <article className='mx-auto max-w-[85vw] px-10 pb-28'>
      <section className='space-y-2 rounded-md border border-untele/80 text-slate-200 shadow-md'>
        <div className='min-h-96 relative flex flex-col justify-between md:flex-row'>
          <div className='absolute top-0 h-full w-full p-10 opacity-10 blur-sm'>
            <Image
              className='mx-auto object-cover object-center'
              src={urlForImage(post.mainImage).url()}
              fill
              alt=''
            />
          </div>

          <section className='w-full bg-untele/50 p-5'>
            <div className='flex flex-col justify-between md:flex-row'>
              <div className='space-y-2'>
                <h1 className='text-3xl font-bold'>{post.title}</h1>
                <div>
                  {/* <h3>{post.location}</h3> */}
                  <p>
                    {new Date(post._createdAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className='flex items-center justify-start space-x-3 pb-2'>
                  <Image
                    className='rounded-full object-cover object-center'
                    src={urlForImage(post.author.image).url()}
                    width={50}
                    height={50}
                    alt=''
                  />
                  <h3 className='text-lg font-semibold'>{post.author.name}</h3>
                </div>
              </div>
            </div>

            <div className='flex items-center'>
              <h2 className='mt-6 italic'>{post.description}</h2>
              <div className='mt-auto flex items-center justify-end space-x-2'>
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
          </section>
        </div>
      </section>

      <SocialShare
        url={`https://untelevised.media/post/${slug}`}
        title={post.title}
      />

      <div className='mt-4 flex justify-center'>
        <Image
          src={urlForImage(post.mainImage).url()}
          alt='Image Description'
          sizes='60vw'
          style={{
            width: '70%',
            height: 'auto',
          }}
          width={300}
          height={300}
          className='rounded-lg'
        />
      </div>

      <section className='mx-auto mt-12 max-w-[70vw] rounded-lg border border-untele bg-slate-700/30 px-10 py-5'>
        <PortableText value={post.body} components={RichTextComponents} />
      </section>
    </article>
  );
}

export default Article;
