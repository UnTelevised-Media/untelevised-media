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

// Music/Lyrics Queries
export const queryAllSongs = groq`
  *[_type=='song'] {
    ...,
    primaryArtist->,
    featuredArtists[]->,
    contributingArtists[]{
      artist->,
      role
    },
    album->{
      ...,
      artist->
    },
    trackArt
  }
  | order(_createdAt desc)
`;

export const querySongBySlug = groq`
  *[_type == "song" && slug.current == $slug][0] {
    ...,
    primaryArtist->,
    featuredArtists[]->,
    contributingArtists[]{
      artist->,
      role
    },
    album->{
      ...,
      artist->,
      featuredArtists[]->
    },
    trackArt
  }
`;

export const queryFeaturedSongs = groq`
  *[_type=='song' && isFeatured == true] {
    ...,
    primaryArtist->,
    featuredArtists[]->,
    album->{
      title,
      albumArt
    },
    trackArt
  }
  | order(_createdAt desc)
  [0...6]
`;

export const queryAllMusicArtists = groq`
  *[_type=='musicArtist'] {
    ...,
  }
  | order(name asc)
`;

export const queryMusicArtistBySlug = groq`
  *[_type == "musicArtist" && slug.current == $slug][0] {
    ...,
    "songs": *[_type == "song" && (primaryArtist._ref == ^._id || ^._id in featuredArtists[]._ref)] {
      ...,
      primaryArtist->,
      featuredArtists[]->,
      album->{
        title,
        albumArt,
        releaseDate
      },
      trackArt
    } | order(releaseDate desc),
    "albums": *[_type == "album" && (artist._ref == ^._id || ^._id in featuredArtists[]._ref)] {
      ...,
      artist->,
      featuredArtists[]->
    } | order(releaseDate desc)
  }
`;

export const queryFeaturedMusicArtists = groq`
  *[_type=='musicArtist' && isFeatured == true] {
    ...,
    "songCount": count(*[_type == "song" && (primaryArtist._ref == ^._id || ^._id in featuredArtists[]._ref)])
  }
  | order(name asc)
  [0...8]
`;

export const queryAllAlbums = groq`
  *[_type=='album'] {
    ...,
    artist->,
    featuredArtists[]->,
  }
  | order(releaseDate desc)
`;

export const queryAlbumBySlug = groq`
  *[_type == "album" && slug.current == $slug][0] {
    ...,
    artist->,
    featuredArtists[]->,
    "songs": *[_type == "song" && album._ref == ^._id] {
      ...,
      primaryArtist->,
      featuredArtists[]->,
      trackArt
    } | order(trackNumber asc)
  }
`;

export const queryFeaturedAlbums = groq`
  *[_type=='album' && isFeatured == true] {
    ...,
    artist->,
    featuredArtists[]->
  }
  | order(releaseDate desc)
  [0...6]
`;

export const querySongsByArtist = groq`
  *[_type == "song" && (primaryArtist._ref == $artistId || $artistId in featuredArtists[]._ref)] {
    ...,
    primaryArtist->,
    featuredArtists[]->,
    album->{
      title,
      albumArt,
      releaseDate
    },
    trackArt
  }
  | order(releaseDate desc)
`;

export const queryRecentSongs = groq`
  *[_type=='song'] {
    ...,
    primaryArtist->,
    featuredArtists[]->,
    album->{
      title,
      albumArt
    },
    trackArt
  }
  | order(releaseDate desc)
  [0...10]
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
