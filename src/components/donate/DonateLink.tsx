'use client';

import { useConsentAwareTracking } from '@/components/analytics/ConsentAwareAnalytics';

interface Props {
  href: string;
  platform: string;
  className?: string;
  children: React.ReactNode;
}

export default function DonateLink({ href, platform, className, children }: Props) {
  const { trackEvent } = useConsentAwareTracking();

  return (
    <a
      href={href}
      className={className}
      target='_blank'
      rel='noopener noreferrer'
      onClick={() => trackEvent('donate_click', { platform })}
    >
      {children}
    </a>
  );
}
