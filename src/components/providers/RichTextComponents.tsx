/* eslint-disable react/self-closing-comp */
/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-explicit-any */

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import urlForImage from '@/u/urlForImage';
import { InlineFactCheckCard } from '@/components/fact-check/InlineFactCheckCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// Code-split heavy embed libraries — loaded only when content contains these block types
const Tweet = dynamic(() => import('react-tweet').then((m) => m.Tweet));
const SyntaxHighlighter = dynamic(() =>
  import('react-syntax-highlighter').then((m) => m.Prism),
);
import InstagramEmbed from './InstagramEmbed';

export const RichTextComponents = {
  types: {
    // ── Images ───────────────────────────────────────────────────────────────
    image: ({ value }: any) => {
      const alt = value.alt || 'Image';
      return (
        <div className='my-6 space-y-2'>
          <div className='relative h-96 w-full overflow-hidden border border-slate-300 dark:border-slate-700'>
            <Image
              className='object-cover'
              src={urlForImage(value)?.url() ?? ''}
              alt={alt}
              fill
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

    // ── Code Blocks ───────────────────────────────────────────────────────────
    code: ({ value }: any) => {
      const { code, language } = value;
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
            language={language || 'text'}
            PreTag='div'
            customStyle={{ margin: 0, borderRadius: 0 }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    },

    // ── Tables ────────────────────────────────────────────────────────────────
    table: ({ value }: any) => {
      const { rows } = value;
      if (!rows) return null;

      return (
        <div className='mx-auto my-4 max-w-full overflow-x-auto rounded-md border'>
          <Table className='w-full'>
            <TableHeader>
              <TableRow>
                {rows[0]?.cells.map((cell: string, i: number) => (
                  <TableHead
                    key={i}
                    className='whitespace-nowrap bg-untele p-2 text-sm font-semibold text-white md:px-4 md:py-2'
                  >
                    {cell}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(1).map((row: any, i: number) => (
                <TableRow key={i}>
                  {row.cells.map((cell: string, j: number) => (
                    <TableCell key={j} className='p-2 text-sm md:px-4 md:py-2'>
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    },

    // ── Mermaid Diagrams ─────────────────────────────────────────────────────
    // Falls back to a styled code block until the mermaid package is installed
    mermaidDiagram: ({ value }: any) => {
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

    // ── Non-standard "list" container blocks ─────────────────────────────────
    // Blocks where _type="list" were inserted programmatically with inner block
    // children. PortableText treats them as blocks, causing "Objects are not
    // valid as a React child" errors. Render them as proper lists here.
    list: ({ value }: any) => {
      const isOrdered = value.listItem === 'number' || value.style === 'number';
      const Tag = isOrdered ? 'ol' : 'ul';
      const blocks: any[] = value.children ?? [];
      if (!blocks.length) return null;
      return (
        <Tag
          className={`my-4 ml-6 ${isOrdered ? 'list-decimal' : 'list-disc'} space-y-2 text-slate-800 dark:text-slate-200`}
        >
          {blocks.map((block: any, i: number) => {
            const text = (block.children ?? [])
              .filter((s: any) => s._type === 'span')
              .map((s: any) => s.text ?? '')
              .join('');
            return <li key={block._key ?? i}>{text}</li>;
          })}
        </Tag>
      );
    },

    // ── Non-standard "blockquote" container blocks ────────────────────────────
    // Blocks where _type="blockquote" have inner block children instead of the
    // standard style="blockquote" pattern. Extract and render as blockquote.
    blockquote: ({ value }: any) => {
      const text = (value.children ?? [])
        .flatMap((block: any) =>
          (block.children ?? [])
            .filter((s: any) => s._type === 'span')
            .map((s: any) => s.text ?? ''),
        )
        .join('');
      return (
        <blockquote className='my-6 border-l-4 border-untele bg-slate-50 py-4 pl-6 pr-4 italic text-slate-700 dark:bg-slate-900 dark:text-slate-300'>
          {text}
        </blockquote>
      );
    },

    // ── YouTube Embeds ────────────────────────────────────────────────────────
    youtubeEmbed: ({ value }: any) => {
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

    // ── Twitter/X Embeds ─────────────────────────────────────────────────────
    twitterEmbed: ({ value }: any) => {
      const tweetId = value.tweetId;
      return (
        <div className='mx-auto my-8 flex max-w-full justify-center'>
          <Tweet id={tweetId} />
        </div>
      );
    },

    // ── Inline Fact-Check Cards ───────────────────────────────────────────────
    factCheckEmbed: ({ value }: any) => {
      const fc = value?.factCheck;
      if (!fc) return null;
      return <InlineFactCheckCard factCheck={fc} />;
    },

    // ── Instagram Embeds ─────────────────────────────────────────────────────
    instagramEmbed: ({ value }: any) => {
      const postId = value.postId;
      return <InstagramEmbed postId={postId} />;
    },
  },

  // ── List Renderers ──────────────────────────────────────────────────────────
  list: {
    bullet: ({ children }: any) => (
      <ul className='my-4 ml-6 list-disc space-y-2 text-slate-800 dark:text-slate-200'>
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className='my-4 ml-6 list-decimal space-y-2 text-slate-800 dark:text-slate-200'>
        {children}
      </ol>
    ),
  },

  // ── Block Styles ────────────────────────────────────────────────────────────
  block: {
    normal: ({ children }: any) => (
      <p className='my-4 leading-relaxed text-slate-800 dark:text-slate-200'>{children}</p>
    ),
    h1: ({ children }: any) => (
      <h1 className='mb-4 mt-8 text-4xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-5xl'>
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className='mb-3 mt-8 border-b-2 border-untele pb-2 text-3xl font-black uppercase tracking-wide text-slate-900 dark:text-white md:text-4xl'>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className='mb-3 mt-6 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl'>
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className='mb-2 mt-6 text-xl font-bold text-slate-900 dark:text-white md:text-2xl'>
        {children}
      </h4>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className='my-6 border-l-4 border-untele bg-slate-50 py-4 pl-6 pr-4 italic text-slate-700 dark:bg-slate-900 dark:text-slate-300'>
        {children}
      </blockquote>
    ),
    // Fallback styles for list items authored as styled blocks (non-standard content)
    bullet: ({ children }: any) => (
      <ul className='my-4 ml-6 list-disc space-y-2 text-slate-800 dark:text-slate-200'>
        <li>{children}</li>
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className='my-4 ml-6 list-decimal space-y-2 text-slate-800 dark:text-slate-200'>
        <li>{children}</li>
      </ol>
    ),
    break: () => <br />,
  },

  // ── Inline Marks ────────────────────────────────────────────────────────────
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value.href?.startsWith('/') ? 'noreferrer noopener' : undefined;
      return (
        <Link
          href={value.href}
          rel={rel}
          className='text-untele underline decoration-untele underline-offset-2 hover:text-red-700 hover:decoration-red-700'
        >
          {children}
        </Link>
      );
    },
    blockquote: ({ children }: any) => (
      <blockquote className='my-5 border-l-4 border-untele py-5 pl-5 italic'>
        {children}
      </blockquote>
    ),
    code: ({ children }: any) => (
      <code className='rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-untele dark:bg-slate-800 dark:text-red-400'>
        {children}
      </code>
    ),
    em: ({ children }: any) => <em className='italic'>{children}</em>,
    strong: ({ children }: any) => <strong className='font-bold'>{children}</strong>,
    underline: ({ children }: any) => <u className='underline'>{children}</u>,
    strikethrough: ({ children }: any) => <s className='line-through'>{children}</s>,
    superscript: ({ children }: any) => <sup>{children}</sup>,
    subscript: ({ children }: any) => <sub>{children}</sub>,
  },
};
