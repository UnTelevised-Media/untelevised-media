/**
 * Component Prop Types - Category 2 Proper Typing
 *
 * This file defines proper TypeScript interfaces for all component props that were
 * previously typed as `any`. These types reduce ESLint warnings while improving
 * type safety and developer experience with better IDE autocompletion.
 *
 * Organization:
 * - Card Components (ArticleCard, LiveWidget, etc.)
 * - Grid & Feed Components (ArticleGrid, RawFeed, TrendingSection)
 * - Form Components (ArticleEditorForm, RichTextEditor, SourceForm)
 * - SEO/Schema Components (NewsArticleStructuredData, StructuredData)
 * - Search Components (SearchClient, HeaderSearch)
 * - Timeline Components (TimelineCard, TimelineFilters, etc.)
 */

import type { Article, TimelineEvent, LiveEvent } from './sanity';
import type { PortableTextBlock } from './portableText';

// ============================================================================
// CARD COMPONENTS
// ============================================================================

export interface ArticleCardProps {
  article: Pick<
    Article,
    'title' | 'description' | 'mainImage' | 'slug' | 'publishedAt' | 'author'
  >;
}

export interface LiveWidgetProps {
  liveEvent: Pick<
    LiveEvent,
    '_id' | 'title' | 'description' | 'eventDate' | 'endDate' | 'isCurrentEvent'
  >;
}

// ============================================================================
// GRID & FEED COMPONENTS
// ============================================================================

export type FeedItem =
  | Pick<Article, 'title' | 'description' | 'mainImage' | 'slug' | 'publishedAt'>
  | Pick<TimelineEvent, 'title' | 'description' | 'eventDate' | 'slug'>
  | Pick<LiveEvent, 'title' | 'description' | 'eventDate' | 'isCurrentEvent'>;

export interface ArticleGridProps {
  articles: ArticleCardProps['article'][];
}

export interface RawFeedProps {
  articles: FeedItem[];
}

export interface TrendingResult {
  slug: string;
  title: string;
  viewCount: number;
}

export interface TrendingSectionProps {
  articles: TrendingResult[];
}

// ============================================================================
// FORM COMPONENTS
// ============================================================================

export interface ArticleFormData {
  title: string;
  description: string;
  body: PortableTextBlock[];
  mainImage?: {
    asset?: {
      _ref: string;
    };
    alt?: string;
  };
  publishedAt?: string;
  author?: {
    _ref: string;
  };
  tags?: string[];
  categories?: Array<{
    _ref: string;
  }>;
}

export interface SourceFormData {
  title: string;
  url: string;
  author?: string;
  publishedDate?: string;
}

export interface PortableTextEditorContent {
  blocks: PortableTextBlock[];
  isEditing: boolean;
}

// ============================================================================
// SEO & SCHEMA COMPONENTS
// ============================================================================

export interface StructuredArticleData {
  _id: string;
  title: string;
  description?: string;
  mainImage?: {
    asset?: {
      _ref: string;
      url?: string;
    };
  };
  author?: {
    name: string;
    image?: {
      asset?: {
        _ref: string;
        url?: string;
      };
    };
  };
  publishedAt: string;
  updatedAt?: string;
}

export interface StructuredAuthorData {
  name: string;
  url?: string;
  image?: {
    url?: string;
  };
}

export interface StructuredPersonData {
  '@type': 'Person';
  name: string;
  url?: string;
  image?: string;
}

export interface StructuredOrganizationData {
  '@type': 'Organization';
  name: string;
  url?: string;
  logo?: string;
}

export type SchemaObject<T> = T & {
  '@context'?: string;
  '@type'?: string;
};

// ============================================================================
// SEARCH COMPONENTS
// ============================================================================

export interface SearchResult {
  _id: string;
  title: string;
  description?: string;
  slug?: {
    current: string;
  };
  type: 'article' | 'author' | 'event' | 'timeline';
  score?: number;
}

export interface SearchFilters {
  query: string;
  type?: 'all' | 'article' | 'author' | 'event';
  limit?: number;
}

// ============================================================================
// TIMELINE COMPONENTS
// ============================================================================

export interface TimelineCardData {
  _id: string;
  title: string;
  description?: string;
  date: string;
  category?: {
    title: string;
    slug: {
      current: string;
    };
  };
  featured?: boolean;
  featuredImage?: {
    asset?: {
      _ref: string;
      url?: string;
    };
  };
}

export interface TimelineEventDetails {
  _id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  body?: PortableTextBlock[];
  category?: {
    _id: string;
    title: string;
  };
}

export interface FilterOption<T> {
  label: string;
  value: T;
  count?: number;
}

export interface TimelineJSData {
  title?: {
    media?: {
      url?: string;
    };
    text?: {
      headline?: string;
    };
  };
  events: Array<{
    media?: {
      url?: string;
      caption?: string;
    };
    start_date?: {
      year?: number;
      month?: number;
      day?: number;
    };
    text?: {
      headline?: string;
      text?: string;
    };
  }>;
}

export interface TimelineOverviewData {
  totalEvents: number;
  dateRange: {
    start: string;
    end: string;
  };
  categories: Array<{
    id: string;
    name: string;
    count: number;
  }>;
}

export interface TimelineVisualizationData {
  events: TimelineCardData[];
  layout: 'vertical' | 'horizontal';
  scale?: 'year' | 'month' | 'day';
}

// ============================================================================
// PAGE COMPONENT TYPES
// ============================================================================

export interface PastEventsPageProps {
  events: TimelineCardData[];
}

export interface ArticleShowcaseProps {
  featured: ArticleCardProps['article'];
  secondary?: ArticleCardProps['article'][];
}

// ============================================================================
// BREAKING NEWS COMPONENTS
// ============================================================================

export interface BreakingNewsData {
  _id: string;
  title: string;
  description?: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  isBreaking: boolean;
  image?: {
    asset?: {
      _ref: string;
      url?: string;
    };
  };
}
