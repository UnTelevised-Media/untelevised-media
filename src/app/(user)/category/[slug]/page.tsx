/* eslint-disable react/function-component-definition */
// src/app/(user)/category/[slug]/page.tsx
import { groq } from 'next-sanity';

import ArticleCardLg from '@/components/cards/ArticleCardLg';

import ClientSideRoute from '@/components/providers/ClientSideRoute';
import { queryArticleByCategory } from '@/lib/sanity/lib/queries';
import resolveHref from '@/util/resolveHref';
import sanityFetch from '@/lib/sanity/lib/fetch';
import client from '@/lib/sanity/lib/client';

type Props = {
  params: {
    slug: string;
  };
};

export default async function CategoryPage({ params: { slug } }: Props) {
  const articles = await getArticlesByCategory(slug);

  return (
    <div className='mx-auto max-w-[95wv] md:max-w-[85vw]'>
      <div>
        <hr className='border-untele mb-8' />
        <div className='grid grid-cols-1 gap-x-10 gap-y-12 px-10 pb-24 md:grid-cols-2 xl:grid-cols-3'>
          {articles?.map((post) => (
            <ClientSideRoute route={resolveHref('post', post.slug?.current) || ''} key={post._id}>
              <ArticleCardLg post={post} />
            </ClientSideRoute>
          ))}
        </div>
      </div>
    </div>
  );
}

// Call the Sanity Fetch Function for the Article Information Filtered by Category
async function getArticlesByCategory(slug: string): Promise<Article[]> {
  try {
    // Fetch article data by category from Sanity
    const articles: Article[] = await sanityFetch({
      query: queryArticleByCategory,
      params: { slug },
      tags: ['post'],
    });
    return articles;
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }
}
// Generate the static params for the category list
export async function generateStaticParams() {
  const query = groq`*[_type=='category'] { slug }`;
  const slugs: Category[] = await client.fetch(query);
  const slugRoutes = slugs ? slugs.map((slug) => slug.slug.current) : [];
  return slugRoutes.map((slug) => ({
    slug,
  }));
}
