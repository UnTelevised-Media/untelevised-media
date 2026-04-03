// src/lib/portal/portable-text-serializer.ts
// Bidirectional serializer between Tiptap JSON (ProseMirror) and
// Sanity Portable Text (blockContent). This is a custom implementation
// that covers the exact marks/nodes defined in blockContent.ts.
//
// Tiptap JSON → Portable Text (for writes to Sanity)
// Portable Text → Tiptap JSON (for pre-populating the editor from Sanity)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

// Sanity block content types
export interface SanityBlock {
  _type: 'block';
  _key: string;
  style: string;
  children: SanitySpan[];
  markDefs: SanityMarkDef[];
  listItem?: 'bullet' | 'number';
  level?: number;
}

export interface SanitySpan {
  _type: 'span';
  _key: string;
  text: string;
  marks: string[];
}

export interface SanityMarkDef {
  _type: string;
  _key: string;
  [key: string]: unknown;
}

export interface SanityImage {
  _type: 'image';
  _key: string;
  asset: { _type: 'reference'; _ref: string };
  alt?: string;
}

export type SanityBlock_Any = SanityBlock | SanityImage | Record<string, unknown>;

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

let _keyCounter = 0;
function genKey(): string {
  return `key${++_keyCounter}${Math.random().toString(36).slice(2, 6)}`;
}

// ---------------------------------------------------------------------------
// Tiptap JSON → Portable Text
// ---------------------------------------------------------------------------

export function tiptapToPortableText(doc: TiptapNode): SanityBlock_Any[] {
  if (!doc || doc.type !== 'doc' || !doc.content) return [];
  const blocks: SanityBlock_Any[] = [];

  for (const node of doc.content) {
    const block = nodeToBlock(node);
    if (Array.isArray(block)) blocks.push(...block);
    else if (block) blocks.push(block);
  }
  return blocks;
}

function nodeToBlock(node: TiptapNode): SanityBlock_Any | SanityBlock_Any[] | null {
  switch (node.type) {
    case 'paragraph':
      return blockFromInline(node, 'normal');
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1;
      return blockFromInline(node, `h${level}`);
    }
    case 'blockquote': {
      // blockquote wraps paragraph — unwrap and set style
      const inner = node.content?.[0];
      if (inner) return blockFromInline(inner, 'blockquote');
      return blockFromInline(node, 'blockquote');
    }
    case 'bulletList': {
      const items: SanityBlock[] = [];
      for (const item of node.content ?? []) {
        const inner = item.content?.[0];
        if (inner) {
          const b = blockFromInline(inner, 'normal') as SanityBlock;
          b.listItem = 'bullet';
          b.level = 1;
          items.push(b);
        }
      }
      return items;
    }
    case 'orderedList': {
      const items: SanityBlock[] = [];
      for (const item of node.content ?? []) {
        const inner = item.content?.[0];
        if (inner) {
          const b = blockFromInline(inner, 'normal') as SanityBlock;
          b.listItem = 'number';
          b.level = 1;
          items.push(b);
        }
      }
      return items;
    }
    case 'codeBlock':
      return {
        _type: 'code',
        _key: genKey(),
        language: (node.attrs?.language as string) ?? 'text',
        code: node.content?.[0]?.text ?? '',
      };
    case 'horizontalRule':
      return { _type: 'break', _key: genKey() };
    case 'image':
      return {
        _type: 'image',
        _key: genKey(),
        asset: { _type: 'reference', _ref: (node.attrs?.src as string) ?? '' },
        alt: (node.attrs?.alt as string) ?? '',
      };
    case 'passthroughBlock': {
      // Restore the original Sanity block exactly as it was stored.
      try {
        return JSON.parse((node.attrs?.blockData as string) ?? '{}') as SanityBlock_Any;
      } catch {
        return null;
      }
    }
    default:
      return null;
  }
}

function blockFromInline(node: TiptapNode, style: string): SanityBlock {
  const markDefs: SanityMarkDef[] = [];
  const children = inlineToSpans(node.content ?? [], markDefs);
  if (children.length === 0) {
    children.push({ _type: 'span', _key: genKey(), text: '', marks: [] });
  }
  return { _type: 'block', _key: genKey(), style, children, markDefs };
}

function inlineToSpans(nodes: TiptapNode[], markDefs: SanityMarkDef[]): SanitySpan[] {
  const spans: SanitySpan[] = [];
  for (const node of nodes) {
    if (node.type === 'text') {
      const marks: string[] = [];
      for (const mark of node.marks ?? []) {
        const m = markToPortableText(mark, markDefs);
        if (m) marks.push(m);
      }
      spans.push({ _type: 'span', _key: genKey(), text: node.text ?? '', marks });
    } else if (node.type === 'hardBreak') {
      spans.push({ _type: 'span', _key: genKey(), text: '\n', marks: [] });
    }
  }
  return spans;
}

function markToPortableText(mark: TiptapMark, markDefs: SanityMarkDef[]): string | null {
  switch (mark.type) {
    case 'bold':
      return 'strong';
    case 'italic':
      return 'em';
    case 'code':
      return 'code';
    case 'underline':
      return 'underline';
    case 'strike':
      return 's';
    case 'link': {
      const key = genKey();
      markDefs.push({
        _type: 'link',
        _key: key,
        href: (mark.attrs?.href as string) ?? '',
      });
      return key;
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Portable Text → Tiptap JSON
// ---------------------------------------------------------------------------

export function portableTextToTiptap(blocks: SanityBlock_Any[]): TiptapNode {
  const raw: TiptapNode[] = [];
  for (const block of blocks) {
    const node = blockToTiptap(block as SanityBlock);
    if (Array.isArray(node)) raw.push(...node);
    else if (node) raw.push(node);
  }
  // Sanity stores one block per list item; Tiptap expects all items inside
  // a single bulletList / orderedList wrapper — merge consecutive same-type lists.
  const content = mergeAdjacentLists(raw);
  if (content.length === 0) {
    content.push({ type: 'paragraph', content: [] });
  }
  return { type: 'doc', content };
}

function mergeAdjacentLists(nodes: TiptapNode[]): TiptapNode[] {
  const merged: TiptapNode[] = [];
  for (const node of nodes) {
    const last = merged[merged.length - 1];
    if (
      last &&
      (node.type === 'bulletList' || node.type === 'orderedList') &&
      last.type === node.type
    ) {
      // Append items into the existing list node
      last.content = [...(last.content ?? []), ...(node.content ?? [])];
    } else {
      merged.push({ ...node });
    }
  }
  return merged;
}

function blockToTiptap(block: SanityBlock): TiptapNode | TiptapNode[] | null {
  if (block._type !== 'block') {
    const b = block as unknown as Record<string, unknown>;
    // Handle code blocks
    if (b._type === 'code') {
      return {
        type: 'codeBlock',
        attrs: { language: (b.language as string) ?? 'text' },
        content: [{ type: 'text', text: (b.code as string) ?? '' }],
      };
    }
    if (b._type === 'break') {
      return { type: 'horizontalRule' };
    }
    // All other custom types (image, youtubeEmbed, twitterEmbed, instagramEmbed,
    // mermaidDiagram, table, factCheckEmbed, etc.) — preserve as a non-editable
    // passthrough node so content is not silently lost when the article is saved.
    return {
      type: 'passthroughBlock',
      attrs: {
        blockType: (b._type as string) ?? 'unknown',
        blockData: JSON.stringify(block),
      },
    };
  }

  const markDefs: Record<string, SanityMarkDef> = {};
  for (const def of block.markDefs ?? []) {
    markDefs[def._key] = def;
  }

  const inlineContent = spansToTiptap(block.children ?? [], markDefs);

  if (block.listItem) {
    const listType = block.listItem === 'bullet' ? 'bulletList' : 'orderedList';
    return {
      type: listType,
      content: [{ type: 'listItem', content: [{ type: 'paragraph', content: inlineContent }] }],
    };
  }

  if (block.style === 'blockquote') {
    return { type: 'blockquote', content: [{ type: 'paragraph', content: inlineContent }] };
  }

  const headingMatch = block.style?.match(/^h([1-6])$/);
  if (headingMatch) {
    return {
      type: 'heading',
      attrs: { level: parseInt(headingMatch[1], 10) },
      content: inlineContent,
    };
  }

  return { type: 'paragraph', content: inlineContent };
}

function spansToTiptap(
  spans: SanitySpan[],
  markDefs: Record<string, SanityMarkDef>
): TiptapNode[] {
  return spans.map((span) => {
    const marks: TiptapMark[] = (span.marks ?? []).map((m) => {
      if (markDefs[m]) {
        const def = markDefs[m];
        if (def._type === 'link') {
          return { type: 'link', attrs: { href: def.href as string } };
        }
      }
      switch (m) {
        case 'strong':
          return { type: 'bold' };
        case 'em':
          return { type: 'italic' };
        case 'code':
          return { type: 'code' };
        case 'underline':
          return { type: 'underline' };
        case 's':
          return { type: 'strike' };
        default:
          return { type: m };
      }
    });

    if (span.text === '\n') return { type: 'hardBreak' };
    return { type: 'text', text: span.text, marks };
  });
}
