/* eslint-disable react/function-component-definition */
import { sanityFetch } from '@/l/sanity.fetch';
import BlogItem from '@/components/BlogItem';

type Props = {
  query: string;
};

export default function PreviewBlogList({ query }: Props) {
  const posts = sanityFetch<number>({ query, tags: ['post'] });

  return <BlogItem posts={posts} />;
}
