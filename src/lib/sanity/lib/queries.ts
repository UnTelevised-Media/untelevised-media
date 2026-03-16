// src/lib/sanity/lib/queries.ts
import { groq } from 'next-sanity';

export const queryLiveEvents = groq`
  *[_type=='liveEvent' && isCurrentEvent == true] {
    ...,
    description,
    title,
    slug,
    eventDate,
    endDate,
    eventStatus,
    mainImage,
    subtitle,
    videoLink,
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

export const queryPastEvents = groq`
  *[_type=='liveEvent' && isCurrentEvent == false] {
    ...,
    description,
    title,
    slug,
    eventDate,
    mainImage,
    subtitle,
    location,
    videoLink,
    keywords,
    eventTag[]->,
    keyEvent[]->{
      title,
      slug,
      eventDate,
      description
    },
    relatedArticles[]-> {
      slug,
      _id,
      title,
      _createdAt,
      description,
      eventDate,
      publishedAt,
      mainImage
    }
  }
  | order(eventDate desc)
`;

export const queryPastEventsWithPagination = groq`
  *[_type=='liveEvent' && isCurrentEvent == false] {
    ...,
    description,
    title,
    slug,
    eventDate,
    mainImage,
    subtitle,
    location,
    videoLink,
    keywords,
    eventTag[]->,
    keyEvent[]->{
      title,
      slug,
      eventDate,
      description
    },
    relatedArticles[]-> {
      slug,
      _id,
      title,
      _createdAt,
      description,
      eventDate,
      publishedAt,
      mainImage
    }
  }
  | order(eventDate desc)
  [$start...$end]
`;

export const queryEventBySlug = groq`
    *[_type == "liveEvent" && slug.current == $slug][0] {
      ...,
      eventTag[]->,
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
    "wordCount": length(string::split(
      pt::text(body) + " " +
      string::join(coalesce(faqs[].question, []), " ") + " " +
      string::join(coalesce(faqs[].answer, []), " ") + " " +
      string::join(coalesce(sources[].label, []), " "),
      " "
    )),
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
      reviewedBy->{ name, slug, title, image },
      seo,
      faqs,
      sources,
      corrections,
      updatedAt,
      leadParagraph,
      relatedArticles[]-> {
        _id,
        title,
        "slug": slug.current,
        mainImage,
        description,
        publishedAt,
        author-> { name }
      },
      'comments': *[
        _type == 'comment' &&
        article._ref == ^._id &&
        approved == true
      ],
    }`;

export const queryCategoryBySlug = groq`
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    description,
    "slug": slug.current,
    seo,
  }
`;

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
  *[_type == "author"] {
    ...,
  }
  | order(order desc)
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

// Timeline Queries
export const queryAllTimelines = groq`
  *[_type=='timeline' && isPublished == true] {
    ...,
    author->,
    collaborators[]->,
    categories[]->,
    'eventCount': count(events),
  }
  | order(publishedAt desc)
`;

export const queryFeaturedTimelines = groq`
  *[_type=='timeline' && isPublished == true && isFeatured == true] {
    ...,
    author->,
    categories[]->,
    'eventCount': count(events),
  }
  | order(publishedAt desc)
  [0...6]
`;

export const queryTimelineBySlug = groq`
  *[_type == "timeline" && slug.current == $slug][0] {
    ...,
    author->,
    collaborators[]->,
    categories[]->,
    events[]->{
      ...,
      author->,
      timelineCategories[]->,
      relatedArticles[]->{
        slug,
        title,
        _id,
        publishedAt,
        mainImage
      },
      relatedLiveEvents[]->{
        slug,
        title,
        _id,
        eventDate,
        mainImage
      }
    }
  }
`;

export const queryTimelineEvents = groq`
  *[_type=='timelineEvent' && isPublished == true] {
    ...,
    author->,
    timelineCategories[]->,
  }
  | order(eventDate desc)
`;

export const queryTimelineEventsByDateRange = groq`
  *[_type=='timelineEvent' && isPublished == true && eventDate >= $startDate && eventDate <= $endDate] {
    ...,
    author->,
    timelineCategories[]->,
  }
  | order(eventDate asc)
`;

export const queryTimelineEventsByCategory = groq`
  *[_type=='timelineEvent' && isPublished == true && references($categoryId)] {
    ...,
    author->,
    timelineCategories[]->,
  }
  | order(eventDate desc)
`;

export const queryTimelinesByCategory = groq`
  *[_type=='timeline' && isPublished == true && references($categoryId)] {
    ...,
    author->,
    collaborators[]->,
    categories[]->,
    'eventCount': count(events),
  }
  | order(publishedAt desc)
`;

export const queryMilestoneEvents = groq`
  *[_type=='timelineEvent' && isPublished == true && isMilestone == true] {
    ...,
    author->,
    timelineCategories[]->,
  }
  | order(eventDate desc)
`;

export const queryTimelineEventBySlug = groq`
  *[_type == "timelineEvent" && slug.current == $slug][0] {
    ...,
    author->,
    timelineCategories[]->,
    relatedArticles[]->{
      slug,
      title,
      _id,
      publishedAt,
      mainImage,
      description,
      author->
    },
    relatedLiveEvents[]->{
      slug,
      title,
      _id,
      eventDate,
      mainImage,
      description
    },
    relatedTimelineEvents[]->{
      slug,
      title,
      _id,
      eventDate,
      eventType,
      importanceLevel,
      mainImage
    }
  }
`;

export const queryTimelineCategories = groq`
  *[_type == "timelineCategory" && isActive == true] {
    ...,
    parentCategory->,
    'eventCount': count(*[_type == 'timelineEvent' && references(^._id)])
  }
  | order(order asc)
`;

export const queryRecentTimelineEvents = groq`
  *[_type=='timelineEvent' && isPublished == true] {
    ...,
    author->,
    timelineCategories[]->,
  }
  | order(eventDate desc)
  [0...10]
`;

export const queryTimelineEventsByImportance = groq`
  *[_type=='timelineEvent' && isPublished == true && importanceLevel == $importance] {
    ...,
    author->,
    timelineCategories[]->,
  }
  | order(eventDate desc)
`;

export const queryTimelineSearch = groq`
  *[_type=='timelineEvent' && isPublished == true && (
    title match $searchTerm + "*" ||
    description match $searchTerm + "*" ||
    location match $searchTerm + "*" ||
    tags[] match $searchTerm + "*"
  )] {
    ...,
    author->,
    timelineCategories[]->,
  }
  | order(eventDate desc)
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
