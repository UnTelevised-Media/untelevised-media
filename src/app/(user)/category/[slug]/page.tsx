/* eslint-disable react/function-component-definition */
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import ArticleCardLg from '@/components/cards/ArticleCardLg';

type Props = {
  params: {
    slug: string;
  };
};

const queryPost = groq`
  *[_type == 'post' && references(categories, *[_type == 'category' && slug.current == $slug]._id)] {
    ...,
    author->,
    categories[]->,
    description,
    publistedAt,
  } | order(_createdAt desc)
`;

export const revalidate = 180;

export async function generateStaticParams() {
  const query = groq`*[_type=='category']
  {
    slug
  }`;

  const slugs: Post[] = await client.fetch(query);
  const slugRoutes = slugs ? slugs.map((slug) => slug.slug.current) : [];

  return slugRoutes.map((slug) => ({
    slug,
  }));
}

export default async function CategoryPage({ params: { slug } }: Props) {


  const posts = await client.fetch(queryPost, { slug });

  return (
    <div className='mx-auto max-w-[95wv] md:max-w-[85vw]'>
      <ArticleCardLg posts={posts} />
    </div>
  );
}
