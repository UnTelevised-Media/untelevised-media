// src/components/portal/RichTextEditor.tsx
// BlockNote WYSIWYG editor with custom embed blocks for YouTube, Twitter,
// Instagram, Facebook, TikTok, Vimeo, custom iframes, and full table / code
// support. The default image block is overridden to upload to Sanity instead
// of accepting a pasted URL.
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
import { useState, useCallback, useRef } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import {
  Video,
  MessageSquare,
  Camera,
  Globe,
  Music,
  Play,
  Image as ImageIcon,
  Frame,
} from 'lucide-react';

// ─── Utility: extract YouTube video ID from URL or bare ID ───────────────────

function parseYouTubeId(input: string): string {
  const url = input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) {return m[1];}
  }
  // Assume bare ID if it looks like one
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) {return url;}
  return url;
}

// ─── Custom block: YouTube embed ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function YouTubeEmbedRenderer({ block, editor }: any) {
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
        onClick={() => {
          setDraft(block.props.videoId);
          setEditing(true);
        }}
        className='mt-1 text-xs text-slate-400 underline hover:text-untele'
      >
        Change video
      </button>
    </div>
  );
}

const YouTubeBlock = createReactBlockSpec(
  {
    type: 'youtubeEmbed' as const,
    propSchema: { videoId: { default: '' } },
    content: 'none',
  },
  {
    render: (props) => <YouTubeEmbedRenderer {...props} />,
  }
);

// ─── Custom block: Twitter / X embed ─────────────────────────────────────────

function parseTweetId(input: string): string {
  const m = input.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  if (m) {return m[1];}
  if (/^\d+$/.test(input.trim())) {return input.trim();}
  return input.trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TwitterEmbedRenderer({ block, editor }: any) {
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
        onClick={() => {
          setDraft(block.props.tweetId);
          setEditing(true);
        }}
        className='mt-1 text-xs text-slate-400 underline hover:text-untele'
      >
        Change tweet
      </button>
    </div>
  );
}

const TwitterBlock = createReactBlockSpec(
  {
    type: 'twitterEmbed' as const,
    propSchema: { tweetId: { default: '' } },
    content: 'none',
  },
  {
    render: (props) => <TwitterEmbedRenderer {...props} />,
  }
);

// ─── Custom block: Instagram embed ───────────────────────────────────────────

function parseInstagramId(input: string): string {
  const m = input.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/);
  if (m) {return m[1];}
  return input.trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function InstagramEmbedRenderer({ block, editor }: any) {
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
        onClick={() => {
          setDraft(block.props.postId);
          setEditing(true);
        }}
        className='mt-1 text-xs text-slate-400 underline hover:text-untele'
      >
        Change post
      </button>
    </div>
  );
}

const InstagramBlock = createReactBlockSpec(
  {
    type: 'instagramEmbed' as const,
    propSchema: { postId: { default: '' } },
    content: 'none',
  },
  {
    render: (props) => <InstagramEmbedRenderer {...props} />,
  }
);

// ─── Custom block: Facebook embed ────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FacebookEmbedRenderer({ block, editor }: any) {
  const [editing, setEditing] = useState(!block.props.postUrl);
  const [draft, setDraft] = useState(block.props.postUrl);

  function handleSave() {
    editor.updateBlock(block, { props: { postUrl: draft.trim() } });
    setEditing(false);
  }

  if (editing || !block.props.postUrl) {
    return (
      <div className='my-2 rounded border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900'>
        <p className='mb-2 text-xs font-bold uppercase tracking-widest text-slate-500'>
          Facebook Embed
        </p>
        <div className='flex gap-2'>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder='Facebook post URL…'
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
        src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(block.props.postUrl)}&show_text=true&width=500`}
        className='min-h-[300px] w-full max-w-lg border-0'
        scrolling='no'
      />
      <button
        type='button'
        onClick={() => {
          setDraft(block.props.postUrl);
          setEditing(true);
        }}
        className='mt-1 text-xs text-slate-400 underline hover:text-untele'
      >
        Change post
      </button>
    </div>
  );
}

const FacebookBlock = createReactBlockSpec(
  {
    type: 'facebookEmbed' as const,
    propSchema: { postUrl: { default: '' } },
    content: 'none',
  },
  {
    render: (props) => <FacebookEmbedRenderer {...props} />,
  }
);

// ─── Custom block: TikTok embed ──────────────────────────────────────────────

function parseTikTokVideoId(input: string): string | null {
  const m = input.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (m) {return m[1];}
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TikTokEmbedRenderer({ block, editor }: any) {
  const [editing, setEditing] = useState(!block.props.videoUrl);
  const [draft, setDraft] = useState(block.props.videoUrl);

  function handleSave() {
    editor.updateBlock(block, { props: { videoUrl: draft.trim() } });
    setEditing(false);
  }

  if (editing || !block.props.videoUrl) {
    return (
      <div className='my-2 rounded border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900'>
        <p className='mb-2 text-xs font-bold uppercase tracking-widest text-slate-500'>
          TikTok Embed
        </p>
        <div className='flex gap-2'>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder='TikTok video URL…'
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

  const videoId = parseTikTokVideoId(block.props.videoUrl);

  return (
    <div className='my-2 flex flex-col items-center'>
      {videoId ? (
        <iframe
          src={`https://www.tiktok.com/embed/v2/${videoId}`}
          className='min-h-[500px] w-full max-w-sm border-0'
          allow='encrypted-media'
        />
      ) : (
        <div className='w-full max-w-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'>
          TikTok: {block.props.videoUrl}
        </div>
      )}
      <button
        type='button'
        onClick={() => {
          setDraft(block.props.videoUrl);
          setEditing(true);
        }}
        className='mt-1 text-xs text-slate-400 underline hover:text-untele'
      >
        Change video
      </button>
    </div>
  );
}

const TikTokBlock = createReactBlockSpec(
  {
    type: 'tiktokEmbed' as const,
    propSchema: { videoUrl: { default: '' } },
    content: 'none',
  },
  {
    render: (props) => <TikTokEmbedRenderer {...props} />,
  }
);

// ─── Custom block: Vimeo embed ───────────────────────────────────────────────

function parseVimeoId(input: string): string {
  const m = input.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) {return m[1];}
  if (/^\d+$/.test(input.trim())) {return input.trim();}
  return input.trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function VimeoEmbedRenderer({ block, editor }: any) {
  const [editing, setEditing] = useState(!block.props.videoId);
  const [draft, setDraft] = useState(block.props.videoId);

  function handleSave() {
    editor.updateBlock(block, { props: { videoId: parseVimeoId(draft) } });
    setEditing(false);
  }

  if (editing || !block.props.videoId) {
    return (
      <div className='my-2 rounded border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900'>
        <p className='mb-2 text-xs font-bold uppercase tracking-widest text-slate-500'>
          Vimeo Embed
        </p>
        <div className='flex gap-2'>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder='Vimeo URL or video ID…'
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
          src={`https://player.vimeo.com/video/${block.props.videoId}`}
          allow='autoplay; fullscreen; picture-in-picture'
          allowFullScreen
          className='h-full w-full'
        />
      </div>
      <button
        type='button'
        onClick={() => {
          setDraft(block.props.videoId);
          setEditing(true);
        }}
        className='mt-1 text-xs text-slate-400 underline hover:text-untele'
      >
        Change video
      </button>
    </div>
  );
}

const VimeoBlock = createReactBlockSpec(
  {
    type: 'vimeoEmbed' as const,
    propSchema: { videoId: { default: '' } },
    content: 'none',
  },
  {
    render: (props) => <VimeoEmbedRenderer {...props} />,
  }
);

// ─── Custom block: Sanity-hosted image (replaces BlockNote's URL-based image) ─
// Same block type name ("image") and prop shape (url, caption) as BlockNote's
// default image block, so the existing serializer's `image` case keeps working
// unchanged — only the editing UI differs: authors upload a file through our
// own Sanity asset endpoint instead of pasting an external URL.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SanityImageRenderer({ block, editor }: any) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/portal/upload-image', { method: 'POST', body: fd });
      const data = (await res.json()) as { assetId?: string; url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error ?? 'Image upload failed');
        return;
      }
      editor.updateBlock(block, { props: { url: data.url } });
    } catch {
      toast.error('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  const fileInput = (
    <input
      ref={inputRef}
      type='file'
      accept='image/jpeg,image/png,image/webp,image/gif,image/avif'
      className='hidden'
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          void handleFile(file);
        }
        e.target.value = '';
      }}
    />
  );

  if (!block.props.url) {
    return (
      <div className='my-2 w-full rounded border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900'>
        <p className='mb-2 text-xs font-bold uppercase tracking-widest text-slate-500'>Image</p>
        {fileInput}
        <button
          type='button'
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={`border border-slate-300 px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors hover:border-untele dark:border-slate-600 ${uploading ? 'opacity-50' : ''}`}
        >
          {uploading ? 'Uploading…' : 'Upload Image'}
        </button>
      </div>
    );
  }

  return (
    <div className='my-2'>
      {fileInput}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={block.props.url} alt={block.props.caption || ''} className='max-w-full' />
      <input
        value={block.props.caption}
        onChange={(e) => editor.updateBlock(block, { props: { caption: e.target.value } })}
        placeholder='Alt text / caption…'
        className='mt-1 w-full border border-slate-300 bg-white px-2 py-1 text-sm focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800'
      />
      <div className='mt-1 flex gap-3'>
        <button
          type='button'
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className='text-xs text-slate-400 underline hover:text-untele'
        >
          {uploading ? 'Uploading…' : 'Replace image'}
        </button>
        <button
          type='button'
          onClick={() => editor.updateBlock(block, { props: { url: '', caption: '' } })}
          className='text-xs text-slate-400 underline hover:text-red-500'
        >
          Remove
        </button>
      </div>
    </div>
  );
}

const SanityImageBlock = createReactBlockSpec(
  {
    type: 'image' as const,
    propSchema: { url: { default: '' }, caption: { default: '' } },
    content: 'none',
  },
  {
    render: (props) => <SanityImageRenderer {...props} />,
  }
);

// ─── Custom block: Iframe embed ──────────────────────────────────────────────
// Mirrors the `iframeEmbed` Sanity schema type (src, width, height, title) used
// for embedding external players/widgets that don't have a dedicated block above.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function IframeEmbedRenderer({ block, editor }: any) {
  const [editing, setEditing] = useState(!block.props.src);
  const [draftSrc, setDraftSrc] = useState(block.props.src);
  const [draftWidth, setDraftWidth] = useState(String(block.props.width || 640));
  const [draftHeight, setDraftHeight] = useState(String(block.props.height || 360));
  const [draftTitle, setDraftTitle] = useState(block.props.title);

  function handleSave() {
    if (!draftSrc.trim()) {
      return;
    }
    editor.updateBlock(block, {
      props: {
        src: draftSrc.trim(),
        width: Number(draftWidth) || 640,
        height: Number(draftHeight) || 360,
        title: draftTitle.trim(),
      },
    });
    setEditing(false);
  }

  if (editing || !block.props.src) {
    return (
      <div className='my-2 rounded border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900'>
        <p className='mb-2 text-xs font-bold uppercase tracking-widest text-slate-500'>
          Iframe Embed
        </p>
        <div className='space-y-2'>
          <input
            value={draftSrc}
            onChange={(e) => setDraftSrc(e.target.value)}
            placeholder='Embed URL (https://…)'
            className='w-full border border-slate-300 bg-white px-2 py-1 text-sm focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800'
          />
          <div className='flex gap-2'>
            <input
              value={draftWidth}
              onChange={(e) => setDraftWidth(e.target.value)}
              placeholder='Width (px)'
              inputMode='numeric'
              className='w-1/2 border border-slate-300 bg-white px-2 py-1 text-sm focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800'
            />
            <input
              value={draftHeight}
              onChange={(e) => setDraftHeight(e.target.value)}
              placeholder='Height (px)'
              inputMode='numeric'
              className='w-1/2 border border-slate-300 bg-white px-2 py-1 text-sm focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800'
            />
          </div>
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder='Title (for accessibility)'
            className='w-full border border-slate-300 bg-white px-2 py-1 text-sm focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800'
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

  const width = block.props.width || 640;
  const height = block.props.height || 360;

  return (
    <div className='my-2'>
      <div
        className='w-full border border-slate-300 dark:border-slate-700'
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <iframe
          src={block.props.src}
          title={block.props.title || 'Embedded content'}
          className='h-full w-full'
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
          allowFullScreen
        />
      </div>
      <button
        type='button'
        onClick={() => {
          setDraftSrc(block.props.src);
          setDraftWidth(String(block.props.width || 640));
          setDraftHeight(String(block.props.height || 360));
          setDraftTitle(block.props.title);
          setEditing(true);
        }}
        className='mt-1 text-xs text-slate-400 underline hover:text-untele'
      >
        Edit embed
      </button>
    </div>
  );
}

const IframeEmbedBlock = createReactBlockSpec(
  {
    type: 'iframeEmbed' as const,
    propSchema: {
      src: { default: '' },
      width: { default: 640, type: 'number' },
      height: { default: 360, type: 'number' },
      title: { default: '' },
    },
    content: 'none',
  },
  {
    render: (props) => <IframeEmbedRenderer {...props} />,
  }
);

// ─── BlockNote schema with custom blocks ─────────────────────────────────────

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    // Overrides BlockNote's default URL-based image block — same type/prop
    // names, so the serializer's existing `image` mapping needs no changes.
    image: SanityImageBlock(),
    youtubeEmbed: YouTubeBlock(),
    twitterEmbed: TwitterBlock(),
    instagramEmbed: InstagramBlock(),
    facebookEmbed: FacebookBlock(),
    tiktokEmbed: TikTokBlock(),
    vimeoEmbed: VimeoBlock(),
    iframeEmbed: IframeEmbedBlock(),
  },
});

// ─── Unknown-block guard ─────────────────────────────────────────────────────
// BlockNote throws during editor creation if `initialContent` contains a block
// type missing from the schema ("Cannot read properties of undefined (reading
// 'isInGroup')"), which took down the whole editor page. Degrade unknown types
// to a visible placeholder paragraph instead — same convention the serializer
// uses for Sanity types it can't map.

const schemaBlockTypes = new Set(Object.keys(schema.blockSchema));

function sanitizeUnknownBlocks(blocks: object[]): object[] {
  return blocks.map((raw) => {
    const block = raw as { type?: string; children?: object[] };
    if (block.type && !schemaBlockTypes.has(block.type)) {
      return {
        type: 'paragraph',
        props: {},
        content: [
          {
            type: 'text',
            text: `[${block.type} — edit in Sanity Studio]`,
            styles: { italic: true },
          },
        ],
        children: [],
      };
    }
    if (block.children?.length) {
      return { ...block, children: sanitizeUnknownBlocks(block.children) };
    }
    return raw;
  });
}

// DefaultReactSuggestionItem strips `key` from its public type even though
// the runtime objects always carry one (used to identify which default block
// each item inserts) — restore it here so filtering by key type-checks.
type SlashMenuItemWithKey = ReturnType<typeof getDefaultReactSlashMenuItems>[number] & {
  key?: string;
};

// ─── Component props ──────────────────────────────────────────────────────────

interface Props {
  initialContent?: object[]; // PartialBlock[] from portableTextToBlockNote
  onChange?: (_blocks: object[]) => void;
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
  const initialContentValue = initialContent?.length
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sanitizeUnknownBlocks(initialContent) as any)
    : undefined;
  const editor = useCreateBlockNote({
    schema,
    initialContent: initialContentValue,
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
                // Drop BlockNote's built-in "Image" item — it inserts the
                // default URL-based image block. Our own item below inserts
                // the Sanity-upload-backed override registered under the
                // same "image" type.
                ...(getDefaultReactSlashMenuItems(editor) as SlashMenuItemWithKey[]).filter(
                  (item) => item.key !== 'image'
                ),
                {
                  title: 'Image',
                  subtext: 'Upload an image from your device',
                  onItemClick: () => {
                    const cur = editor.getTextCursorPosition().block;
                    editor.insertBlocks(
                      [{ type: 'image' as const, props: { url: '', caption: '' } }],
                      cur,
                      'after'
                    );
                  },
                  group: 'Media',
                  icon: <ImageIcon size={18} />,
                  aliases: ['image', 'photo', 'picture', 'upload'],
                },
                {
                  title: 'YouTube',
                  subtext: 'Embed a YouTube video',
                  onItemClick: () => {
                    const cur = editor.getTextCursorPosition().block;
                    editor.insertBlocks(
                      [{ type: 'youtubeEmbed' as const, props: { videoId: '' } }],
                      cur,
                      'after'
                    );
                  },
                  group: 'Embeds',
                  icon: <Video size={18} />,
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
                      'after'
                    );
                  },
                  group: 'Embeds',
                  icon: <MessageSquare size={18} />,
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
                      'after'
                    );
                  },
                  group: 'Embeds',
                  icon: <Camera size={18} />,
                  aliases: ['instagram', 'ig', 'insta'],
                },
                {
                  title: 'Facebook',
                  subtext: 'Embed a Facebook post',
                  onItemClick: () => {
                    const cur = editor.getTextCursorPosition().block;
                    editor.insertBlocks(
                      [{ type: 'facebookEmbed' as const, props: { postUrl: '' } }],
                      cur,
                      'after'
                    );
                  },
                  group: 'Embeds',
                  icon: <Globe size={18} />,
                  aliases: ['facebook', 'fb'],
                },
                {
                  title: 'TikTok',
                  subtext: 'Embed a TikTok video',
                  onItemClick: () => {
                    const cur = editor.getTextCursorPosition().block;
                    editor.insertBlocks(
                      [{ type: 'tiktokEmbed' as const, props: { videoUrl: '' } }],
                      cur,
                      'after'
                    );
                  },
                  group: 'Embeds',
                  icon: <Music size={18} />,
                  aliases: ['tiktok', 'tt'],
                },
                {
                  title: 'Vimeo',
                  subtext: 'Embed a Vimeo video',
                  onItemClick: () => {
                    const cur = editor.getTextCursorPosition().block;
                    editor.insertBlocks(
                      [{ type: 'vimeoEmbed' as const, props: { videoId: '' } }],
                      cur,
                      'after'
                    );
                  },
                  group: 'Embeds',
                  icon: <Play size={18} />,
                  aliases: ['vimeo'],
                },
                {
                  title: 'Iframe Embed',
                  subtext: 'Embed external content via a custom iframe',
                  onItemClick: () => {
                    const cur = editor.getTextCursorPosition().block;
                    editor.insertBlocks(
                      [
                        {
                          type: 'iframeEmbed' as const,
                          props: { src: '', width: 640, height: 360, title: '' },
                        },
                      ],
                      cur,
                      'after'
                    );
                  },
                  group: 'Embeds',
                  icon: <Frame size={18} />,
                  aliases: ['iframe', 'embed', 'custom embed'],
                },
              ],
              query
            )
          }
        />
      </BlockNoteView>
    </div>
  );
}

export { schema };
