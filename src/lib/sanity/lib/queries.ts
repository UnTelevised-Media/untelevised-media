// src/lib/sanity/lib/queries.ts
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
        publishedAt,
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
        publishedAt,
      }
    }`;

export const queryAllArticles = groq`
  *[_type=='article'] {
    ...,
    author->,
    categories[]->,
    description,
    publishedAt,
  }
  | order(_createdAt desc)
`;

export const queryArticleBySlug = groq`
    *[_type == 'article' && slug.current == $slug][0] {
      ...,
      author->,
      categories[]->,
      'comments': *[
        _type == 'comment' &&
        article._ref == ^._id &&
        approved == true
      ],
    }`;

export const queryArticleByCategory = groq`
  *[_type == 'article' && references(categories, *[_type == 'category' && slug.current == $slug]._id)] {
    ...,
    author->,
    categories[]->,
    description,
    publishedAt,
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
    'relatedArticles': *[_type == 'article' && references(^._id)]| order(_createdAt desc) {
      ...,
      author->,
      categories[]->,
      publishedAt,
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
