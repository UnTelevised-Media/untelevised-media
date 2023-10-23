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
  description: string;
  subtitle: string;
  keywords: string;
  slug: Slug;
  isCurrentEvent: boolean;
}

interface KeyEvent extends Base {
  title: string;
  slug: Slug;
  date: string; // Assuming date is a string representing date and time
  description: string;
  eventTag: EventTag[];
}

interface Post extends Base {
  author: Author;
  body: Block[];
  categories: Category[];
  mainImage: Image;
  slug: Slug;
  title: string;
  keywords: string;
  description: string;
  comments: Comment[];
}

interface Author extends Base {
  bio: Block[];
  image: Image;
  name: string;
  slug: Slug;
}

interface Image {
  _type: 'image';
  asset: Reference;
}

interface Reference {
  _ref: string;
  _type: 'reference';
}

interface Slug {
  _type: 'slug';
  current: string;
}

interface Block {
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
  description: string;
  title: string;
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


