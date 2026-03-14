/* eslint-disable react/function-component-definition */
// src/app/(user)/category/[slug]/page.tsx
import { groq } from 'next-sanity';

import ArticleCardLg from '@/components/cards/ArticleCardLg';

import ClientSideRoute from '@/components/providers/ClientSideRoute';
import type { Metadata } from 'next';
import { queryArticleByCategory, queryCategoryBySlug } from '@/lib/sanity/lib/queries';
import resolveHref from '@/util/resolveHref';
import sanityFetch from '@/lib/sanity/lib/fetch';
import { buildCategoryMetadata } from '@/util/metadata';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category: Category = await sanityFetch({ query: queryCategoryBySlug, params: { slug }, tags: ['category'] });
  if (!category) return { title: 'Category Not Found' };
  return buildCategoryMetadata(category, slug);
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const articles = await getArticlesByCategory(slug);

  return (
    <div className='mx-auto max-w-[95wv] md:max-w-[85vw]'>
      <div>
        <hr className='mb-8 border-untele' />
        <div className='grid grid-cols-1 gap-x-10 gap-y-12 px-10 pb-24 md:grid-cols-2 xl:grid-cols-3'>
          {articles?.map((article) => (
            <ClientSideRoute
              route={resolveHref('article', article.slug?.current) ?? ''}
              key={article._id}
            >
              <ArticleCardLg post={article} />
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
      tags: ['article'],
    });
    return articles;
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }
}
// Generate the static params for the category list
export async function generateStaticParams() {
  const queryCategoryStaticParams = groq`*[_type=='category'] { slug }`;
  const slugs: Category[] = await sanityFetch({ query: queryCategoryStaticParams, tags: ['category'] });
  const slugRoutes = slugs ? slugs.map((slug) => slug.slug.current) : [];
  return slugRoutes.map((slug) => ({
    slug,
  }));
}
