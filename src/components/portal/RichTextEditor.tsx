// src/components/portal/RichTextEditor.tsx
// BlockNote WYSIWYG editor with custom embed blocks for YouTube, Twitter,
// Instagram and full table / code support via BlockNote 0.47.
'use client';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

import { BlockNoteSchema, defaultBlockSpecs, filterSuggestionItems } from '@blocknote/core';
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  createReactBlockSpec,
} from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Youtube, Twitter, Instagram } from 'lucide-react';

// ─── Utility: extract YouTube video ID from URL or bare ID ───────────────────

function parseYouTubeId(input: string): string {
  const url = input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  // Assume bare ID if it looks like one
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url;
  return url;
}

// ─── Custom block: YouTube embed ─────────────────────────────────────────────

const YouTubeBlock = createReactBlockSpec(
  {
    type: 'youtubeEmbed' as const,
    propSchema: { videoId: { default: '' } },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const [editing, setEditing] = useState(!block.props.videoId);
      const [draft, setDraft] = useState(block.props.videoId);

      function handleSave() {
        const id = parseYouTubeId(draft);
        editor.updateBlock(block, { props: { videoId: id } });
        setEditing(false);
      }

      if (editing || !block.props.videoId) {
        return (
          <div className='my-2 rounded border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900'>
            <p className='mb-2 text-xs font-bold uppercase tracking-widest text-slate-500'>
              YouTube Embed
            </p>
            <div className='flex gap-2'>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder='YouTube URL or video ID…'
                className='flex-1 border border-slate-300 bg-white px-2 py-1 text-sm focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800'
              />
              <button
                type='button'
                onClick={handleSave}
                className='bg-untele px-3 py-1 text-xs font-black uppercase tracking-widest text-white'
              >
                Embed
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className='my-2'>
          <div className='aspect-video'>
            <iframe
              src={`https://www.youtube.com/embed/${block.props.videoId}`}
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
              className='h-full w-full'
            />
          </div>
          <button
            type='button'
            onClick={() => { setDraft(block.props.videoId); setEditing(true); }}
            className='mt-1 text-xs text-slate-400 underline hover:text-untele'
          >
            Change video
          </button>
        </div>
      );
    },
  },
);

// ─── Custom block: Twitter / X embed ─────────────────────────────────────────

function parseTweetId(input: string): string {
  const m = input.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  if (m) return m[1];
  if (/^\d+$/.test(input.trim())) return input.trim();
  return input.trim();
}

const TwitterBlock = createReactBlockSpec(
  {
    type: 'twitterEmbed' as const,
    propSchema: { tweetId: { default: '' } },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const [editing, setEditing] = useState(!block.props.tweetId);
      const [draft, setDraft] = useState(block.props.tweetId);

      function handleSave() {
        editor.updateBlock(block, { props: { tweetId: parseTweetId(draft) } });
        setEditing(false);
      }

      if (editing || !block.props.tweetId) {
        return (
          <div className='my-2 rounded border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900'>
            <p className='mb-2 text-xs font-bold uppercase tracking-widest text-slate-500'>
              Twitter / X Embed
            </p>
            <div className='flex gap-2'>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder='Tweet URL or ID…'
                className='flex-1 border border-slate-300 bg-white px-2 py-1 text-sm focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800'
              />
              <button
                type='button'
                onClick={handleSave}
                className='bg-untele px-3 py-1 text-xs font-black uppercase tracking-widest text-white'
              >
                Embed
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className='my-2 flex flex-col items-center'>
          <iframe
            src={`https://platform.twitter.com/embed/Tweet.html?id=${block.props.tweetId}`}
            className='min-h-[200px] w-full max-w-lg border-0'
          />
          <button
            type='button'
            onClick={() => { setDraft(block.props.tweetId); setEditing(true); }}
            className='mt-1 text-xs text-slate-400 underline hover:text-untele'
          >
            Change tweet
          </button>
        </div>
      );
    },
  },
);

// ─── Custom block: Instagram embed ───────────────────────────────────────────

function parseInstagramId(input: string): string {
  const m = input.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  return input.trim();
}

const InstagramBlock = createReactBlockSpec(
  {
    type: 'instagramEmbed' as const,
    propSchema: { postId: { default: '' } },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const [editing, setEditing] = useState(!block.props.postId);
      const [draft, setDraft] = useState(block.props.postId);

      function handleSave() {
        editor.updateBlock(block, { props: { postId: parseInstagramId(draft) } });
        setEditing(false);
      }

      if (editing || !block.props.postId) {
        return (
          <div className='my-2 rounded border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900'>
            <p className='mb-2 text-xs font-bold uppercase tracking-widest text-slate-500'>
              Instagram Embed
            </p>
            <div className='flex gap-2'>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder='Instagram post URL or ID…'
                className='flex-1 border border-slate-300 bg-white px-2 py-1 text-sm focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800'
              />
              <button
                type='button'
                onClick={handleSave}
                className='bg-untele px-3 py-1 text-xs font-black uppercase tracking-widest text-white'
              >
                Embed
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className='my-2 flex flex-col items-center'>
          <iframe
            src={`https://www.instagram.com/p/${block.props.postId}/embed`}
            className='min-h-[400px] w-full max-w-md border-0'
            scrolling='no'
          />
          <button
            type='button'
            onClick={() => { setDraft(block.props.postId); setEditing(true); }}
            className='mt-1 text-xs text-slate-400 underline hover:text-untele'
          >
            Change post
          </button>
        </div>
      );
    },
  },
);

// ─── BlockNote schema with custom blocks ─────────────────────────────────────

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    youtubeEmbed: YouTubeBlock(),
    twitterEmbed: TwitterBlock(),
    instagramEmbed: InstagramBlock(),
  },
});

// ─── Component props ──────────────────────────────────────────────────────────

interface Props {
  initialContent?: object[]; // PartialBlock[] from portableTextToBlockNote
  onChange?: (blocks: object[]) => void;
  placeholder?: string;
  editable?: boolean;
}

// ─── Main editor component ───────────────────────────────────────────────────

export default function RichTextEditor({
  initialContent,
  onChange,
  placeholder = 'Start writing… type / for commands',
  editable = true,
}: Props) {
  const { resolvedTheme } = useTheme();
  const editor = useCreateBlockNote({
    schema,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialContent: initialContent?.length ? (initialContent as any) : undefined,
    placeholderText: placeholder,
  });

  const handleChange = useCallback(() => {
    onChange?.(editor.document as unknown as object[]);
  }, [editor, onChange]);

  return (
    <div className='blocknote-wrapper border border-slate-200 dark:border-slate-700'>
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={handleChange}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        slashMenu={false}
      >
        <SuggestionMenuController
          triggerCharacter='/'
          getItems={async (query) =>
            filterSuggestionItems(
              [
                ...getDefaultReactSlashMenuItems(editor),
                {
                  title: 'YouTube',
                  subtext: 'Embed a YouTube video',
                  onItemClick: () => {
                    const cur = editor.getTextCursorPosition().block;
                    editor.insertBlocks(
                      [{ type: 'youtubeEmbed' as const, props: { videoId: '' } }],
                      cur,
                      'after',
                    );
                  },
                  group: 'Embeds',
                  icon: <Youtube size={18} />,
                  aliases: ['youtube', 'video', 'yt'],
                },
                {
                  title: 'Twitter / X',
                  subtext: 'Embed a tweet',
                  onItemClick: () => {
                    const cur = editor.getTextCursorPosition().block;
                    editor.insertBlocks(
                      [{ type: 'twitterEmbed' as const, props: { tweetId: '' } }],
                      cur,
                      'after',
                    );
                  },
                  group: 'Embeds',
                  icon: <Twitter size={18} />,
                  aliases: ['twitter', 'tweet', 'x'],
                },
                {
                  title: 'Instagram',
                  subtext: 'Embed an Instagram post',
                  onItemClick: () => {
                    const cur = editor.getTextCursorPosition().block;
                    editor.insertBlocks(
                      [{ type: 'instagramEmbed' as const, props: { postId: '' } }],
                      cur,
                      'after',
                    );
                  },
                  group: 'Embeds',
                  icon: <Instagram size={18} />,
                  aliases: ['instagram', 'ig', 'insta'],
                },
              ],
              query,
            )
          }
        />
      </BlockNoteView>
    </div>
  );
}

export { schema };
