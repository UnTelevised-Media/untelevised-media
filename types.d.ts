type Base = {
  _createdAt: string;
  _id: string;
  _rev: string;
  _type: string;
  _updatedAt: string;
};

interface LiveEvent extends Base {
  body: Block[];
  eventDate: string;
  relatedArticles: Article[];
  keyEvent: KeyEvent[];
  eventTag: EventTag[];
  title: string;
  videoLink: string;
  description: string;
  location: string;
  subtitle: string;
  keywords: string;
  slug: Slug;
  isCurrentEvent: boolean;
  mainImage: Image;
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
  keywords: string;
  description: string;
  location: string;
  videoLink: string;
  isCurrentEvent: boolean;
  hasEmbeddedVideo: string;
  hasEmbeddedTweet: boolean;
  eventDate: string;
  publishedAt: string;
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
}

interface Image {
  _type: 'image';
  asset: Reference;
  alt: string;
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
}

interface EventTag extends Base {
  description: string;
  title: string;
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
