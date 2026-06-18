// src/lib/portal/__tests__/portable-text-serializer.test.ts
// Tests for Tiptap ↔ Portable Text bidirectional serialization.
// Pure functions — no mocks needed.

import { tiptapToPortableText, portableTextToTiptap } from '../portable-text-serializer';
import type { TiptapNode, SanityBlock } from '../portable-text-serializer';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function doc(...nodes: TiptapNode[]): TiptapNode {
  return { type: 'doc', content: nodes };
}
function para(...children: TiptapNode[]): TiptapNode {
  return { type: 'paragraph', content: children };
}
function text(
  t: string,
  ...marks: Array<{ type: string; attrs?: Record<string, unknown> }>
): TiptapNode {
  return marks.length ? { type: 'text', text: t, marks } : { type: 'text', text: t };
}

// ---------------------------------------------------------------------------
// tiptapToPortableText
// ---------------------------------------------------------------------------

describe('tiptapToPortableText', () => {
  it('converts an empty doc to empty array', () => {
    expect(tiptapToPortableText({ type: 'doc', content: [] })).toEqual([]);
  });

  it('converts a simple paragraph to a normal block', () => {
    const blocks = tiptapToPortableText(doc(para(text('Hello world'))));
    expect(blocks).toHaveLength(1);
    const b = blocks[0] as SanityBlock;
    expect(b._type).toBe('block');
    expect(b.style).toBe('normal');
    expect(b.children[0].text).toBe('Hello world');
  });

  it('converts bold text to strong mark', () => {
    const blocks = tiptapToPortableText(doc(para(text('Bold', { type: 'bold' }))));
    const b = blocks[0] as SanityBlock;
    expect(b.children[0].marks).toContain('strong');
  });

  it('converts italic text to em mark', () => {
    const blocks = tiptapToPortableText(doc(para(text('Italic', { type: 'italic' }))));
    const b = blocks[0] as SanityBlock;
    expect(b.children[0].marks).toContain('em');
  });

  it('converts a link mark to a markDef reference', () => {
    const blocks = tiptapToPortableText(
      doc(para(text('Click', { type: 'link', attrs: { href: 'https://example.com' } })))
    );
    const b = blocks[0] as SanityBlock;
    expect(b.markDefs).toHaveLength(1);
    expect(b.markDefs[0]._type).toBe('link');
    expect(b.markDefs[0].href).toBe('https://example.com');
    // span.marks references the markDef key
    expect(b.children[0].marks).toContain(b.markDefs[0]._key);
  });

  it('converts heading level 2', () => {
    const blocks = tiptapToPortableText(
      doc({ type: 'heading', attrs: { level: 2 }, content: [text('Heading')] })
    );
    const b = blocks[0] as SanityBlock;
    expect(b.style).toBe('h2');
  });

  it('converts bullet list items', () => {
    const blocks = tiptapToPortableText(
      doc({
        type: 'bulletList',
        content: [
          { type: 'listItem', content: [para(text('Item 1'))] },
          { type: 'listItem', content: [para(text('Item 2'))] },
        ],
      })
    );
    // Returns array items flattened when multiple list items
    const flatBlocks = blocks.flat() as SanityBlock[];
    expect(flatBlocks.some((b) => b.listItem === 'bullet')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// portableTextToTiptap
// ---------------------------------------------------------------------------

describe('portableTextToTiptap', () => {
  it('returns an empty doc with a single empty paragraph for empty input', () => {
    const result = portableTextToTiptap([]);
    expect(result.type).toBe('doc');
    expect(result.content).toHaveLength(1);
    expect(result.content![0].type).toBe('paragraph');
  });

  it('converts a normal block to a paragraph', () => {
    const block: SanityBlock = {
      _type: 'block',
      _key: 'k1',
      style: 'normal',
      children: [{ _type: 'span', _key: 's1', text: 'Hello', marks: [] }],
      markDefs: [],
    };
    const result = portableTextToTiptap([block]);
    expect(result.content![0].type).toBe('paragraph');
    expect(result.content![0].content![0].text).toBe('Hello');
  });

  it('converts a h3 block to a heading node with level 3', () => {
    const block: SanityBlock = {
      _type: 'block',
      _key: 'k2',
      style: 'h3',
      children: [{ _type: 'span', _key: 's2', text: 'Title', marks: [] }],
      markDefs: [],
    };
    const result = portableTextToTiptap([block]);
    expect(result.content![0].type).toBe('heading');
    expect(result.content![0].attrs?.level).toBe(3);
  });

  it('converts strong marks back to bold', () => {
    const block: SanityBlock = {
      _type: 'block',
      _key: 'k3',
      style: 'normal',
      children: [{ _type: 'span', _key: 's3', text: 'Bold', marks: ['strong'] }],
      markDefs: [],
    };
    const result = portableTextToTiptap([block]);
    const textNode = result.content![0].content![0];
    expect(textNode.marks?.some((m) => m.type === 'bold')).toBe(true);
  });

  it('round-trips a paragraph with bold text', () => {
    const original = doc(para(text('Hello'), text('Bold', { type: 'bold' })));
    const sanity = tiptapToPortableText(original);
    const restored = portableTextToTiptap(sanity as SanityBlock[]);
    const firstPara = restored.content![0];
    expect(firstPara.type).toBe('paragraph');
    const texts = firstPara.content?.map((n) => n.text).join('');
    expect(texts).toContain('Hello');
    expect(texts).toContain('Bold');
  });
});
