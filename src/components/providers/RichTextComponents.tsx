import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import urlForImage from '@/u/urlForImage';
import InlineFactCheckCard from '@/components/fact-check/InlineFactCheckCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// Code-split heavy embed libraries â€” loaded only when content contains these block types
// Tweet embeds go through SafeTweet (RSC existence check) â†’ SafeTweetWrapper
// (client-only, ssr:false + error boundary) to prevent SSG build crashes.
import SafeTweet from '@/components/embeds/SafeTweet';
const SyntaxHighlighter = dynamic(() => import('react-syntax-highlighter').then((m) => m.Prism));
import InstagramEmbed from './InstagramEmbed';
import FacebookEmbed from './FacebookEmbed';
import TikTokEmbed from './TikTokEmbed';

import type {
  PortableImageBlock,
  PortableCodeBlock,
  PortableMermaidDiagramBlock,
  PortableTableBlock,
  PortableTableCell,
  PortableListBlock,
  PortableBlockquoteBlock,
  PortableYoutubeEmbedBlock,
  PortableTwitterEmbedBlock,
  PortableInstagramEmbedBlock,
  PortableFacebookEmbedBlock,
  PortableTiktokEmbedBlock,
  PortableVimeoEmbedBlock,
  PortableIframeEmbedBlock,
  PortableFactCheckEmbedBlock,
  PortableTextListRenderer,
  PortableTextBlockStyleRenderer,
  PortableTextMarkRenderer,
} from '@/models/types/portableText';

export default {
  types: {
    // â”€â”€ Images â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    image: ({ value }: { value: PortableImageBlock }) => {
      const alt = value.alt ?? 'Image';
      // Sanity asset refs encode dimensions: image-{id}-{WIDTH}x{HEIGHT}-{ext}
      const ref: string = value?.asset?._ref ?? '';
      const dimMatch = ref.match(/-(\d+)x(\d+)-/);
      const imgWidth = dimMatch ? parseInt(dimMatch[1]) : 1200;
      const imgHeight = dimMatch ? parseInt(dimMatch[2]) : 630;
      return (
        <div className='my-6 space-y-2'>
          <div className='w-full border border-slate-300 dark:border-slate-700'>
            <Image
              className='h-full w-full'
              src={urlForImage(value)?.url() ?? ''}
              alt={alt}
              width={imgWidth}
              height={imgHeight}
              style={{ width: '100%', height: 'auto' }}
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px'
            />
          </div>
          {alt && (
            <div className='flex justify-center'>
              <p className='border border-slate-300 bg-slate-100 px-3 py-0.5 text-xs font-light text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'>
                {alt}
              </p>
            </div>
          )}
        </div>
      );
    },

    // â”€â”€ Code Blocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    code: ({ value }: { value: PortableCodeBlock }) => {
      const { code, language } = value;
      if (!code) {
        return null;
      }
      return (
        <div className='my-6'>
          {language && (
            <div className='border border-b-0 border-slate-700 bg-slate-800 px-4 py-1.5'>
              <span className='font-mono text-xs font-medium uppercase tracking-widest text-untele'>
                {language}
              </span>
            </div>
          )}
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={language ?? 'text'}
            PreTag='div'
            customStyle={{ margin: 0, borderRadius: 0 }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    },

    // â”€â”€ Tables â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    table: ({ value }: { value: PortableTableBlock }) => {
      const { rows } = value;
      if (!rows) {
        return null;
      }

      // Handles both new string cells and legacy tableCell objects
      // {_key, _type, content: [{type:'block', children:[{_type:'span', text}]}]}
      function cellText(cell: string | PortableTableCell): string {
        if (typeof cell === 'string') {
          return cell;
        }
        if (cell && Array.isArray(cell.content)) {
          return cell.content
            .flatMap((block) =>
              (block.children ?? [])
                .filter((s) => s._type === 'span')
                .map((s) => s.text ?? '')
            )
            .join('');
        }
        return '';
      }

      return (
        <div className='mx-auto my-4 max-w-full overflow-x-auto rounded-md border'>
          <Table className='w-full'>
            <TableHeader>
              <TableRow>
                {rows[0]?.cells.map((cell, i: number) => (
                  <TableHead
                    key={i}
                    className='whitespace-nowrap bg-untele p-2 text-sm font-semibold text-white md:px-4 md:py-2'
                  >
                    {cellText(cell)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(1).map((row, i: number) => (
                <TableRow key={i}>
                  {row.cells.map((cell, j: number) => (
                    <TableCell key={j} className='p-2 text-sm md:px-4 md:py-2'>
                      {cellText(cell)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    },

    // â”€â”€ Mermaid Diagrams â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Falls back to a styled code block until the mermaid package is installed
    mermaidDiagram: ({ value }: { value: PortableMermaidDiagramBlock }) => {
      const { code } = value;
      return (
        <div className='my-6 border border-slate-300 dark:border-slate-700'>
          <div className='border-b border-slate-300 bg-slate-100 px-4 py-1.5 dark:border-slate-700 dark:bg-slate-800'>
            <span className='font-mono text-xs font-medium uppercase tracking-widest text-untele'>
              Diagram
            </span>
          </div>
          <pre className='overflow-x-auto bg-slate-950 p-4 font-mono text-sm text-slate-300'>
            {code}
          </pre>
        </div>
      );
    },

    // â”€â”€ Non-standard "list" container blocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Blocks where _type="list" were inserted programmatically with inner block
    // children. PortableText treats them as blocks, causing "Objects are not
    // valid as a React child" errors. Render them as proper lists here.
    list: ({ value }: { value: PortableListBlock }) => {
      const isOrdered = value.listItem === 'number' || value.style === 'number';
      const Tag = isOrdered ? 'ol' : 'ul';
      const blocks = value.children ?? [];
      if (!blocks.length) {
        return null;
      }
      return (
        <Tag
          className={`my-4 ml-6 ${isOrdered ? 'list-decimal' : 'list-disc'} space-y-2 text-slate-800 dark:text-slate-200`}
        >
          {blocks.map((block, i: number) => {
            const text = (block.children ?? [])
              .filter((s) => s._type === 'span')
              .map((s) => s.text ?? '')
              .join('');
            return <li key={block._key ?? i}>{text}</li>;
          })}
        </Tag>
      );
    },

    // â”€â”€ Non-standard "blockquote" container blocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Blocks where _type="blockquote" have inner block children instead of the
    // standard style="blockquote" pattern. Extract and render as blockquote.
    blockquote: ({ value }: { value: PortableBlockquoteBlock }) => {
      const text = (value.children ?? [])
        .flatMap((block) =>
          (block.children ?? [])
            .filter((s) => s._type === 'span')
            .map((s) => s.text ?? '')
        )
        .join('');
      return (
        <blockquote className='my-6 border-l-4 border-untele bg-slate-50 py-4 pl-6 pr-4 italic text-slate-700 dark:bg-slate-900 dark:text-slate-300'>
          {text}
        </blockquote>
      );
    },

    // â”€â”€ YouTube Embeds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    youtubeEmbed: ({ value }: { value: PortableYoutubeEmbedBlock }) => {
      const videoId = value.videoId;
      return (
        <div className='my-8 aspect-video w-full border border-slate-300 dark:border-slate-700'>
          <iframe
            className='h-full w-full'
            src={`https://www.youtube.com/embed/${videoId}`}
            title='YouTube Video'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          ></iframe>
        </div>
      );
    },

    // â”€â”€ Twitter/X Embeds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // SafeTweet is an async RSC that catches deleted/protected tweet errors so
    // a single bad tweet can't crash the entire article static generation.
    twitterEmbed: ({ value }: { value: PortableTwitterEmbedBlock }) => {
      const tweetId = value.tweetId;
      if (!tweetId) {
        return null;
      }
      return <SafeTweet id={tweetId} />;
    },

    // â”€â”€ Inline Fact-Check Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    factCheckEmbed: ({ value }: { value: PortableFactCheckEmbedBlock }) => {
      const fc = value?.factCheck;
      if (!fc) {
        return null;
      }
      // fc is a populated FactCheck object from GROQ query
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <InlineFactCheckCard factCheck={fc as any} />;
    },

    // â”€â”€ Instagram Embeds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    instagramEmbed: ({ value }: { value: PortableInstagramEmbedBlock }) => {
      const postId = value.postId;
      return <InstagramEmbed postId={postId} />;
    },

    // â”€â”€ Facebook Embeds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    facebookEmbed: ({ value }: { value: PortableFacebookEmbedBlock }) => {
      const postUrl = value.postUrl;
      return <FacebookEmbed postUrl={postUrl} />;
    },

    // â”€â”€ TikTok Embeds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    tiktokEmbed: ({ value }: { value: PortableTiktokEmbedBlock }) => {
      const videoUrl = value.videoUrl;
      return <TikTokEmbed videoUrl={videoUrl} />;
    },

    // â”€â”€ Vimeo Embeds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    vimeoEmbed: ({ value }: { value: PortableVimeoEmbedBlock }) => {
      const { videoId } = value;
      if (!videoId) {
        return null;
      }
      return (
        <div className='my-8 aspect-video w-full border border-slate-300 dark:border-slate-700'>
          <iframe
            className='h-full w-full'
            src={`https://player.vimeo.com/video/${videoId}`}
            title='Vimeo Video'
            allow='autoplay; fullscreen; picture-in-picture'
            allowFullScreen
          ></iframe>
        </div>
      );
    },

    // â”€â”€ Custom Iframe Embeds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Note: Some sites (e.g., ABC7 Chicago) block embedding with X-Frame-Options.
    // If embed fails, the iframe will show a blocked message. Sites may need to be
    // contacted to allow cross-origin embedding, or use their specific embed code.
    iframeEmbed: ({ value }: { value: PortableIframeEmbedBlock }) => {
      const { src, width = 640, height = 360, title } = value;
      if (!src) {
        return null;
      }
      return (
        <div
          className='my-8 w-full border border-slate-300 dark:border-slate-700'
          style={{
            aspectRatio: `${width} / ${height}`,
          }}
        >
          <iframe
            className='h-full w-full'
            src={src}
            title={title ?? 'Embedded content'}
            frameBorder='0'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
            allowFullScreen
            sandbox='allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation'
            style={{ backgroundColor: '#f3f4f6' }}
          ></iframe>
        </div>
      );
    },
  },

  // â”€â”€ List Renderers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  list: {
    bullet: ({ children }: PortableTextListRenderer) => (
      <ul className='my-4 ml-6 list-disc space-y-2 text-slate-800 dark:text-slate-200'>
        {children}
      </ul>
    ),
    number: ({ children }: PortableTextListRenderer) => (
      <ol className='my-4 ml-6 list-decimal space-y-2 text-slate-800 dark:text-slate-200'>
        {children}
      </ol>
    ),
  },

  // â”€â”€ Block Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  block: {
    normal: ({ children }: PortableTextBlockStyleRenderer) => (
      <p className='my-4 leading-relaxed text-slate-800 dark:text-slate-200'>{children}</p>
    ),
    h1: ({ children }: PortableTextBlockStyleRenderer) => (
      <h1 className='mb-4 mt-8 text-4xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-5xl'>
        {children}
      </h1>
    ),
    h2: ({ children }: PortableTextBlockStyleRenderer) => (
      <h2 className='mb-3 mt-8 border-b-2 border-untele pb-2 text-3xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-4xl'>
        {children}
      </h2>
    ),
    h3: ({ children }: PortableTextBlockStyleRenderer) => (
      <h3 className='mb-3 mt-6 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl'>
        {children}
      </h3>
    ),
    h4: ({ children }: PortableTextBlockStyleRenderer) => (
      <h4 className='mb-2 mt-6 text-xl font-bold text-slate-900 dark:text-white md:text-2xl'>
        {children}
      </h4>
    ),
    blockquote: ({ children }: PortableTextBlockStyleRenderer) => (
      <blockquote className='my-6 border-l-4 border-untele bg-slate-50 py-4 pl-6 pr-4 italic text-slate-700 dark:bg-slate-900 dark:text-slate-300'>
        {children}
      </blockquote>
    ),
    // Fallback styles for list items authored as styled blocks (non-standard content)
    bullet: ({ children }: PortableTextBlockStyleRenderer) => (
      <ul className='my-4 ml-6 list-disc space-y-2 text-slate-800 dark:text-slate-200'>
        <li>{children}</li>
      </ul>
    ),
    number: ({ children }: PortableTextBlockStyleRenderer) => (
      <ol className='my-4 ml-6 list-decimal space-y-2 text-slate-800 dark:text-slate-200'>
        <li>{children}</li>
      </ol>
    ),
    break: () => <br />,
  },

  // â”€â”€ Inline Marks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  marks: {
    link: ({ children, value }: PortableTextMarkRenderer) => {
      const rel = !value?.href?.startsWith('/') ? 'noreferrer noopener' : undefined;
      return (
        <Link
          href={value?.href ?? '#'}
          rel={rel}
          className='text-untele underline decoration-untele underline-offset-2 hover:text-red-700 hover:decoration-red-700'
        >
          {children}
        </Link>
      );
    },
    blockquote: ({ children }: PortableTextMarkRenderer) => (
      <blockquote className='my-5 border-l-4 border-untele py-5 pl-5 italic'>
        {children}
      </blockquote>
    ),
    code: ({ children }: PortableTextMarkRenderer) => (
      <code className='rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-untele dark:bg-slate-800 dark:text-red-400'>
        {children}
      </code>
    ),
    em: ({ children }: PortableTextMarkRenderer) => <em className='italic'>{children}</em>,
    strong: ({ children }: PortableTextMarkRenderer) => <strong className='font-bold'>{children}</strong>,
    underline: ({ children }: PortableTextMarkRenderer) => <u className='underline'>{children}</u>,
    strikethrough: ({ children }: PortableTextMarkRenderer) => <s className='line-through'>{children}</s>,
    superscript: ({ children }: PortableTextMarkRenderer) => <sup>{children}</sup>,
    subscript: ({ children }: PortableTextMarkRenderer) => <sub>{children}</sub>,
  },
};
