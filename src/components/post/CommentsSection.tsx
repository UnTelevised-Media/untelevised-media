// src/components/post/CommentsSection.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useConsent } from '@/lib/consent/context';
import { Lock, MessageSquare } from 'lucide-react';

interface CommentsSectionProps {
  articleId: string;
  articleUrl: string;
  allowComments?: boolean;
}

// Extend window to include Coral embed API
declare global {
  interface Window {
    Coral?: {
      createStreamEmbed: (config: Record<string, unknown>) => void;
    };
  }
}

export default function CommentsSection({
  articleId,
  articleUrl,
  allowComments = true,
}: CommentsSectionProps) {
  const { isSignedIn } = useUser();
  const { preferences } = useConsent();
  const [token, setToken] = useState<string | null>(null);
  const embedInitialized = useRef(false);

  // Gate Coral on the "preferences" (functional) consent flag
  const functionalConsent = preferences.preferences;

  // Fetch SSO token for signed-in users
  useEffect(() => {
    if (!isSignedIn) return;
    fetch('/api/coral-token')
      .then((r) => r.json())
      .then((d: { token: string | null }) => setToken(d.token))
      .catch(() => {
        // Non-critical — guest view fallback
      });
  }, [isSignedIn]);

  // Load and initialise Coral embed once consent + token state are settled
  useEffect(() => {
    if (!functionalConsent || !allowComments || embedInitialized.current) return;
    // Wait until signed-in token fetch has resolved (or user is a guest)
    if (isSignedIn && token === null) return;

    const coralUrl = process.env.NEXT_PUBLIC_CORAL_URL;
    if (!coralUrl) {
      console.warn('[CommentsSection] NEXT_PUBLIC_CORAL_URL is not set');
      return;
    }

    embedInitialized.current = true;

    const script = document.createElement('script');
    script.src = `${coralUrl}/assets/js/embed.js`;
    script.async = false;
    script.defer = true;
    script.onload = () => {
      window.Coral?.createStreamEmbed({
        id: 'coral_thread',
        rootURL: coralUrl,
        storyID: articleId,
        storyURL: articleUrl,
        ...(token ? { accessToken: token } : {}),
        autoRender: true,
      });
    };
    document.head.appendChild(script);
  }, [functionalConsent, token, isSignedIn, articleId, articleUrl, allowComments]);

  // Comments disabled by editorial decision
  if (allowComments === false) {
    return (
      <div className='flex items-center gap-3 border border-border px-6 py-8 text-muted-foreground'>
        <Lock className='h-4 w-4 shrink-0' />
        <span className='text-xs font-semibold uppercase tracking-widest'>
          Comments are disabled for this article.
        </span>
      </div>
    );
  }

  // Consent not yet granted for functional cookies
  if (!functionalConsent) {
    return (
      <div className='space-y-3 border border-border px-6 py-8'>
        <div className='flex items-center gap-2'>
          <MessageSquare className='h-4 w-4 shrink-0 text-untele' />
          <span className='text-xs font-black uppercase tracking-widest'>
            Join the Discussion
          </span>
        </div>
        <p className='text-sm text-muted-foreground'>
          Comments require functional cookies to load. Update your cookie
          preferences to participate in the discussion.
        </p>
        <a
          href='/privacy-settings'
          className='inline-block bg-untele px-4 py-3 text-xs font-black uppercase tracking-widest text-white'
        >
          Update Cookie Preferences
        </a>
      </div>
    );
  }

  return (
    <section aria-label='Article comments' className='space-y-4'>
      <div className='bg-untele px-4 py-2'>
        <h2 className='flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white'>
          <MessageSquare className='h-4 w-4' />
          Discussion
        </h2>
      </div>
      <div id='coral_thread' />
    </section>
  );
}
