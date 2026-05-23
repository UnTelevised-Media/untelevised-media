'use client';
// src/components/global/TurnstileWidget.tsx
// Cloudflare Turnstile CAPTCHA widget. Renders nothing when
// NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set (local dev).

import { Turnstile } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export function TurnstileWidget({ onSuccess, onError, onExpire }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;

  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={onSuccess}
      onError={onError}
      onExpire={onExpire}
      options={{ theme: 'dark' }}
    />
  );
}
