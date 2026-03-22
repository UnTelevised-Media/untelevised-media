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

  // Fetch SSO token for signed-in users; abort on unmount or sign-out
  useEffect(() => {
    if (!isSignedIn) return;
    const controller = new AbortController();
    fetch('/api/coral-token', { signal: controller.signal })
      .then((r) => r.json())
      .then((d: { token: string | null }) => setToken(d.token))
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

  const isDark = resolvedTheme === 'dark';

  return (
    <section aria-label='Article comments' className='space-y-4'>
      {/* Inject scoped styles for the outer Coral stream (tabs, buttons, callout).
          The RTE editor is inside its own iframe and styled via customCSSURL. */}
      <style>{`
        #coral_thread .coral-tabBar {
          border-bottom-color: ${isDark ? '#1e293b' : '#e2e8f0'};
        }
        #coral_thread .coral-tabBar [aria-selected="true"],
        #coral_thread [class*="Tab-active"],
        #coral_thread [class*="Tab-streamPrimary"][aria-selected="true"] {
          color: #d70606 !important;
          border-bottom-color: #d70606 !important;
        }
        #coral_thread a {
          color: #d70606 !important;
        }
        #coral_thread .coral-general-moderateStreamLink {
          border-color: #d70606 !important;
          color: #d70606 !important;
          background: transparent !important;
        }
        #coral_thread [class*="CallOut-colorRegular"],
        #coral_thread [class*="CallOut-root"],
        #coral_thread [class*="CallOut-inner"] {
          background-color: ${isDark ? '#0f172a' : '#f8fafc'} !important;
          color: ${isDark ? '#94a3b8' : '#64748b'} !important;
          border-color: ${isDark ? '#1e293b' : '#e2e8f0'} !important;
        }
        #coral_thread [class*="Button-colorPrimary"]:not([class*="outlined"]) {
          background-color: #d70606 !important;
          border-color: #d70606 !important;
          color: #fff !important;
        }
        #coral_thread [class*="Count"],
        #coral_thread [class*="count"] {
          background-color: #d70606 !important;
          color: #fff !important;
        }
        #coral_thread select {
          background-color: ${isDark ? '#0f172a' : '#ffffff'} !important;
          color: ${isDark ? '#f8fafc' : '#020817'} !important;
          border-color: ${isDark ? '#1e293b' : '#e2e8f0'} !important;
        }
      `}</style>

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
