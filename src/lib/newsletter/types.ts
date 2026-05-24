// src/lib/newsletter/types.ts
// Shared types and config for both newsletter lists.

export type SubscriberStatus = 'pending' | 'active' | 'unsubscribed';

export interface NewsletterConfig {
  /** Sanity document type */
  schemaType: 'newsletterSubscribe' | 'bookstoreSubscriber';
  /** env var key holding the Resend audience ID */
  audienceIdEnvKey: string;
  /** "From" address for confirmation + welcome emails */
  fromEmailEnvKey: string;
  /** Base URL for the confirm route, e.g. /api/newsletter-confirm */
  confirmRoute: string;
  /** Base URL for the unsubscribe route */
  unsubscribeRoute: string;
  /** Human-readable list name used in email copy */
  listName: string;
  /** Brand color hex used in email templates */
  brandColor: string;
  /** Short mission copy for welcome email */
  missionCopy: string;
  /** URL to redirect to after successful confirmation */
  confirmRedirectUrl: string;
  /** URL to redirect to after successful unsubscribe */
  unsubscribeRedirectUrl: string;
}

/** Config for the main UnTelevised Media news newsletter. */
export const NEWS_NEWSLETTER: NewsletterConfig = {
  schemaType: 'newsletterSubscribe',
  audienceIdEnvKey: 'RESEND_NEWS_AUDIENCE_ID',
  fromEmailEnvKey: 'NEWSLETTER_FROM_EMAIL',
  confirmRoute: '/api/newsletter-confirm',
  unsubscribeRoute: '/api/newsletter-unsubscribe',
  listName: 'UnTelevised Media',
  brandColor: '#D70606',
  missionCopy:
    "You're now subscribed to independent journalism — unfiltered, uncensored, and uncompromising. We cover breaking news, live events, and stories mainstream media ignores.",
  confirmRedirectUrl: '/?subscribed=1',
  unsubscribeRedirectUrl: '/?unsubscribed=1',
};

/** Config for the Hurriya Publications bookstore newsletter. */
export const BOOKSTORE_NEWSLETTER: NewsletterConfig = {
  schemaType: 'bookstoreSubscriber',
  audienceIdEnvKey: 'RESEND_BOOKSTORE_AUDIENCE_ID',
  fromEmailEnvKey: 'NEWSLETTER_FROM_EMAIL',
  confirmRoute: '/api/bookstore/newsletter/confirm',
  unsubscribeRoute: '/api/bookstore/newsletter/unsubscribe',
  listName: 'Hurriya Publications',
  brandColor: '#009736',
  missionCopy:
    "You're now subscribed to Hurriya Publications — independent books by literary authors. We'll notify you of new releases, author events, and exclusive offers.",
  confirmRedirectUrl: '/bookstore?subscribed=1',
  unsubscribeRedirectUrl: '/bookstore?unsubscribed=1',
};
