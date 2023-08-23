/* eslint-disable react/function-component-definition */
import { client } from '@/l/sanity.client';
import urlForImage from '@/u/urlForImage';
import { groq } from 'next-sanity';
import Image from 'next/image';

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

  const post: Post = await client.fetch(query, { slug });
  

  return <article>
    <section>
      <div>
        <div>
          <Image 
            className=''
            src={urlForImage(post.mainImage).url()}
            fill
            alt=''
          />
        </div>
      </div>
    </section>
    </article>}

  export default Article