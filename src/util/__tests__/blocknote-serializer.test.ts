// src/lib/portal/__tests__/blocknote-serializer.test.ts
// Unit tests for the BlockNote ↔ Portable Text bidirectional serializer.
// Pure functions — no mocks, no DOM, no network.

import {
  blockNoteToPortableText,
  portableTextToBlockNote,
  cdnUrlToAssetRef,
  type SanityBlockAny,
} from '../blocknote-serializer';

// ---------------------------------------------------------------------------
// Local type aliases (mirror the private types in the serializer)
// ---------------------------------------------------------------------------

type PTBlock = {
  _type: string;
  _key: string;
  style?: string;
  children?: Array<{ _type: string; _key: string; text: string; marks: string[] }>;
  markDefs?: Array<{ _type: string; _key: string; [k: string]: unknown }>;
  listItem?: 'bullet' | 'number';
  level?: number;
};

// Minimal BlockNote-compatible block factory helpers
function bnParagraph(text: string, styles: Record<string, boolean> = {}) {
  return {
    id: 'p1',
    type: 'paragraph' as const,
    props: {},
    content: [{ type: 'text' as const, text, styles }],
    children: [],
  };
}

function bnHeading(level: number, text: string) {
  return {
    id: 'h1',
    type: 'heading' as const,
    props: { level },
    content: [{ type: 'text' as const, text, styles: {} }],
    children: [],
  };
}

function bnQuote(text: string) {
  return {
    id: 'q1',
    type: 'quote' as const,
    props: {},
    content: [{ type: 'text' as const, text, styles: {} }],
    children: [],
  };
}

function bnBullet(text: string) {
  return {
    id: 'b1',
    type: 'bulletListItem' as const,
    props: {},
    content: [{ type: 'text' as const, text, styles: {} }],
    children: [],
  };
}

function bnNumber(text: string) {
  return {
    id: 'n1',
    type: 'numberedListItem' as const,
    props: {},
    content: [{ type: 'text' as const, text, styles: {} }],
    children: [],
  };
}

function bnCode(code: string, language = 'javascript') {
  return {
    id: 'c1',
    type: 'codeBlock' as const,
    props: { language },
    content: [{ type: 'text' as const, text: code, styles: {} }],
    children: [],
  };
}

function bnTable(rows: string[][]) {
  return {
    id: 't1',
    type: 'table' as const,
    props: {},
    content: {
      type: 'tableContent' as const,
      rows: rows.map((cells) => ({
        cells: cells.map((c) => [{ type: 'text' as const, text: c, styles: {} }]),
      })),
    },
    children: [],
  };
}

function bnLink(text: string, href: string) {
  return {
    id: 'l1',
    type: 'paragraph' as const,
    props: {},
    content: [
      {
        type: 'link' as const,
        href,
        content: [{ type: 'text' as const, text, styles: {} }],
      },
    ],
    children: [],
  };
}

// ---------------------------------------------------------------------------
// blockNoteToPortableText — BN → PT
// ---------------------------------------------------------------------------

describe('blockNoteToPortableText', () => {
  describe('text blocks', () => {
    it('converts a paragraph to a normal block', () => {
      const [block] = blockNoteToPortableText([bnParagraph('Hello')]) as PTBlock[];
      expect(block._type).toBe('block');
      expect(block.style).toBe('normal');
      expect(block.children?.[0].text).toBe('Hello');
    });

    it('adds an empty span to an empty paragraph', () => {
      const block = blockNoteToPortableText([
        { id: 'e1', type: 'paragraph', props: {}, content: [], children: [] },
      ])[0] as PTBlock;
      expect(block.children).toHaveLength(1);
      expect(block.children![0].text).toBe('');
    });

    it('converts a quote to blockquote style', () => {
      const [block] = blockNoteToPortableText([bnQuote('Famous quote')]) as PTBlock[];
      expect(block.style).toBe('blockquote');
    });
  });

  describe('headings', () => {
    it.each([1, 2, 3, 4] as const)('converts heading level %i correctly', (level) => {
      const [block] = blockNoteToPortableText([bnHeading(level, 'Title')]) as PTBlock[];
      expect(block.style).toBe(`h${level}`);
    });

    it('clamps heading level 5 to h4', () => {
      const [block] = blockNoteToPortableText([bnHeading(5, 'Big')]) as PTBlock[];
      expect(block.style).toBe('h4');
    });

    it('clamps heading level 0 to h1', () => {
      const [block] = blockNoteToPortableText([bnHeading(0, 'Big')]) as PTBlock[];
      expect(block.style).toBe('h1');
    });
  });

  describe('inline marks', () => {
    it('converts bold to strong', () => {
      const [block] = blockNoteToPortableText([bnParagraph('Bold', { bold: true })]) as PTBlock[];
      expect(block.children?.[0].marks).toContain('strong');
    });

    it('converts italic to em', () => {
      const [block] = blockNoteToPortableText([
        bnParagraph('Italic', { italic: true }),
      ]) as PTBlock[];
      expect(block.children?.[0].marks).toContain('em');
    });

    it('converts underline mark', () => {
      const [block] = blockNoteToPortableText([
        bnParagraph('U', { underline: true }),
      ]) as PTBlock[];
      expect(block.children?.[0].marks).toContain('underline');
    });

    it('converts strike to s', () => {
      const [block] = blockNoteToPortableText([
        bnParagraph('Strike', { strike: true }),
      ]) as PTBlock[];
      expect(block.children?.[0].marks).toContain('s');
    });

    it('converts code mark', () => {
      const [block] = blockNoteToPortableText([bnParagraph('code', { code: true })]) as PTBlock[];
      expect(block.children?.[0].marks).toContain('code');
    });

    it('combines multiple marks on one span', () => {
      const [block] = blockNoteToPortableText([
        bnParagraph('BoldItalic', { bold: true, italic: true }),
      ]) as PTBlock[];
      const marks = block.children?.[0].marks ?? [];
      expect(marks).toContain('strong');
      expect(marks).toContain('em');
    });
  });

  describe('links', () => {
    it('creates a markDef for a link', () => {
      const [block] = blockNoteToPortableText([
        bnLink('Click here', 'https://example.com'),
      ]) as PTBlock[];
      expect(block.markDefs).toHaveLength(1);
      expect(block.markDefs![0]._type).toBe('link');
      expect(block.markDefs![0].href).toBe('https://example.com');
    });

    it('puts the markDef key in the span marks', () => {
      const [block] = blockNoteToPortableText([
        bnLink('Link', 'https://example.com'),
      ]) as PTBlock[];
      const key = block.markDefs![0]._key;
      expect(block.children?.[0].marks).toContain(key);
    });
  });

  describe('list items', () => {
    it('converts bulletListItem to a block with listItem: bullet', () => {
      const [block] = blockNoteToPortableText([bnBullet('Item')]) as PTBlock[];
      expect(block._type).toBe('block');
      expect(block.listItem).toBe('bullet');
      expect(block.level).toBe(1);
    });

    it('converts numberedListItem to a block with listItem: number', () => {
      const [block] = blockNoteToPortableText([bnNumber('Step')]) as PTBlock[];
      expect(block.listItem).toBe('number');
      expect(block.level).toBe(1);
    });

    it('increments level for nested list children', () => {
      const nestedItem = bnBullet('Nested');
      const parentItem = {
        ...bnBullet('Parent'),
        id: 'p',
        children: [nestedItem],
      };
      const blocks = blockNoteToPortableText([parentItem]) as PTBlock[];
      const nested = blocks.find((b) => b.children?.[0]?.text === 'Nested');
      expect(nested?.level).toBe(2);
    });
  });

  describe('non-text blocks', () => {
    it('converts codeBlock with language and code', () => {
      const pt = blockNoteToPortableText([bnCode('const x = 1;', 'javascript')]);
      const block = pt[0] as Record<string, unknown>;
      expect(block._type).toBe('code');
      expect(block.language).toBe('javascript');
      expect(block.code).toBe('const x = 1;');
    });

    it('falls back to "text" when codeBlock has no language', () => {
      const block = bnCode('echo hi', '');
      const pt = blockNoteToPortableText([block]) as Array<Record<string, unknown>>;
      expect(pt[0].language).toBe('text');
    });

    it('converts table with string cells (plain array format)', () => {
      const pt = blockNoteToPortableText([
        bnTable([
          ['A', 'B'],
          ['1', '2'],
        ]),
      ]);
      const table = pt[0] as Record<string, unknown>;
      expect(table._type).toBe('table');
      const rows = table.rows as Array<{ cells: string[] }>;
      expect(rows).toHaveLength(2);
      expect(rows[0].cells).toEqual(['A', 'B']);
      expect(rows[1].cells).toEqual(['1', '2']);
    });

    it('converts table with BlockNote 0.47 TableCell objects', () => {
      // BN 0.47 editor.document exposes cells as { content: BNInline[], colspan?, rowspan? }
      const block = {
        id: 't2',
        type: 'table' as const,
        props: {},
        content: {
          type: 'tableContent' as const,
          rows: [
            {
              cells: [
                { content: [{ type: 'text' as const, text: 'Header', styles: {} }] },
                { content: [{ type: 'text' as const, text: 'Value', styles: {} }] },
              ],
            },
          ],
        },
        children: [],
      };
      const pt = blockNoteToPortableText([block as never]);
      const table = pt[0] as Record<string, unknown>;
      expect(table._type).toBe('table');
      const rows = table.rows as Array<{ cells: string[] }>;
      expect(rows[0].cells).toEqual(['Header', 'Value']);
    });

    it('converts divider to break', () => {
      const pt = blockNoteToPortableText([
        { id: 'd1', type: 'divider', props: {}, content: undefined, children: [] },
      ]);
      expect((pt[0] as Record<string, unknown>)._type).toBe('break');
    });

    it('converts image block — bare asset ID passes through unchanged', () => {
      const pt = blockNoteToPortableText([
        {
          id: 'img1',
          type: 'image',
          props: { url: 'image-abc123', caption: 'A photo' },
          content: undefined,
          children: [],
        },
      ]);
      const img = pt[0] as Record<string, unknown>;
      expect(img._type).toBe('image');
      expect((img.asset as Record<string, unknown>)._ref).toBe('image-abc123');
      expect(img.alt).toBe('A photo');
    });

    it('converts image block — CDN URL is reversed back to asset ID', () => {
      // Regression: portableTextToBlockNote resolves asset refs to CDN URLs for display.
      // blockNoteToPortableText must convert them back so Sanity gets a valid document ID.
      const cdnUrl =
        'https://cdn.sanity.io/images/ypejdt32/articles/0998b99a508a353fa1c426ff118b3be182f57714-1920x1080.webp?w=800';
      const pt = blockNoteToPortableText([
        {
          id: 'img2',
          type: 'image',
          props: { url: cdnUrl, caption: '' },
          content: undefined,
          children: [],
        },
      ]);
      const img = pt[0] as Record<string, unknown>;
      expect((img.asset as Record<string, unknown>)._ref).toBe(
        'image-0998b99a508a353fa1c426ff118b3be182f57714-1920x1080-webp'
      );
    });

    it('converts youtubeEmbed block', () => {
      const pt = blockNoteToPortableText([
        {
          id: 'yt1',
          type: 'youtubeEmbed',
          props: { videoId: 'abc123' },
          content: undefined,
          children: [],
        },
      ]);
      const block = pt[0] as Record<string, unknown>;
      expect(block._type).toBe('youtubeEmbed');
      expect(block.videoId).toBe('abc123');
    });

    it('converts twitterEmbed block', () => {
      const pt = blockNoteToPortableText([
        {
          id: 'tw1',
          type: 'twitterEmbed',
          props: { tweetId: '9876543210' },
          content: undefined,
          children: [],
        },
      ]);
      const block = pt[0] as Record<string, unknown>;
      expect(block._type).toBe('twitterEmbed');
      expect(block.tweetId).toBe('9876543210');
    });

    it('converts instagramEmbed block', () => {
      const pt = blockNoteToPortableText([
        {
          id: 'ig1',
          type: 'instagramEmbed',
          props: { postId: 'CXnzMpYMoSX' },
          content: undefined,
          children: [],
        },
      ]);
      const block = pt[0] as Record<string, unknown>;
      expect(block._type).toBe('instagramEmbed');
      expect(block.postId).toBe('CXnzMpYMoSX');
    });

    it('skips unknown block types (returns nothing)', () => {
      const pt = blockNoteToPortableText([
        { id: 'u1', type: 'unknownCustomBlock', props: {}, content: undefined, children: [] },
      ]);
      expect(pt).toHaveLength(0);
    });
  });

  it('converts an empty array to an empty array', () => {
    expect(blockNoteToPortableText([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// portableTextToBlockNote — PT → BN
// ---------------------------------------------------------------------------

describe('portableTextToBlockNote', () => {
  function ptBlock(style: string, text: string, marks: string[] = []): SanityBlockAny {
    return {
      _type: 'block',
      _key: 'k1',
      style,
      children: [{ _type: 'span', _key: 's1', text, marks }],
      markDefs: [],
    };
  }

  describe('empty / null input', () => {
    it('returns a single empty paragraph for empty array', () => {
      const blocks = portableTextToBlockNote([]);
      expect(blocks).toHaveLength(1);
      expect((blocks[0] as { type: string }).type).toBe('paragraph');
    });

    it('returns a single empty paragraph for null/undefined', () => {
      // @ts-expect-error testing null input
      const blocks = portableTextToBlockNote(null);
      expect((blocks[0] as { type: string }).type).toBe('paragraph');
    });
  });

  describe('block types', () => {
    it('converts normal block to paragraph', () => {
      const [b] = portableTextToBlockNote([ptBlock('normal', 'Hello')]) as Array<{
        type: string;
        content: Array<{ type: string; text: string }>;
      }>;
      expect(b.type).toBe('paragraph');
      expect(b.content[0].text).toBe('Hello');
    });

    it.each(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const)(
      'converts %s to a heading with correct level',
      (style) => {
        const [b] = portableTextToBlockNote([ptBlock(style, 'Title')]) as Array<{
          type: string;
          props: { level: number };
        }>;
        expect(b.type).toBe('heading');
        expect(b.props.level).toBe(parseInt(style[1], 10));
      }
    );

    it('converts blockquote to quote type', () => {
      const [b] = portableTextToBlockNote([ptBlock('blockquote', 'Quote')]) as Array<{
        type: string;
      }>;
      expect(b.type).toBe('quote');
    });
  });

  describe('list items', () => {
    it('converts consecutive bullet list items', () => {
      const blocks = [
        {
          _type: 'block',
          _key: 'k1',
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [{ _type: 'span', _key: 's1', text: 'Item 1', marks: [] }],
          markDefs: [],
        },
        {
          _type: 'block',
          _key: 'k2',
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [{ _type: 'span', _key: 's2', text: 'Item 2', marks: [] }],
          markDefs: [],
        },
      ] as SanityBlockAny[];
      const result = portableTextToBlockNote(blocks) as Array<{ type: string }>;
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('bulletListItem');
      expect(result[1].type).toBe('bulletListItem');
    });

    it('converts consecutive numbered list items', () => {
      const blocks = [
        {
          _type: 'block',
          _key: 'k1',
          style: 'normal',
          listItem: 'number',
          level: 1,
          children: [{ _type: 'span', _key: 's1', text: 'Step 1', marks: [] }],
          markDefs: [],
        },
      ] as SanityBlockAny[];
      const [b] = portableTextToBlockNote(blocks) as Array<{ type: string }>;
      expect(b.type).toBe('numberedListItem');
    });

    it('separates bullet and number lists when mixed', () => {
      const blocks = [
        {
          _type: 'block',
          _key: 'k1',
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [{ _type: 'span', _key: 's1', text: 'Bullet', marks: [] }],
          markDefs: [],
        },
        {
          _type: 'block',
          _key: 'k2',
          style: 'normal',
          listItem: 'number',
          level: 1,
          children: [{ _type: 'span', _key: 's2', text: 'Number', marks: [] }],
          markDefs: [],
        },
      ] as SanityBlockAny[];
      const result = portableTextToBlockNote(blocks) as Array<{ type: string }>;
      expect(result[0].type).toBe('bulletListItem');
      expect(result[1].type).toBe('numberedListItem');
    });
  });

  describe('inline marks (PT → BN)', () => {
    it('converts strong to bold style', () => {
      const block = {
        _type: 'block',
        _key: 'k1',
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: 's1', text: 'Bold', marks: ['strong'] }],
      } as SanityBlockAny;
      const [b] = portableTextToBlockNote([block]) as Array<{
        content: Array<{ type: string; text: string; styles: Record<string, boolean> }>;
      }>;
      expect(b.content[0].styles.bold).toBe(true);
    });

    it('converts em to italic style', () => {
      const block = {
        _type: 'block',
        _key: 'k1',
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: 's1', text: 'Italic', marks: ['em'] }],
      } as SanityBlockAny;
      const [b] = portableTextToBlockNote([block]) as Array<{
        content: Array<{ styles: Record<string, boolean> }>;
      }>;
      expect(b.content[0].styles.italic).toBe(true);
    });

    it('converts s to strike style', () => {
      const block = {
        _type: 'block',
        _key: 'k1',
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: 's1', text: 'Strike', marks: ['s'] }],
      } as SanityBlockAny;
      const [b] = portableTextToBlockNote([block]) as Array<{
        content: Array<{ styles: Record<string, boolean> }>;
      }>;
      expect(b.content[0].styles.strike).toBe(true);
    });

    it('converts link markDef to a BNLink inline', () => {
      const block = {
        _type: 'block',
        _key: 'k1',
        style: 'normal',
        markDefs: [{ _type: 'link', _key: 'lk1', href: 'https://untelevised.live' }],
        children: [{ _type: 'span', _key: 's1', text: 'Visit', marks: ['lk1'] }],
      } as SanityBlockAny;
      const [b] = portableTextToBlockNote([block]) as Array<{
        content: Array<{ type: string; href?: string }>;
      }>;
      expect(b.content[0].type).toBe('link');
      expect(b.content[0].href).toBe('https://untelevised.live');
    });
  });

  describe('non-text block types', () => {
    it('converts code block', () => {
      const pt = [
        { _type: 'code', _key: 'c1', language: 'python', code: 'print("hi")' },
      ] as SanityBlockAny[];
      const [b] = portableTextToBlockNote(pt) as Array<{
        type: string;
        props: { language: string };
        content: Array<{ text: string }>;
      }>;
      expect(b.type).toBe('codeBlock');
      expect(b.props.language).toBe('python');
      expect(b.content[0].text).toBe('print("hi")');
    });

    it('converts table block', () => {
      const pt = [
        {
          _type: 'table',
          _key: 't1',
          rows: [
            { _type: 'row', _key: 'r1', cells: ['Name', 'Age'] },
            { _type: 'row', _key: 'r2', cells: ['Alice', '30'] },
          ],
        },
      ] as SanityBlockAny[];
      const [b] = portableTextToBlockNote(pt) as Array<{
        type: string;
        content: {
          type: string;
          rows: Array<{ cells: Array<{ type: string; content: Array<{ text: string }> }> }>;
        };
      }>;
      expect(b.type).toBe('table');
      // BlockNote 0.47 needs TableCell objects with type:"tableCell" and content
      expect(b.content.rows[0].cells[0].type).toBe('tableCell');
      expect(b.content.rows[0].cells[0].content[0].text).toBe('Name');
      expect(b.content.rows[1].cells[1].content[0].text).toBe('30');
    });

    it('converts break to divider', () => {
      const pt = [{ _type: 'break', _key: 'br1' }] as SanityBlockAny[];
      const [b] = portableTextToBlockNote(pt) as Array<{ type: string }>;
      expect(b.type).toBe('divider');
    });

    it('converts youtubeEmbed', () => {
      const pt = [
        { _type: 'youtubeEmbed', _key: 'yt1', videoId: 'dQw4w9WgXcQ' },
      ] as SanityBlockAny[];
      const [b] = portableTextToBlockNote(pt) as Array<{
        type: string;
        props: { videoId: string };
      }>;
      expect(b.type).toBe('youtubeEmbed');
      expect(b.props.videoId).toBe('dQw4w9WgXcQ');
    });

    it('converts twitterEmbed', () => {
      const pt = [
        { _type: 'twitterEmbed', _key: 'tw1', tweetId: '123456789' },
      ] as SanityBlockAny[];
      const [b] = portableTextToBlockNote(pt) as Array<{
        type: string;
        props: { tweetId: string };
      }>;
      expect(b.type).toBe('twitterEmbed');
      expect(b.props.tweetId).toBe('123456789');
    });

    it('converts instagramEmbed', () => {
      const pt = [{ _type: 'instagramEmbed', _key: 'ig1', postId: 'ABC123' }] as SanityBlockAny[];
      const [b] = portableTextToBlockNote(pt) as Array<{
        type: string;
        props: { postId: string };
      }>;
      expect(b.type).toBe('instagramEmbed');
      expect(b.props.postId).toBe('ABC123');
    });

    it('converts image with pre-resolved URL', () => {
      const pt = [
        {
          _type: 'image',
          _key: 'img1',
          asset: { _ref: 'image-abc', url: 'https://cdn.example.com/photo.jpg' },
          alt: 'Test image',
        },
      ] as SanityBlockAny[];
      const [b] = portableTextToBlockNote(pt) as Array<{
        type: string;
        props: { url: string; caption: string };
      }>;
      expect(b.type).toBe('image');
      expect(b.props.url).toBe('https://cdn.example.com/photo.jpg');
      expect(b.props.caption).toBe('Test image');
    });

    it('uses resolveImageUrl callback when no pre-resolved URL', () => {
      const pt = [
        {
          _type: 'image',
          _key: 'img2',
          asset: { _ref: 'image-xyz123' },
          alt: 'Alt text',
        },
      ] as SanityBlockAny[];
      const resolver = (ref: string) => `https://cdn.sanity.io/images/${ref}`;
      const [b] = portableTextToBlockNote(pt, resolver) as Array<{
        type: string;
        props: { url: string };
      }>;
      expect(b.props.url).toBe('https://cdn.sanity.io/images/image-xyz123');
    });

    it('renders unknown block types as italic placeholder paragraph', () => {
      const pt = [{ _type: 'customWidget', _key: 'w1', someField: 'value' }] as SanityBlockAny[];
      const [b] = portableTextToBlockNote(pt) as Array<{
        type: string;
        content: Array<{ type: string; text: string; styles: Record<string, boolean> }>;
      }>;
      expect(b.type).toBe('paragraph');
      expect(b.content[0].text).toContain('customWidget');
      expect(b.content[0].styles.italic).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Round-trip
  // ---------------------------------------------------------------------------

  describe('round-trip BN → PT → BN', () => {
    it('round-trips a paragraph with bold text', () => {
      const original = [bnParagraph('BoldText', { bold: true })];
      const pt = blockNoteToPortableText(original);
      const restored = portableTextToBlockNote(pt) as Array<{
        type: string;
        content: Array<{ type: string; text: string; styles: Record<string, boolean> }>;
      }>;
      expect(restored[0].type).toBe('paragraph');
      expect(restored[0].content[0].text).toBe('BoldText');
      expect(restored[0].content[0].styles.bold).toBe(true);
    });

    it('round-trips headings', () => {
      const original = [bnHeading(2, 'Chapter Title')];
      const pt = blockNoteToPortableText(original);
      const restored = portableTextToBlockNote(pt) as Array<{
        type: string;
        props: { level: number };
      }>;
      expect(restored[0].type).toBe('heading');
      expect(restored[0].props.level).toBe(2);
    });

    it('round-trips a bullet list', () => {
      const original = [bnBullet('Item A'), bnBullet('Item B')];
      const pt = blockNoteToPortableText(original);
      const restored = portableTextToBlockNote(pt) as Array<{ type: string }>;
      expect(restored).toHaveLength(2);
      expect(restored[0].type).toBe('bulletListItem');
      expect(restored[1].type).toBe('bulletListItem');
    });

    it('round-trips a code block', () => {
      const original = [bnCode('console.log("hi")', 'javascript')];
      const pt = blockNoteToPortableText(original);
      const restored = portableTextToBlockNote(pt) as Array<{
        type: string;
        props: { language: string };
        content: Array<{ text: string }>;
      }>;
      expect(restored[0].type).toBe('codeBlock');
      expect(restored[0].props.language).toBe('javascript');
      expect(restored[0].content[0].text).toBe('console.log("hi")');
    });

    it('round-trips YouTube, Twitter, Instagram embeds', () => {
      const original = [
        {
          id: 'yt',
          type: 'youtubeEmbed',
          props: { videoId: 'testid' },
          content: undefined,
          children: [],
        },
        {
          id: 'tw',
          type: 'twitterEmbed',
          props: { tweetId: '1234' },
          content: undefined,
          children: [],
        },
        {
          id: 'ig',
          type: 'instagramEmbed',
          props: { postId: 'igpost' },
          content: undefined,
          children: [],
        },
      ];
      const pt = blockNoteToPortableText(original);
      const restored = portableTextToBlockNote(pt) as Array<{
        type: string;
        props: Record<string, string>;
      }>;
      expect(restored[0].type).toBe('youtubeEmbed');
      expect(restored[0].props.videoId).toBe('testid');
      expect(restored[1].type).toBe('twitterEmbed');
      expect(restored[1].props.tweetId).toBe('1234');
      expect(restored[2].type).toBe('instagramEmbed');
      expect(restored[2].props.postId).toBe('igpost');
    });
  });
});

// ---------------------------------------------------------------------------
// cdnUrlToAssetRef
// ---------------------------------------------------------------------------

describe('cdnUrlToAssetRef', () => {
  it('converts a Sanity CDN URL to the correct asset _id', () => {
    expect(
      cdnUrlToAssetRef(
        'https://cdn.sanity.io/images/ypejdt32/articles/0998b99a508a353fa1c426ff118b3be182f57714-1920x1080.webp'
      )
    ).toBe('image-0998b99a508a353fa1c426ff118b3be182f57714-1920x1080-webp');
  });

  it('strips query parameters before extracting the asset ID', () => {
    expect(
      cdnUrlToAssetRef(
        'https://cdn.sanity.io/images/abc/prod/deadbeef-800x600.jpg?w=400&auto=format'
      )
    ).toBe('image-deadbeef-800x600-jpg');
  });

  it('handles png, jpg, gif, avif extensions', () => {
    expect(cdnUrlToAssetRef('https://cdn.sanity.io/images/p/d/aabbcc-640x480.png')).toBe(
      'image-aabbcc-640x480-png'
    );
    expect(cdnUrlToAssetRef('https://cdn.sanity.io/images/p/d/aabbcc-640x480.gif')).toBe(
      'image-aabbcc-640x480-gif'
    );
    expect(cdnUrlToAssetRef('https://cdn.sanity.io/images/p/d/aabbcc-640x480.avif')).toBe(
      'image-aabbcc-640x480-avif'
    );
  });

  it('passes through an existing asset _id unchanged', () => {
    expect(cdnUrlToAssetRef('image-abc123-400x300-jpg')).toBe('image-abc123-400x300-jpg');
  });

  it('passes through an empty string unchanged', () => {
    expect(cdnUrlToAssetRef('')).toBe('');
  });

  it('passes through an external non-Sanity URL unchanged', () => {
    const ext = 'https://example.com/photo.jpg';
    expect(cdnUrlToAssetRef(ext)).toBe(ext);
  });
});
