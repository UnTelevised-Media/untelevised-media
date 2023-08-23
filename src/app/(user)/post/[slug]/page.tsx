/* eslint-disable react/function-component-definition */
import { client } from '@/lib/sanity.client';
import { groq } from 'next-sanity';

type Props = {
  params: {
    slug: string;
  };
};
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

  const article: Post = await client.fetch(query, { slug });
  

  return <div>My Post: {slug}</div>}

  export default Article