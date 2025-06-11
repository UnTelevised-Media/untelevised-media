 
import { groq } from 'next-sanity';

export const queryLiveEvents = groq`
  *[_type=='liveEvent' && isCurrentEvent == true] {
   ...,
    description,
    title,
    slug,
    eventDate,
    keyEvent[]->,
      relatedArticles[]-> {
        slug,
        _id,
        title,
        _createdAt,
        description,
        eventDate,
    }
  } 
  | order(_createdAt desc)
`;

export const queryEventBySlug = groq`
    *[_type == "liveEvent" && slug.current == $slug][0] {
      ...,
      tag[]->,
      keyEvent[]->,
      relatedArticles[]-> {
        slug,
        _id,
        title,
        _createdAt,
        description,
        eventDate,
      }
    }`;

export const queryAllPost = groq`
  *[_type=='post'] {
    ...,
    author->,
    categories[]->,
    description,
    publistedAt,
  } 
  | order(_createdAt desc)
`;

export const queryArticleBySlug = groq`
    *[_type == 'post' && slug.current == $slug][0] {
      ...,
      author->,
      categories[]->,
      'comments': *[
        _type == 'comment' &&
        post._ref == ^._id &&
        approved == true
      ],
    }`;

export const queryArticleByCategory = groq`
  *[_type == 'post' && references(categories, *[_type == 'category' && slug.current == $slug]._id)] {
    ...,
    author->,
    categories[]->,
    description,
    publistedAt,
  } | order(_createdAt desc)
`;

export const queryCategories = groq`
  *[_type == "category"] {
    _id,
    title,
    order
  }  
`;

export const queryAllAuthors = groq`
  *[_type == "author" ] {
    ...,
    author-> {
      name,
      image,
      title,
    },
  } 
  | order(author.order desc)
  `;
export const queryAuthorBySlug = groq`
  *[_type == 'author' && slug.current == $slug][0] {
    ...,
    'relatedArticles': *[_type == 'post' && references(^._id)]| order(_createdAt desc) {
      ...,
      author->,
      categories[]->,
    }
  }
`;

export const queryPoliciesList = groq`
  *[_type == "policies"] {
    _id,
    title,
    order
  }  
`;

export const queryPolicyBySlug = groq`
    *[_type == "policies" && slug.current == $slug][0] {
      ...,
      policies-> {
        title,
        lastUpdated,
        description,
      },
    }`;