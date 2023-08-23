/* eslint-disable react/function-component-definition */
import { sanityFetch } from '@/l/sanity.fetch';
import BlogList from '../BlogList';

type Props = {
    query: string;
};

export default function PreviewBlogList ({ query }: Props) {
    const posts = sanityFetch<number>({ query, tags: ['post'] });
    console.log("🚀 ~ file: PreviewBlogList.tsx ~~ posts:", posts);
    return <BlogList posts={posts} />;
};