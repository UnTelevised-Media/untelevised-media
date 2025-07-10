/* eslint-disable react/function-component-definition */
// src/app/(user)/articles/[slug]/page.tsx
import Image from 'next/image';
import { groq } from 'next-sanity';
import { PortableText } from '@portabletext/react';
import { RichTextComponents } from '@/components/providers/RichTextComponents';
import SocialShare from '@/components/global/SocialShare';

import urlForImage from '@/u/urlForImage';
import ClientSideRoute from '@/components/providers/ClientSideRoute';
import formatDate from '@/util/formatDate';
import resolveHref from '@/util/resolveHref';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { queryArticleBySlug } from '@/lib/sanity/lib/queries';
import client from '@/lib/sanity/lib/client';

// import Comments from '@/c/post/Comments';

type Props = {
  params: {
    slug: string;
  };
};

export default async function Article({ params: { slug } }: Props) {
  const article: Article = (await getArticleBySlug(slug)) as Article;

  return (
    <>
      <hr className='mx-auto mb-8 max-w-[95wv] border-untele md:max-w-[85vw]' />
      <article className='mx-auto max-w-[95vw] pb-28 md:max-w-[85vw] lg:px-10'>
        <section className='space-y-2 rounded-md border border-untele/80 text-slate-200 shadow-md'>
          <div className='relative flex min-h-96 flex-col justify-between md:flex-row'>
            <div className='absolute top-0 h-full w-full p-10 opacity-25 blur-sm'>
              {/* Header Image  */}
              <Image
                className='-z-1 mx-auto object-cover object-center'
                src={urlForImage(article.mainImage as any)?.url() ?? ''}
                fill
                alt={article.mainImage?.alt ?? 'No Alt Tag Set'}
              />
            </div>

            {/* Header Info  */}
            <section className='relative w-full bg-untele/40 p-5'>
              <div className='flex flex-col justify-between md:flex-row'>
                <div className='space-y-2'>
                  <h1 className='text-3xl font-bold'>{article.title}</h1>
                  <div>
                    <h3>{article.location ?? null}</h3>
                    <p>{formatDate(article.eventDate ?? article._createdAt)}</p>
                  </div>
                  <ClientSideRoute
                    route={resolveHref('author', article.author.slug?.current) ?? ''}
                  >
                    <div className='flex items-center justify-start space-x-3 py-2'>
                      <Image
                        className='rounded-full object-cover object-center'
                        src={urlForImage(article.author.image as any)?.url() ?? ''}
                        width={50}
                        height={50}
                        alt={article.author.image?.alt ?? ''}
                      />
                      <h3 className='text-lg font-semibold'>{article.author.name}</h3>
                    </div>
                  </ClientSideRoute>
                </div>
              </div>

              <div className='flex items-center'>
                <h2 className='mt-6 italic'>{article.description}</h2>
                <div className='mt-auto flex items-center justify-end space-x-2'>
                  {article.categories &&
                    article.categories.map((category) => (
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

        <SocialShare url={`https://untelevised.media/articles/${slug}`} title={article.title} />
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* <GATag googleAnalyticsId={process.env.GA4_ID} /> */}
            {/* <LargeAdCard googleAdsenseId={process.env.GAS_ID} /> */}
          </>
        )}
        <div className='mt-4 flex justify-center'>
          <Image
            src={urlForImage(article.mainImage as any)?.url() ?? ''}
            alt={article.mainImage?.alt ?? 'No Alt Tag Set'}
            sizes='80vw'
            style={{
              width: '65%',
              height: 'auto',
            }}
            width={300}
            height={300}
            className='rounded-lg'
          />
        </div>
        {article.hasEmbeddedVideo && (
          <div className='my-4 flex items-center justify-center'>
            <iframe
              width='720'
              height='420'
              className='rounded-lg border border-untele bg-slate-700/30'
              src={`${article.videoLink}`}
              title='YouTube video player'
              // allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen'
            />
          </div>
        )}
        <section className='mx-auto mt-12 max-w-[85vw] rounded-lg border border-untele bg-slate-700/30 px-10 py-5 md:max-w-[70vw]'>
          <PortableText value={article.body} components={RichTextComponents} />
        </section>
        <div className=''>{/* <Comments article={article}/> */}</div>
      </article>
    </>
  );
}

// Call the Sanity Fetch Function for the Article by Slug
async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    // Fetch article data from Sanity
    const article = await sanityFetch<Article>({
      query: queryArticleBySlug,
      params: { slug },
      tags: ['article'],
    });
    return article;
  } catch (error) {
    console.log('Failed to fetch article:', error);
    return null;
  }
}

// Generate the static params for the article list
export async function generateStaticParams() {
  const query = groq`*[_type=='article'] { slug }`;
  const slugs: Article[] = await client.fetch(query);
  const slugRoutes = slugs ? slugs.map((slug) => slug.slug.current) : [];
  return slugRoutes.map((slug) => ({
    slug,
  }));
}
