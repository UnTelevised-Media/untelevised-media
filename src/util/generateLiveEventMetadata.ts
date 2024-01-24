/* eslint-disable import/prefer-default-export */
import { groq } from 'next-sanity';
import { client } from '@/l/sanity.client';
import urlForImage from '@/u/urlForImage';
// import type { Metadata } from 'next';

type Props = {
  params: {
    slug: string;
  };
};

// Define the generateMetadata function
export async function generateMetadata({ params: { slug } }: Props) {
  // Fetch the post data based on the slug
  const query = groq`
    *[_type == "liveEvent" && slug.current == $slug][0] {
      ...,
      tag[]->,
      keyEvent[]->,
      keywords,
      relatedArticles[]-> {
        slug,
        _id,
        title,
        _createdAt,
        description,
        eventDate,
      // Add other fields you want to retrieve from relatedArticles
    }
    }`;

  const liveEvent: Post = await client.fetch(query, { slug });

  // Create metadata object with dynamic values
  const metadata = {
    type: 'article',
    title: `${liveEvent.title} | Live Updates | UnTelevised Media`,
    description: liveEvent.description,
    keywords: liveEvent.keywords,
    publisher: 'UnTelevised Media',

    openGraph: {
      title: `${liveEvent.title} | Live Updates | UnTelevised Media`,
      description: liveEvent.description,
      url: `https://untelevised.media/live-event/${slug}`,
      //   siteName: 'UnTelevised Media',
      images: {
        url: urlForImage(liveEvent.mainImage).url(),
        //   width: 800,
        //   height: 600,
        // alt: post.mainImage.alt,
      },
      //   locale: 'en_US',
      //   type: 'article',
    },

    twitter: {
      //   card: 'app',
      title: `${liveEvent.title} | Live Updates | UnTelevised Media`,
      description: liveEvent.description,
      //   siteId: '1467726470533754880',
      creator: '@UnTelevisedLive',
      //   creatorId: '1467726470533754880',
      images: {
        url: urlForImage(liveEvent.mainImage).url(),
        // alt: liveEvent.mainImage.alt,
      },
    },

    // colorScheme: 'dark',
    // referrer: 'origin-when-cross-origin',
    // formatDetection: {
    //   email: false,
    //   address: false,
    //   telephone: false,
    // },
  };

  return metadata;
}
