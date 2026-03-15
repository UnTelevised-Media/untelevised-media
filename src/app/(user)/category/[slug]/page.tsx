/* eslint-disable react/function-component-definition */
// src/app/(user)/category/[slug]/page.tsx
import { groq } from 'next-sanity';

import ArticleCardLg from '@/components/cards/ArticleCardLg';

import ClientSideRoute from '@/components/providers/ClientSideRoute';
import type { Metadata } from 'next';
import { queryArticleByCategory, queryCategoryBySlug } from '@/lib/sanity/lib/queries';
import resolveHref from '@/util/resolveHref';
import { sanityFetch } from '@/lib/sanity/lib/live';
import sanityClient from '@/lib/sanity/lib/client';
import { buildCategoryMetadata } from '@/util/metadata';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: category } = await sanityFetch({ query: queryCategoryBySlug, params: { slug }, tags: ['category'] });
  if (!category) return { title: 'Category Not Found' };
  return buildCategoryMetadata(category, slug);
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [articles, { data: category }] = await Promise.all([
    getArticlesByCategory(slug),
    sanityFetch({ query: queryCategoryBySlug, params: { slug }, tags: ['category'] }),
  ]);

  return (
    <div className='mx-auto max-w-[95vw] md:max-w-[85vw]'>
      <div>
        <hr className='mb-8 border-untele' />
        {category && (
          <div className='mb-10 px-10'>
            <h1 className='mb-2 text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-white'>
              {category.title}
            </h1>
            {category.description && (
              <p className='max-w-2xl text-slate-600 dark:text-slate-400'>{category.description}</p>
            )}
          </div>
        )}
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
    const { data: articles } = await sanityFetch({
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
  // Use sanityClient directly to avoid draftMode() call during static generation
  const slugs: Category[] = await sanityClient.fetch(queryCategoryStaticParams);
  const slugRoutes = slugs ? slugs.map((slug) => slug.slug.current) : [];
  return slugRoutes.map((slug) => ({
    slug,
  }));
}
