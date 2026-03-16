type Base = {
  _createdAt: string;
  _id: string;
  _rev: string;
  _type: string;
  _updatedAt: string;
};

interface SeoOverride {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: Image;
  noIndex?: boolean;
  canonicalUrl?: string;
}

interface LiveEvent extends Base {
  body: Block[];
  eventDate: string;
  endDate?: string;
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed' | 'EventMovedOnline';
  relatedArticles: Article[];
  keyEvent: KeyEvent[];
  eventTag: EventTag[];
  title: string;
  videoLink: string;
  description: string;
  location: string;
  subtitle: string;
  keywords?: string[];
  slug: Slug;
  isCurrentEvent: boolean;
  mainImage: Image;
  seo?: SeoOverride;
}

interface KeyEvent extends Base {
  title: string;
  slug: Slug;
  eventDate: string;
  description: Block[];
}

interface Article extends Base {
  author: Author;
  body: Block[];
  categories: Category[];
  mainImage: Image;
  slug: Slug;
  title: string;
  keywords?: string[];
  description: string;
  location: string;
  videoLink: string;
  isCurrentEvent: boolean;
  hasEmbeddedVideo: string;
  hasEmbeddedTweet: boolean;
  eventDate: string;
  publishedAt: string;
  updatedAt?: string;
  leadParagraph?: string;
  corrections?: string;
  sources?: Array<{ label: string; url: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  reviewedBy?: Author;
  relatedArticles?: Array<{
    _id: string;
    title: string;
    slug: string;
    mainImage?: Image;
    description?: string;
    publishedAt: string;
    author?: { name: string };
  }>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: Image;
  };
  wordCount?: number;
  comments: Comment[];
}

interface Author extends Base {
  slug: Slug;
  name: string;
  title: string;
  order: number;
  website: string;
  twitter: string;
  instagram: string;
  facebook: string;
  youtube: string;
  linkedin: string;
  tiktok: string;
  email: string;
  bio: Block[];
  image: Image;
  relatedArticles: Article[];
  sameAs?: string[];
  expertise?: string[];
  credentials?: string[];
}

interface Image {
  _type: 'image';
  asset: Reference;
  alt?: string;
  [key: string]: any; // Allow additional properties for Sanity compatibility
}

interface Reference {
  _ref: string;
  _type: 'reference';
}

interface Slug {
  _type: 'slug';
  current: string;
}

interface Block extends React.ReactNode {
  _key: string;
  _type: 'block';
  children: Span[];
  markDefs: any[];
  style: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote';
}

interface Span {
  _key: string;
  _type: 'span';
  marks: string[];
  text: string;
}

interface Category extends Base {
  slug: Slug;
  description: string;
  title: string;
  order?: string;
  seo?: SeoOverride;
}

interface EventTag extends Base {
  description: string;
  title: string;
}

interface TimelineEvent extends Base {
  slug: Slug;
  title: string;
  description: string;
  detailedDescription: Block[];
  eventDate: string;
  endDate?: string;
  eventType:
    | 'breaking'
    | 'investigation'
    | 'live'
    | 'political'
    | 'social'
    | 'economic'
    | 'environmental'
    | 'technology'
    | 'cultural'
    | 'other';
  importanceLevel: 'critical' | 'high' | 'medium' | 'low';
  isMilestone: boolean;
  location?: string;
  mainImage?: Image;
  mediaAttachments?: Array<Image | { _type: 'video'; url: string; title: string }>;
  timelineCategories?: TimelineCategory[];
  tags?: string[];
  relatedArticles?: Article[];
  relatedLiveEvents?: LiveEvent[];
  relatedTimelineEvents?: TimelineEvent[];
  externalLinks?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  isPublished: boolean;
  publishedAt?: string;
  author?: Author;
  keywords?: string;
}

interface TimelineCategory extends Base {
  slug: Slug;
  title: string;
  description?: string;
  color: 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'pink' | 'teal' | 'gray';
  icon?: string;
  order: number;
  isActive: boolean;
  parentCategory?: TimelineCategory;
}

interface Timeline extends Base {
  slug: Slug;
  title: string;
  description: Block[];
  shortDescription?: string;
  coverImage?: Image;
  timelineType: 'event' | 'investigation' | 'breaking' | 'historical' | 'live' | 'custom';
  timeRange?: {
    startDate?: string;
    endDate?: string;
  };
  events?: TimelineEvent[];
  categories?: TimelineCategory[];
  tags?: string[];
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt?: string;
  author?: Author;
  collaborators?: Author[];
  viewSettings?: {
    defaultZoomLevel: 'year' | 'month' | 'week' | 'day' | 'hour';
    showMilestonesOnly: boolean;
    allowPublicComments: boolean;
  };
  seoSettings?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
}

interface MainImage {
  _type: 'string';
  asset: Reference;
}

interface Title {
  _type: 'string';
  current: string;
}

interface Comment {
  approved: boolean;
  comment: string;
  email: string;
  name: string;
  post: {
    _ref: string;
    _type: string;
  };
  _createdAt: string;
  _id: string;
  _rev: string;
  _type: string;
  _updatedAt: string;
}

interface Policy {
  title: string;
  slug: Slug;
  order: string;
  description: Block[];
}

// Music/Lyrics related interfaces
interface MusicArtist extends Base {
  slug: Slug;
  name: string;
  stageName?: string;
  bio?: Block[];
  image?: Image;
  genres?: string[];
  debutYear?: number;
  hometown?: string;
  recordLabel?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    spotify?: string;
    appleMusic?: string;
    soundcloud?: string;
    tiktok?: string;
  };
  isActive: boolean;
  isFeatured: boolean;
  seo?: SeoOverride;
}

interface Album extends Base {
  slug: Slug;
  title: string;
  artist: MusicArtist;
  featuredArtists?: MusicArtist[];
  albumArt: Image;
  releaseDate: string;
  albumType: 'studio' | 'ep' | 'single' | 'compilation' | 'live' | 'remix' | 'mixtape';
  genres?: string[];
  recordLabel?: string;
  producer?: string[];
  description?: Block[];
  totalTracks?: number;
  duration?: string;
  streamingLinks?: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
    soundcloud?: string;
    bandcamp?: string;
    amazonMusic?: string;
  };
  isExplicit: boolean;
  isFeatured: boolean;
  seo?: SeoOverride;
}

interface Song extends Base {
  slug: Slug;
  title: string;
  primaryArtist: MusicArtist;
  featuredArtists?: MusicArtist[];
  contributingArtists?: {
    artist: MusicArtist;
    role:
      | 'producer'
      | 'songwriter'
      | 'composer'
      | 'backing-vocals'
      | 'additional-vocals'
      | 'instrumentalist'
      | 'engineer'
      | 'mixer';
  }[];
  album?: Album;
  trackArt?: Image;
  trackNumber?: number;
  lyrics: string;
  lyricsStructure?: {
    sectionType:
      | 'verse'
      | 'chorus'
      | 'bridge'
      | 'pre-chorus'
      | 'outro'
      | 'intro'
      | 'hook'
      | 'refrain';
    content: string;
    order: number;
  }[];
  releaseDate: string;
  duration?: string;
  genres?: string[];
  recordLabel?: string;
  description?: Block[];
  streamingLinks?: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
    soundcloud?: string;
    bandcamp?: string;
    amazonMusic?: string;
  };
  isExplicit: boolean;
  isFeatured: boolean;
  keywords?: string;
  seo?: SeoOverride;
}

interface JobApplication extends Base {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  positionsOfInterest: string[];
  otherPosition?: string;
  socialMediaPlatforms: string[];
  portfolioWebsite?: string;
  youtubeChannel?: string;
  socialMediaLinks: Array<{ platform: string; url: string }>;
  experienceLevel: 'beginner' | 'some' | 'experienced' | 'expert';
  experienceDescription: string;
  workSamples: Array<{ title: string; url: string }>;
  availability: 'part-time' | 'full-time' | 'freelance' | 'volunteer' | 'flexible';
  additionalInfo?: string;
  applicationStatus: 'new' | 'review' | 'interview' | 'accepted' | 'declined' | 'hold';
  submittedAt: string;
  notes?: string;
}
