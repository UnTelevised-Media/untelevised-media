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
      keyEvent[]-> {
        ...,
        sources[]-> { label, type, url, description, isAnonymous },
      },
      sources[]-> { label, type, url, description, isAnonymous },
      methodology,
      "correction": correction { type, issuedAt, summary, detail },
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
  *[_type=='article' && status == 'published'] {
    ...,
    author->,
    categories[]->,
    description,
    publishedAt,
    tags,
    "correction": correction { type, summary },
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
    *[_type == 'article' && slug.current == $slug && status == 'published'][0] {
      ...,
      author->,
      categories[]->,
      reviewedBy->{ name, slug, title, image },
      seo,
      faqs,
      sources[]-> { label, type, url, description, isAnonymous },
      methodology,
      "correction": correction { type, issuedAt, summary, detail },
      updatedAt,
      leadParagraph,
      body[]{
        ...,
        _type == "factCheckEmbed" => {
          ...,
          factCheck-> {
            _id,
            title,
            slug,
            claim,
            rating,
            ratingExplanation,
            claimSource
          }
        }
      },
      relatedArticles[]-> {
        _id,
        title,
        "slug": slug.current,
        mainImage,
        description,
        publishedAt,
        author-> { name }
      },
      "allowComments": coalesce(allowComments, true),
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
  *[_type == 'article' && status == 'published' && references(categories, *[_type == 'category' && slug.current == $slug]._id)] {
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
    'relatedArticles': *[_type == 'article' && status == 'published' && references(^._id)]| order(_createdAt desc) {
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

export const queryRSSFeed = groq`
  *[_type == "article" && status == 'published'] | order(publishedAt desc) [0...50] {
    _id,
    title,
    "slug": slug.current,
    description,
    publishedAt,
    _updatedAt,
    mainImage {
      asset->,
      alt
    },
    "author": author-> {
      name
    },
    "category": categories[0]-> {
      title
    }
  }
`;

// ! TODO: When live events are renamed to "breaking", update:
// !   - _type filter: 'liveEvent' → 'breaking'
// !   - query name: queryRSSLiveEvents → queryRSSBreakingEvents
export const queryRSSLiveEvents = groq`
  *[_type == "liveEvent"] | order(eventDate desc) [0...20] {
    _id,
    title,
    "slug": slug.current,
    description,
    subtitle,
    eventDate,
    _updatedAt,
    eventStatus,
    mainImage {
      asset->,
      alt
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

export const querySiteSettings = groq`
  *[_type == "siteSettings"][0] {
    name,
    description,
    logo { asset-> },
    "breakingBanner": breakingNewsBanner {
      isActive,
      headline,
      linkUrl,
      linkLabel,
      expiresAt
    }
  }
`;

// ─── Careers ────────────────────────────────────────────────────────────────

/**
 * Active job listings — excludes inactive and expired (past closingDate).
 * Accepts { today: "YYYY-MM-DD" } param.
 */
export const queryActiveJobListings = groq`
  *[
    _type == "jobListing"
    && isActive == true
    && (
      !defined(closingDate)
      || closingDate >= $today
    )
  ] | order(department asc) {
    _id,
    title,
    slug,
    department,
    type,
    location,
    compensation,
    description,
    requirements,
    closingDate
  }
`;

export const queryJobApplications = groq`
  *[_type == "jobApplication"] | order(submittedAt desc) {
    _id,
    firstName,
    lastName,
    email,
    phone,
    location,
    positionsOfInterest,
    otherPosition,
    experienceLevel,
    experienceDescription,
    availability,
    applicationStatus,
    submittedAt,
    notes,
    portfolioWebsite,
    youtubeChannel,
    socialMediaPlatforms,
    socialMediaLinks,
    workSamples,
    additionalInfo
  }
`;

// ── Fact-Check Queries ──────────────────────────────────────────────────────

export const queryAllFactChecks = groq`
  *[_type == 'factCheck'] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    claim,
    claimSource,
    rating,
    ratingExplanation,
    author-> { name, slug }
  }
`;

export const queryFactCheckBySlug = groq`
  *[_type == 'factCheck' && slug.current == $slug][0] {
    _id,
    title,
    slug,
    publishedAt,
    claim,
    claimSource,
    claimUrl,
    claimDate,
    rating,
    ratingExplanation,
    body[]{
      ...,
      _type == "factCheckEmbed" => {
        ...,
        factCheck-> {
          _id,
          title,
          slug,
          claim,
          rating,
          ratingExplanation,
          claimSource
        }
      }
    },
    sources[] { label, url },
    author-> { name, slug, image },
    relatedArticles[]-> {
      _id, title, slug, mainImage, publishedAt, description
    }
  }
`;

// ── Tag Queries ──────────────────────────────────────────────────────────────

export const queryAllTags = groq`
  array::unique(*[_type == "article" && status == 'published' && defined(tags) && count(tags) > 0].tags[])
`;

export const queryArticlesByTag = groq`
  *[_type == "article" && status == 'published' && defined(tags) && $tag in tags[]] | order(publishedAt desc) {
    _id,
    title,
    slug,
    description,
    publishedAt,
    mainImage { asset, alt },
    "author": author->{ name, slug, image { asset } },
    "categories": categories[]->{ _id, title, slug },
    "correction": correction { type, summary },
    tags
  }
`;
