'use client';
// SafeTweetWrapper — client component that renders react-tweet's <Tweet> with
// a class-based error boundary. The dynamic import uses ssr:false so <Tweet>
// is NEVER rendered server-side (SSR/SSG), preventing "TypeError: c is not
// iterable" from crashing builds when a tweet has malformed entity data.
import { Component, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Loaded only on the client — never during static generation
const Tweet = dynamic(() => import('react-tweet').then((m) => m.Tweet), {
  ssr: false,
  loading: () => (
    <div className='h-28 w-full max-w-[550px] animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800' />
  ),
});

interface BoundaryProps {
  id: string;
  children: ReactNode;
}

interface BoundaryState {
  error: boolean;
}

class TweetBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: false };

  static getDerivedStateFromError(): BoundaryState {
    return { error: true };
  }

  render() {
    if (this.state.error) {
      return (
        <div className='max-w-[550px] rounded-lg border border-slate-300 bg-slate-50 px-6 py-5 text-center dark:border-slate-700 dark:bg-slate-900'>
          <p className='mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300'>
            This tweet could not be displayed
          </p>
          <a
            href={`https://x.com/i/web/status/${this.props.id}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs text-untele underline hover:text-red-600'
          >
            View on X →
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SafeTweetWrapper({ id }: { id: string }) {
  return (
    <TweetBoundary id={id}>
      <Tweet id={id} />
    </TweetBoundary>
  );
}
