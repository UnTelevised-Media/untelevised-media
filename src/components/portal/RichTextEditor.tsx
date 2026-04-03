// src/components/portal/RichTextEditor.tsx
// Tiptap WYSIWYG editor with full toolbar for article body content.
// Outputs Tiptap JSON which is serialized to Portable Text on save.
'use client';

import { useEditor, EditorContent, type Editor, Node } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useCallback, useEffect } from 'react';

const lowlight = createLowlight(common);

// ---------------------------------------------------------------------------
// PassthroughBlock — non-editable atom node for unsupported Sanity block types
// (embedded images, YouTube, Twitter, tables, etc.). Preserves original block
// data so it survives a save without being lost.
// ---------------------------------------------------------------------------

const PassthroughBlock = Node.create({
  name: 'passthroughBlock',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      blockType: { default: 'unknown' },
      blockData: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-passthrough]',
        getAttrs(element) {
          const el = element as HTMLElement;
          return {
            blockType: el.getAttribute('data-block-type') ?? 'unknown',
            blockData: el.getAttribute('data-block-data') ?? '',
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'div',
      {
        'data-passthrough': '1',
        'data-block-type': node.attrs.blockType as string,
        'data-block-data': node.attrs.blockData as string,
        contenteditable: 'false',
        class: 'my-2 flex select-none items-center gap-2 rounded border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-500',
      },
      `[${(node.attrs.blockType as string) ?? 'Embedded content'} — editable in Sanity Studio only]`,
    ];
  },
});

interface Props {
  content?: object; // Tiptap JSON doc
  onChange?: (json: object) => void;
  placeholder?: string;
  editable?: boolean;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing your article…',
  editable = true,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // replaced by CodeBlockLowlight
        horizontalRule: false, // replaced by our configured version
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      HorizontalRule,
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
      PassthroughBlock,
    ],
    content: content ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    editable,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON());
    },
  });

  // Sync external content changes (e.g. loading from Sanity)
  useEffect(() => {
    if (editor && content) {
      const current = JSON.stringify(editor.getJSON());
      const next = JSON.stringify(content);
      if (current !== next) {
        editor.commands.setContent(content);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!editor) return null;

  return (
    <div className='border border-slate-200 dark:border-slate-700'>
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className='prose prose-sm max-w-none p-4 focus:outline-none dark:prose-invert [&_.tiptap]:min-h-[300px] [&_.tiptap]:outline-none'
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

function Toolbar({ editor }: { editor: Editor }) {
  const addLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (!url) return;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL or Sanity asset reference:');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  type ToolbarButton = {
    label: string;
    title: string;
    action: () => void;
    active?: boolean;
    disabled?: boolean;
  };

  const groups: ToolbarButton[][] = [
    // Headings
    [
      { label: 'H1', title: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
      { label: 'H2', title: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
      { label: 'H3', title: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
      { label: 'H4', title: 'Heading 4', action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(), active: editor.isActive('heading', { level: 4 }) },
    ],
    // Inline formatting
    [
      { label: 'B', title: 'Bold (Ctrl+B)', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
      { label: 'I', title: 'Italic (Ctrl+I)', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
      { label: 'U', title: 'Underline', action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline') },
      { label: 'S̶', title: 'Strikethrough', action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
    ],
    // Block types
    [
      { label: '❝', title: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
      { label: '•—', title: 'Bullet list', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
      { label: '1—', title: 'Ordered list', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
      { label: '<>', title: 'Inline code', action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code') },
      { label: '</>', title: 'Code block', action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock') },
    ],
    // Embeds / special
    [
      { label: '🔗', title: 'Add link', action: addLink, active: editor.isActive('link') },
      { label: '🖼', title: 'Add image', action: addImage },
      { label: '—', title: 'Horizontal rule', action: () => editor.chain().focus().setHorizontalRule().run() },
    ],
    // History
    [
      { label: '↩', title: 'Undo (Ctrl+Z)', action: () => editor.chain().focus().undo().run(), disabled: !editor.can().undo() },
      { label: '↪', title: 'Redo (Ctrl+Y)', action: () => editor.chain().focus().redo().run(), disabled: !editor.can().redo() },
    ],
  ];

  return (
    <div className='flex flex-wrap gap-0.5 border-b border-slate-200 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-slate-900'>
      {groups.map((group, gi) => (
        <span key={gi} className='flex gap-0.5'>
          {group.map((btn) => (
            <button
              key={btn.label + btn.title}
              type='button'
              title={btn.title}
              onMouseDown={(e) => {
                e.preventDefault();
                btn.action();
              }}
              disabled={btn.disabled}
              aria-pressed={btn.active}
              className={`rounded px-2 py-1 text-xs font-mono transition-colors ${
                btn.active
                  ? 'bg-untele text-white'
                  : 'text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {btn.label}
            </button>
          ))}
          {gi < groups.length - 1 && (
            <span className='mx-1 inline-block w-px self-stretch bg-slate-200 dark:bg-slate-700' />
          )}
        </span>
      ))}
    </div>
  );
}
