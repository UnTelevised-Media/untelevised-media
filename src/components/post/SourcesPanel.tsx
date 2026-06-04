// src/components/post/SourcesPanel.tsx
// SSR-safe collapsible sources & methodology panel.
// Uses native <details>/<summary> — works without JavaScript.
import {
  FileText,
  Mic,
  MessageSquare,
  Database,
  Video,
  Eye,
  HelpCircle,
  Shield,
  ExternalLink,
  Newspaper,
} from 'lucide-react';

const SOURCE_CONFIG: Record<string, { label: string; Icon: React.ElementType }> = {
  document: { label: 'Document', Icon: FileText },
  interview: { label: 'Interview', Icon: Mic },
  statement: { label: 'Statement', Icon: MessageSquare },
  data: { label: 'Data', Icon: Database },
  media: { label: 'Video / Audio', Icon: Video },
  onscene: { label: 'On-Scene', Icon: Eye },
  article: { label: 'News Article', Icon: Newspaper },
  other: { label: 'Source', Icon: HelpCircle },
};

interface SourcesPanelProps {
  sources?: ArticleSource[];
  methodology?: string;
}

export function SourcesPanel({ sources, methodology }: SourcesPanelProps) {
  const hasSources = sources && sources.length > 0;
  if (!hasSources && !methodology) return null;

  const count = sources?.length ?? 0;

  return (
    <section
      className='my-8 border border-slate-200 dark:border-slate-700'
      aria-label='Sources and methodology'
    >
      <details>
        <summary className='flex cursor-pointer select-none items-center justify-between bg-slate-100 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'>
          <span>
            Sources &amp; Methodology
            {count > 0 && (
              <span className='ml-2 font-normal normal-case tracking-normal text-slate-500 dark:text-slate-400'>
                ({count} source{count !== 1 ? 's' : ''})
              </span>
            )}
          </span>
          <span className='text-slate-400 dark:text-slate-500' aria-hidden='true'>
            ▾
          </span>
        </summary>

        <div className='divide-y divide-slate-100 dark:divide-slate-800'>
          {hasSources && (
            <ul className='space-y-3 px-4 py-3'>
              {sources.map((source, idx) => {
                const config = SOURCE_CONFIG[source.type ?? 'other'] ?? SOURCE_CONFIG.other;
                const { Icon } = config;

                if (source.isAnonymous) {
                  return (
                    <li key={idx} className='flex items-start gap-3'>
                      <Shield
                        className='mt-0.5 h-4 w-4 shrink-0 text-slate-400'
                        aria-hidden='true'
                      />
                      <div>
                        <span className='text-sm font-medium text-slate-600 dark:text-slate-400'>
                          Anonymous {config.label}
                        </span>
                        <p className='mt-0.5 text-xs text-slate-500 dark:text-slate-500'>
                          Identity protected per editorial policy
                        </p>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={idx} className='flex items-start gap-3'>
                    <Icon className='mt-0.5 h-4 w-4 shrink-0 text-slate-400' aria-hidden='true' />
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        {source.url ? (
                          <a
                            href={source.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-1 text-sm font-medium text-untele hover:underline'
                          >
                            {source.label}
                            <ExternalLink className='h-3 w-3' aria-hidden='true' />
                          </a>
                        ) : (
                          <span className='text-sm font-medium text-slate-800 dark:text-slate-200'>
                            {source.label}
                          </span>
                        )}
                        {source.type && (
                          <span className='bg-slate-100 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:bg-slate-800 dark:text-slate-400'>
                            {config.label}
                          </span>
                        )}
                      </div>
                      {source.description && (
                        <p className='mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400'>
                          {source.description}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {methodology && (
            <blockquote className='mx-4 my-3 border-l-2 border-slate-300 px-4 py-3 dark:border-slate-600'>
              <p className='mb-1 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                Methodology
              </p>
              <p className='text-sm italic leading-relaxed text-slate-600 dark:text-slate-300'>
                {methodology}
              </p>
            </blockquote>
          )}
        </div>
      </details>
    </section>
  );
}
