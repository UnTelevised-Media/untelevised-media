/* eslint-disable import/prefer-default-export */
import { groq } from 'next-sanity';
import { PortableText } from '@portabletext/react';
import { RichTextComponents } from '@/c/RichTextComponents';
import { client } from '@/l/sanity.client';


type Props = {
  params: {
    slug: string;
  };
};

// export const revalidate = 60 * 60 * 24 * 7;
export const revalidate = 15;

export async function generateStaticParams() {
  const query = groq`*[_type=='policies']
  {
    slug
  }`;

  const slugs: any = await client.fetch(query);
  const slugRoutes = slugs ? slugs.map((slug: any) => slug.slug.current) : [];

  return slugRoutes.map((slug) => ({
    slug,
  }));
}

async function Policies({ params: { slug } }: Props) {
  const query = groq`
    *[_type == "policies" && slug.current == $slug][0] {
      ...,
      policies-> {
        title,
        lastUpdated,
        description,
      },
    }`;




  const policies = await client.fetch(query, { slug });

  return (
    <>
      <hr className='mx-auto mb-8 max-w-[95wv] border-untele md:max-w-[85vw]' />
      <section className='mb-6 py-4'>
        <div className='mx-auto flex max-w-4xl flex-col justify-center rounded-md border border-untele/80 bg-slate-400 text-slate-900 shadow-md px-4 py-6'>
          <PortableText value={policies.description} components={RichTextComponents} />
        </div>
      </section>
    </>
  );
}

export default Policies;
