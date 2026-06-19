/**
 * Portable Text (Sanity) block type definitions
 * These types define the structure of all custom block types rendered by RichTextComponents
 */

// Generic Sanity types exported for use across the app
export interface SanityAsset {
  _ref: string;
  _type: 'reference';
}

export interface SanityImageAssetReference {
  _ref: string;
  _type: 'reference';
}

export interface Image {
  _type: 'image';
  asset?: SanityImageAssetReference;
  alt?: string;
  crop?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  hotspot?: {
    x?: number;
    y?: number;
    height?: number;
    width?: number;
  };
  [key: string]: any;
}

export interface PortableImageBlock {
  _type: 'image';
  _key: string;
  asset?: SanityImageAssetReference;
  alt?: string;
  crop?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  hotspot?: {
    x?: number;
    y?: number;
    height?: number;
    width?: number;
  };
}

export interface PortableCodeBlock {
  _type: 'code';
  _key: string;
  code: string;
  language?: string;
}

export interface PortableMermaidDiagramBlock {
  _type: 'mermaidDiagram';
  _key: string;
  code: string;
}

export interface PortableTableRow {
  _key: string;
  cells: string[] | PortableTableCell[];
}

export interface PortableTableCell {
  _key: string;
  _type: 'object';
  content: Array<{
    _type: 'block';
    _key: string;
    children: Array<{
      _type: 'span';
      _key: string;
      text: string;
      marks?: string[];
    }>;
  }>;
}

export interface PortableTableBlock {
  _type: 'table';
  _key: string;
  rows: PortableTableRow[];
}

export interface PortableListBlock {
  _type: 'list';
  _key: string;
  listItem?: 'number' | 'bullet';
  style?: 'number' | 'bullet';
  children: Array<{
    _type: 'block';
    _key: string;
    children: Array<{
      _type: 'span';
      _key: string;
      text: string;
      marks?: string[];
    }>;
  }>;
}

export interface PortableBlockquoteBlock {
  _type: 'blockquote';
  _key: string;
  children: Array<{
    _type: 'block';
    _key: string;
    children: Array<{
      _type: 'span';
      _key: string;
      text: string;
      marks?: string[];
    }>;
  }>;
}

export interface PortableYoutubeEmbedBlock {
  _type: 'youtubeEmbed';
  _key: string;
  videoId: string;
}

export interface PortableTwitterEmbedBlock {
  _type: 'twitterEmbed';
  _key: string;
  tweetId: string;
}

export interface PortableInstagramEmbedBlock {
  _type: 'instagramEmbed';
  _key: string;
  postId: string;
}

export interface PortableFacebookEmbedBlock {
  _type: 'facebookEmbed';
  _key: string;
  postUrl: string;
}

export interface PortableTiktokEmbedBlock {
  _type: 'tiktokEmbed';
  _key: string;
  videoUrl: string;
}

export interface PortableVimeoEmbedBlock {
  _type: 'vimeoEmbed';
  _key: string;
  videoId: string;
}

export interface PortableIframeEmbedBlock {
  _type: 'iframeEmbed';
  _key: string;
  src: string;
  width?: number;
  height?: number;
  title?: string;
}

export interface PortableFactCheckEmbedBlock {
  _type: 'factCheckEmbed';
  _key: string;
  factCheck: {
    _ref: string;
    _type: 'reference';
    title?: string;
    rating?: 'true' | 'mostly-true' | 'misleading' | 'mostly-false' | 'false' | 'unverifiable';
  };
}

export type PortableTextBlock =
  | PortableImageBlock
  | PortableCodeBlock
  | PortableMermaidDiagramBlock
  | PortableTableBlock
  | PortableListBlock
  | PortableBlockquoteBlock
  | PortableYoutubeEmbedBlock
  | PortableTwitterEmbedBlock
  | PortableInstagramEmbedBlock
  | PortableFacebookEmbedBlock
  | PortableTiktokEmbedBlock
  | PortableVimeoEmbedBlock
  | PortableIframeEmbedBlock
  | PortableFactCheckEmbedBlock;

export interface PortableTextListRenderer {
  children: React.ReactNode;
}

export interface PortableTextBlockStyleRenderer {
  children: React.ReactNode;
}

export interface PortableTextMarkRenderer {
  children: React.ReactNode;
  value?: {
    href?: string;
    [key: string]: unknown;
  };
}

// Generic block type for arrays of portable text content
export type Block = PortableTextBlock | any;

/**
 * Sanity References Type Helper
 *
 * Sanity GROQ queries can return relationships as either:
 * 1. Unpopulated references: { _ref: string, _type: string }
 * 2. Populated objects: { _ref?: string, _type?: string, ...properties }
 *
 * When a property accesses a field on a reference (e.g., artist.name),
 * it's safe to use `any` casting because:
 * - The GROQ query determines whether the reference is populated
 * - We trust the query implementation to return the expected shape
 * - Adding full type unions would duplicate Sanity schema definitions
 */
export type SanityPopulatedReference<T = any> = T & {
  _ref?: string;
  _type?: string;
  _id?: string;
  _key?: string;
};
