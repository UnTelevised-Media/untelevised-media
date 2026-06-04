// src/components/post/CommentsSection.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { useConsent } from '@/lib/consent/context';
import { Lock, MessageSquare } from 'lucide-react';

interface CommentsSectionProps {
  articleId: string;
  articleUrl: string;
  allowComments?: boolean;
}

declare global {
  interface Window {
    Coral?: {
      createStreamEmbed: (config: Record<string, unknown>) => { remove: () => void };
    };
  }
}

export default function CommentsSection({
  articleId,
  articleUrl,
  allowComments = true,
}: CommentsSectionProps) {
  const { isSignedIn, isLoaded } = useUser();
  const { resolvedTheme } = useTheme();
  // preferences.preferences is the "functional cookies" consent flag
  const { preferences: { preferences: functionalConsent } } = useConsent();
  const [token, setToken] = useState<string | null>(null);
  const embedRef = useRef<{ remove: () => void } | null>(null);

  // Fetch SSO token for signed-in users; cache in sessionStorage so navigating
  // between articles in the same tab reuses the token without hitting Clerk again.
  useEffect(() => {
    if (!isSignedIn) return;
    const cached = sessionStorage.getItem('coral_sso_token');
    if (cached) { setToken(cached); return; }
    const controller = new AbortController();
    fetch('/api/coral-token', { signal: controller.signal })
      .then((r) => r.json())
      .then((d: { token: string | null }) => {
        if (d.token) sessionStorage.setItem('coral_sso_token', d.token);
        setToken(d.token);
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.name !== 'AbortError') {
          // Token fetch failed — fall through to guest embed view
          setToken(null);
        }
      });
    return () => controller.abort();
  }, [isSignedIn]);

  // Load and initialise Coral embed — re-runs when theme or auth state changes
  useEffect(() => {
    if (!functionalConsent || !allowComments) return;
    if (!isLoaded) return;
    // Wait for token fetch to resolve before initialising as authenticated user
    if (isSignedIn && token === null) return;

    const coralUrl = process.env.NEXT_PUBLIC_CORAL_URL;
    if (!coralUrl) {
      console.warn('[CommentsSection] NEXT_PUBLIC_CORAL_URL is not set');
      return;
    }

    // Always pass LIGHT to Coral — dark mode is handled entirely by customCSSURL.
    // Passing DARK causes Coral to inject its own dark styles after our CSS loads,
    // overriding our rules.
    const cssTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

    let script: HTMLScriptElement | null = null;
    let cancelled = false;

    const initEmbed = () => {
      if (cancelled) return;
      embedRef.current?.remove();
      embedRef.current =
        window.Coral?.createStreamEmbed({
          id: 'coral_thread',
          rootURL: coralUrl,
          storyID: articleId,
          storyURL: articleUrl,
          ...(token ? { accessToken: token } : {}),
          loginURL: `${window.location.origin}/sign-in`,
          customCSSURL: `${window.location.origin}/coral-theme-${cssTheme}.css`,
          theme: 'LIGHT',
          autoRender: true,
        }) ?? null;
    };

    if (window.Coral) {
      initEmbed();
    } else {
      // Avoid injecting the script twice if it is already in the DOM
      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[src="${coralUrl}/assets/js/embed.js"]`,
      );
      if (existingScript) {
        existingScript.addEventListener('load', initEmbed, { once: true });
      } else {
        script = document.createElement('script');
        script.src = `${coralUrl}/assets/js/embed.js`;
        script.async = true;
        script.onload = initEmbed;
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      script?.remove();
      embedRef.current?.remove();
      embedRef.current = null;
    };
  }, [
    functionalConsent,
    token,
    isSignedIn,
    isLoaded,
    articleId,
    articleUrl,
    allowComments,
    resolvedTheme,
  ]);

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
