// src/lib/portal/blocknote-serializer.ts
// Bidirectional serializer: BlockNote block array ↔ Sanity Portable Text.
//
// BlockNote 0.47 style names: bold, italic, underline, strike, code
// Sanity PT mark names:       strong, em,     underline, s,      code
//
// BlockNote block types we handle:
//   paragraph, heading, quote, bulletListItem, numberedListItem,
//   codeBlock, table, image, divider,
//   youtubeEmbed (custom), twitterEmbed (custom), instagramEmbed (custom)

// ─── Local types (avoid coupling to BlockNote generics) ──────────────────────

interface BNStyles {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  [key: string]: unknown;
}

interface BNStyledText {
  type: 'text';
  text: string;
  styles: BNStyles;
}

interface BNLink {
  type: 'link';
  href: string;
  content: BNStyledText[];
}

type BNInline = BNStyledText | BNLink;

// BlockNote 0.47 cells are TableCell objects { content, colspan?, rowspan? };
// older builds exposed plain BNInline[] arrays. Both shapes are handled.
interface BNTableCell {
  content: BNInline[];
  colspan?: number;
  rowspan?: number;
}

interface BNTableRow {
  cells: (BNInline[] | BNTableCell)[];
}

interface BNTableContent {
  type: 'tableContent';
  rows: BNTableRow[];
}

interface BNBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
  content: BNInline[] | BNTableContent | undefined;
  children: BNBlock[];
}

// Sanity Portable Text types
interface SanitySpan {
  _type: 'span';
  _key: string;
  text: string;
  marks: string[];
}

interface SanityMarkDef {
  _type: string;
  _key: string;
  [key: string]: unknown;
}

interface SanityBlock {
  _type: 'block';
  _key: string;
  style: string;
  children: SanitySpan[];
  markDefs: SanityMarkDef[];
  listItem?: 'bullet' | 'number';
  level?: number;
}

export type SanityBlockAny = SanityBlock | Record<string, unknown>;

// ─── Key generator ────────────────────────────────────────────────────────────

let _keyCounter = 0;
export function genKey(): string {
  return `bnk${++_keyCounter}${Math.random().toString(36).slice(2, 5)}`;
}

// ─── Sanity CDN URL → asset _id ───────────────────────────────────────────────
// Sanity CDN URL:  https://cdn.sanity.io/images/{proj}/{dataset}/{hash}-{WxH}.{ext}[?params]
// Sanity asset ID: image-{hash}-{WxH}-{ext}
// When portableTextToBlockNote resolves an asset _ref to a CDN URL for display,
// blockNoteToPortableText must reverse the mapping so the _ref written back to
// Sanity is the document ID, not the URL.
export function cdnUrlToAssetRef(url: string): string {
  const m = url.match(/cdn\.sanity\.io\/images\/[^/]+\/[^/]+\/([a-f0-9]+-\d+x\d+)\.([a-z0-9]+)/i);
  if (m) return `image-${m[1]}-${m[2]}`;
  // Already an asset ID (image-…) or an external URL — return as-is
  return url;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BlockNote → Portable Text
// ═══════════════════════════════════════════════════════════════════════════════

export function blockNoteToPortableText(blocks: BNBlock[]): SanityBlockAny[] {
  const result: SanityBlockAny[] = [];
  for (const block of blocks) {
    const converted = bnBlockToPT(block);
    if (Array.isArray(converted)) result.push(...converted);
    else if (converted) result.push(converted);

    // Recurse into nested children (nested list items)
    if (block.children?.length) {
      for (const child of blockNoteToPortableText(block.children)) {
        const cb = child as SanityBlock;
        if (cb.listItem) cb.level = (cb.level ?? 1) + 1;
        result.push(cb);
      }
    }
  }
  return result;
}

function bnBlockToPT(block: BNBlock): SanityBlockAny | null {
  switch (block.type) {
    case 'paragraph':
      return makeTextBlock(block, 'normal');

    case 'heading': {
      const level = (block.props.level as number) ?? 1;
      // Clamp to h1–h4 (schema only defines h1–h4)
      const clamped = Math.min(Math.max(level, 1), 4);
      return makeTextBlock(block, `h${clamped}`);
    }

    case 'quote':
      return makeTextBlock(block, 'blockquote');

    case 'bulletListItem': {
      const b = makeTextBlock(block, 'normal') as SanityBlock;
      b.listItem = 'bullet';
      b.level = 1;
      return b;
    }

    case 'numberedListItem': {
      const b = makeTextBlock(block, 'normal') as SanityBlock;
      b.listItem = 'number';
      b.level = 1;
      return b;
    }

    case 'codeBlock': {
      const inlineContent = Array.isArray(block.content) ? (block.content as BNStyledText[]) : [];
      const code = inlineContent.map((c) => c.text ?? '').join('');
      return {
        _type: 'code',
        _key: genKey(),
        language: (block.props.language as string) || 'text',
        code,
      };
    }

    case 'table': {
      const tc = block.content as BNTableContent | undefined;
      if (!tc?.rows) return null;
      return {
        _type: 'table',
        _key: genKey(),
        rows: tc.rows.map((row) => ({
          _type: 'row',
          _key: genKey(),
          cells: row.cells.map((cell) => {
            // BlockNote 0.47 wraps each cell in a TableCell object { content, colspan?, rowspan? };
            // earlier versions exposed plain BNInline[] arrays. Normalise both.
            const inlines: BNInline[] = Array.isArray(cell)
              ? (cell as BNInline[])
              : ((cell as BNTableCell).content ?? []);
            return inlines
              .filter((c) => c.type === 'text')
              .map((c) => (c as BNStyledText).text)
              .join('');
          }),
        })),
      };
    }

    case 'image': {
      const rawUrl = (block.props.url as string) ?? '';
      return {
        _type: 'image',
        _key: genKey(),
        asset: { _type: 'reference', _ref: cdnUrlToAssetRef(rawUrl) },
        alt: (block.props.caption as string) ?? '',
      };
    }

    case 'divider':
      return { _type: 'break', _key: genKey() };

    // Custom embed blocks
    case 'youtubeEmbed':
      return {
        _type: 'youtubeEmbed',
        _key: genKey(),
        videoId: (block.props.videoId as string) ?? '',
      };

    case 'twitterEmbed':
      return {
        _type: 'twitterEmbed',
        _key: genKey(),
        tweetId: (block.props.tweetId as string) ?? '',
      };

    case 'instagramEmbed':
      return {
        _type: 'instagramEmbed',
        _key: genKey(),
        postId: (block.props.postId as string) ?? '',
      };

    default:
      return null;
  }
}

function makeTextBlock(block: BNBlock, style: string): SanityBlock {
  const markDefs: SanityMarkDef[] = [];
  const inline = Array.isArray(block.content) ? (block.content as BNInline[]) : [];
  const children = inlineToSpans(inline, markDefs);
  if (children.length === 0) {
    children.push({ _type: 'span', _key: genKey(), text: '', marks: [] });
  }
  return { _type: 'block', _key: genKey(), style, children, markDefs };
}

function inlineToSpans(inline: BNInline[], markDefs: SanityMarkDef[]): SanitySpan[] {
  const spans: SanitySpan[] = [];
  for (const item of inline) {
    if (item.type === 'text') {
      spans.push({
        _type: 'span',
        _key: genKey(),
        text: item.text,
        marks: bnStylesToPTMarks(item.styles),
      });
    } else if (item.type === 'link') {
      const linkKey = genKey();
      markDefs.push({ _type: 'link', _key: linkKey, href: item.href });
      for (const child of item.content) {
        spans.push({
          _type: 'span',
          _key: genKey(),
          text: child.text,
          marks: [...bnStylesToPTMarks(child.styles), linkKey],
        });
      }
    }
  }
  return spans;
}

function bnStylesToPTMarks(styles: BNStyles): string[] {
  const marks: string[] = [];
  if (styles.bold) marks.push('strong');
  if (styles.italic) marks.push('em');
  if (styles.underline) marks.push('underline');
  if (styles.strike) marks.push('s');
  if (styles.code) marks.push('code');
  return marks;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Portable Text → BlockNote
// ═══════════════════════════════════════════════════════════════════════════════

// Returns plain objects compatible with BlockNote's PartialBlock shape.
// We avoid importing BlockNote types here so the serializer is usable in both
// client and server contexts.
//
// resolveImageUrl: optional callback to turn a Sanity asset _ref into a full
// CDN URL. When omitted image blocks fall back to the raw _ref string.
export function portableTextToBlockNote(
  blocks: SanityBlockAny[],
  resolveImageUrl?: (assetRef: string) => string
): object[] {
  if (!blocks?.length) return [emptyParagraph()];

  const result: object[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i] as SanityBlock;

    if (block._type === 'block' && block.listItem) {
      // Collect same-type consecutive list items
      const targetListItem = block.listItem;
      while (
        i < blocks.length &&
        (blocks[i] as SanityBlock)._type === 'block' &&
        (blocks[i] as SanityBlock).listItem === targetListItem
      ) {
        const item = blocks[i] as SanityBlock;
        result.push({
          type: targetListItem === 'bullet' ? 'bulletListItem' : 'numberedListItem',
          props: {},
          content: spansToInline(item.children ?? [], item.markDefs ?? []),
          children: [],
        });
        i++;
      }
      continue;
    }

    result.push(ptBlockToBN(block, resolveImageUrl));
    i++;
  }

  return result;
}

function ptBlockToBN(block: SanityBlock, resolveImageUrl?: (ref: string) => string): object {
  const b = block as unknown as Record<string, unknown>;

  if (b._type !== 'block') {
    switch (b._type) {
      case 'code':
        return {
          type: 'codeBlock',
          props: { language: (b.language as string) || '' },
          content: [{ type: 'text', text: (b.code as string) ?? '', styles: {} }],
          children: [],
        };

      case 'table': {
        const rows = (b.rows as Array<{ cells: unknown[] }> | undefined) ?? [];
        return {
          type: 'table',
          props: {},
          content: {
            type: 'tableContent',
            rows: rows.map((row) => ({
              cells: (row.cells ?? []).map((cell) => {
                const text = typeof cell === 'string' ? cell : String(cell ?? '');
                // BlockNote 0.47 requires TableCell objects with `type: "tableCell"`.
                // Without the `type` field BlockNote's internal normaliser wraps the
                // whole object in a second array, corrupting the cell content and
                // ultimately causing "e.filter is not a function" on serialisation.
                return { type: 'tableCell', content: [{ type: 'text', text, styles: {} }] };
              }),
            })),
          },
          children: [],
        };
      }

      case 'image': {
        const assetRef = (b.asset as Record<string, unknown> | undefined)?._ref as
          | string
          | undefined;
        // Prefer a pre-resolved URL (e.g. asset->{ url }) then fall back to
        // building via the injected resolver, then bare ref.
        const preResolved = (b.asset as Record<string, unknown> | undefined)?.url as
          | string
          | undefined;
        const url =
          preResolved ??
          (assetRef && resolveImageUrl ? resolveImageUrl(assetRef) : (assetRef ?? ''));
        return {
          type: 'image',
          props: { url, caption: (b.alt as string) ?? '' },
          content: undefined,
          children: [],
        };
      }

      case 'break':
        return { type: 'divider', props: {}, content: undefined, children: [] };

      case 'youtubeEmbed':
        return {
          type: 'youtubeEmbed',
          props: { videoId: (b.videoId as string) ?? '' },
          content: undefined,
          children: [],
        };

      case 'twitterEmbed':
        return {
          type: 'twitterEmbed',
          props: { tweetId: (b.tweetId as string) ?? '' },
          content: undefined,
          children: [],
        };

      case 'instagramEmbed':
        return {
          type: 'instagramEmbed',
          props: { postId: (b.postId as string) ?? '' },
          content: undefined,
          children: [],
        };

      default:
        // Unknown type — show as italicised placeholder paragraph
        return {
          type: 'paragraph',
          props: {},
          content: [
            {
              type: 'text',
              text: `[${String(b._type)} — edit in Sanity Studio]`,
              styles: { italic: true },
            },
          ],
          children: [],
        };
    }
  }

  const content = spansToInline(block.children ?? [], block.markDefs ?? []);

  if (block.style === 'blockquote') {
    return { type: 'quote', props: {}, content, children: [] };
  }

  const headingMatch = block.style?.match(/^h([1-6])$/);
  if (headingMatch) {
    const level = Math.min(parseInt(headingMatch[1], 10), 6);
    return { type: 'heading', props: { level }, content, children: [] };
  }

  return { type: 'paragraph', props: {}, content, children: [] };
}

function spansToInline(spans: SanitySpan[], markDefs: SanityMarkDef[]): BNInline[] {
  const defMap: Record<string, SanityMarkDef> = {};
  for (const def of markDefs) defMap[def._key] = def;

  const result: BNInline[] = [];

  for (const span of spans) {
    const linkMark = span.marks?.find((m) => defMap[m]?._type === 'link');
    const styleMark = span.marks?.filter((m) => !defMap[m]) ?? [];
    const styles = ptMarksToStyles(styleMark);

    if (linkMark) {
      const def = defMap[linkMark];
      const href = (def.href as string) ?? '';
      // Merge into previous link if same href
      const prev = result[result.length - 1];
      if (prev?.type === 'link' && (prev as BNLink).href === href) {
        (prev as BNLink).content.push({ type: 'text', text: span.text, styles });
      } else {
        result.push({
          type: 'link',
          href,
          content: [{ type: 'text', text: span.text, styles }],
        });
      }
    } else {
      result.push({ type: 'text', text: span.text, styles });
    }
  }

  return result;
}

function ptMarksToStyles(marks: string[]): BNStyles {
  const styles: BNStyles = {};
  for (const m of marks) {
    if (m === 'strong') styles.bold = true;
    else if (m === 'em') styles.italic = true;
    else if (m === 'underline') styles.underline = true;
    else if (m === 's') styles.strike = true;
    else if (m === 'code') styles.code = true;
  }
  return styles;
}

function emptyParagraph(): object {
  return { type: 'paragraph', props: {}, content: [], children: [] };
}
