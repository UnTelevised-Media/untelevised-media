// src/lib/factCheck/claimReviewJsonLd.ts
import { VERDICT_CONFIG, type FactCheckRating } from './verdictConfig';

export interface FactCheckDoc {
  title: string;
  slug: { current: string };
  publishedAt: string;
  claim: string;
  claimSource?: string;
  claimUrl?: string;
  claimDate?: string;
  rating: FactCheckRating;
  ratingExplanation: string;
}

const SITE_URL = 'https://untelevised.media';

export function buildClaimReviewJsonLd(fc: FactCheckDoc): object {
  const config = VERDICT_CONFIG[fc.rating];
  const pageUrl = `${SITE_URL}/fact-check/${fc.slug.current}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ClaimReview',
    url: pageUrl,
    datePublished: fc.publishedAt,
    claimReviewed: fc.claim,
    itemReviewed: {
      '@type': 'Claim',
      ...(fc.claimSource && {
        author: { '@type': 'Person', name: fc.claimSource },
      }),
      ...(fc.claimDate && { datePublished: fc.claimDate }),
      ...(fc.claimUrl && {
        appearance: { '@type': 'OpinionNewsArticle', url: fc.claimUrl },
      }),
    },
    author: {
      '@type': 'Organization',
      name: 'UnTelevised Media',
      url: SITE_URL,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: config?.ratingValue ?? 0,
      bestRating: config?.bestRating ?? 5,
      worstRating: config?.worstRating ?? 1,
      alternateName: config?.label ?? fc.rating,
    },
  };
}
