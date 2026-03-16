<!-- GitHub Issue: #26 -->

## Problem

The `/about` page on UnTelevised Media almost certainly contains boilerplate placeholder content inherited from the `next-alchemy-15-sanity` starter. For an independent outlet positioning itself as a serious journalism source, this page is a critical trust and credibility asset — not an afterthought.

Advertisers, sources, tipsters, and other journalists all evaluate the "About The Newsroom" page when deciding whether to engage with an outlet. A page with placeholder copy actively signals that the organization is not serious about its identity. Worse, Google's Quality Rater Guidelines and the EEAT framework (Experience, Expertise, Authoritativeness, Trustworthiness) explicitly look for evidence of editorial standards, author expertise, and funding transparency as ranking signals for news content. A weak or missing about/newsroom page is a direct EEAT vulnerability.

The site already has linked pages (`/staff`, `/whistleblower`, `/secure-contact`, `/policies`) that a strong newsroom page should link to and contextualize. Without an editorial standards page, those linked pages lack the narrative framework that makes them meaningful.

## Background & Context

The current about page lives at `src/app/(user)/about/page.tsx`. There is likely an existing `policies` schema in `src/models/schema/policies.ts` that is used for the `/policies` route. The `siteSettings` singleton schema exists at `src/models/schema/siteSettings.ts`. The preferred approach is a Sanity-managed `editorialStandards` singleton so editors can update this content without a code deploy, while keeping the page structure in code.

The site's existing pages that must be cross-linked:
- `/staff` — team members
- `/author/[slug]` — individual reporter profiles
- `/secure-contact` — encrypted source contact
- `/whistleblower` — whistleblower submission
- `/policies` — editorial and privacy policies
- `/donate` — reader support / funding transparency

The page must implement `generateMetadata` targeting EEAT-relevant search terms and inject `AboutPage` JSON-LD per schema.org.

## Architecture

```
Sanity Studio
  └── editorialStandards (singleton document)
        ├── missionStatement (text)
        ├── editorialProcess (blockContent)
        ├── correctionsPolicy (text)
        ├── fundingTransparency (text)
        ├── privacyCommitment (text)
        ├── ethicsPolicy (text)
        └── seo { title, description }
                │
                ▼
     sanityFetch({ query: queryEditorialStandards })
                │
                ▼
  /about/page.tsx (Server Component)
        ├── generateMetadata → EEAT-targeted title/description
        ├── AboutPage JSON-LD injected in <head>
        └── Page sections:
              1. Mission Statement
              2. Editorial Process
              3. Corrections Policy → link to corrections@untelevised.media
              4. Independence & Funding Transparency → link to /donate
              5. Privacy & Source Protection → links to /whistleblower, /secure-contact
              6. Ethics & Conflicts of Interest
              7. Meet The Newsroom → links to /staff, /author/[slug]
```

## Proposed Solution

### Step 1 — Sanity Schema: editorialStandards Singleton

```typescript
// src/models/schema/editorialStandards.ts
import { defineField, defineType } from 'sanity';
import { BookOpen } from 'lucide-react';

export default defineType({
  name: 'editorialStandards',
  title: 'Editorial Standards',
  type: 'document',
  icon: BookOpen,
  // Singleton — only one document of this type should exist
  __experimental_actions: ['update', 'publish'],
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'missionStatement',
      title: 'Mission Statement',
      type: 'text',
      rows: 5,
      group: 'content',
      description: 'What UnTelevised Media covers and why it exists. Independence statement.',
    }),
    defineField({
      name: 'editorialProcess',
      title: 'Editorial Process',
      type: 'blockContent',
      group: 'content',
      description: 'How stories are selected, verified, and edited.',
    }),
    defineField({
      name: 'verificationStandards',
      title: 'Verification Standards',
      type: 'text',
      rows: 4,
      group: 'content',
      description: 'Minimum source requirements, fact-checking process.',
    }),
    defineField({
      name: 'correctionsPolicy',
      title: 'Corrections Policy',
      type: 'text',
      rows: 4,
      group: 'content',
      description: 'How corrections are issued and how readers can request them.',
    }),
    defineField({
      name: 'fundingTransparency',
      title: 'Independence & Funding Transparency',
      type: 'text',
      rows: 5,
      group: 'content',
      description: 'Revenue sources, advertiser independence policy.',
    }),
    defineField({
      name: 'privacyCommitment',
      title: 'Privacy & Source Protection',
      type: 'text',
      rows: 4,
      group: 'content',
      description: 'How sources are protected, link to secure contact.',
    }),
    defineField({
      name: 'ethicsPolicy',
      title: 'Ethics & Conflicts of Interest',
      type: 'text',
      rows: 4,
      group: 'content',
      description: 'Staff disclosure policy, recusal standards.',
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seoObject',
      group: 'seo',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Editorial Standards' };
    },
  },
});
```

### Step 2 — Register Schema + Studio Structure

```typescript
// src/models/schema/index.ts — add editorialStandards
import editorialStandards from './editorialStandards';

export const schemaTypes = [
  // ... existing types
  editorialStandards,
];
```

```typescript
// src/lib/sanity/structure.ts — add singleton to desk structure
// Add to the structure definition:
S.listItem()
  .title('Editorial Standards')
  .child(
    S.document()
      .schemaType('editorialStandards')
      .documentId('editorialStandards')
  ),
```

### Step 3 — GROQ Query

```typescript
// src/lib/sanity/lib/queries.ts

export const queryEditorialStandards = groq`
  *[_type == 'editorialStandards'][0] {
    missionStatement,
    editorialProcess,
    verificationStandards,
    correctionsPolicy,
    fundingTransparency,
    privacyCommitment,
    ethicsPolicy,
    seo
  }
`;
```

### Step 4 — AboutPage JSON-LD Builder

```typescript
// src/lib/seo/aboutPageJsonLd.ts

const SITE_URL = 'https://untelevised.media';

export function buildAboutPageJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: `${SITE_URL}/about`,
    name: 'About UnTelevised Media — Independent Journalism Standards',
    description:
      'Learn how UnTelevised Media reports, verifies, and publishes. Our editorial standards, correction policy, and funding transparency.',
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'UnTelevised Media',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
      foundingDate: '2024',
      description: 'Independent, uncensored journalism. Unfiltered. Uncensored. Uncompromising.',
      ethicsPolicy: `${SITE_URL}/about`,
      correctionsPolicy: `${SITE_URL}/about#corrections`,
      masthead: `${SITE_URL}/staff`,
      actionableFeedbackPolicy: `${SITE_URL}/secure-contact`,
      unnamedSourcesPolicy: `${SITE_URL}/about#sources`,
      ownershipFundingInfo: `${SITE_URL}/about#funding`,
    },
  };
}
```

### Step 5 — About Page Component

```tsx
// src/app/(user)/about/page.tsx
import { sanityFetch } from '@/lib/sanity/lib/fetch';
import { queryEditorialStandards } from '@/lib/sanity/lib/queries';
import { buildAboutPageJsonLd } from '@/lib/seo/aboutPageJsonLd';
import { PortableText } from '@portabletext/react';
import Link from 'next/link';
import {
  Newspaper,
  Shield,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Lock,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About UnTelevised Media — Independent Journalism Standards',
  description:
    'Learn how UnTelevised Media reports, verifies, and publishes. Our editorial standards, correction policy, and funding transparency.',
  openGraph: {
    title: 'About UnTelevised Media — Independent Journalism Standards',
    description:
      'How we report, verify, and publish. Editorial standards, corrections policy, source protection, and funding transparency.',
  },
};

const SECTIONS = [
  { id: 'mission', icon: Newspaper, label: 'Mission Statement' },
  { id: 'process', icon: CheckCircle, label: 'Editorial Process' },
  { id: 'corrections', icon: AlertTriangle, label: 'Corrections Policy' },
  { id: 'funding', icon: DollarSign, label: 'Independence & Funding' },
  { id: 'sources', icon: Lock, label: 'Privacy & Source Protection' },
  { id: 'ethics', icon: Shield, label: 'Ethics & Conflicts' },
  { id: 'team', icon: Users, label: 'Meet The Newsroom' },
];

export default async function AboutPage() {
  const standards = await sanityFetch({
    query: queryEditorialStandards,
    tags: ['editorialStandards'],
  });

  const jsonLd = buildAboutPageJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 bg-[#D70606] px-4 py-4">
          <h1 className="text-xs font-black uppercase tracking-widest text-white">
            About The Newsroom
          </h1>
          <p className="mt-1 text-sm text-red-100">
            Unfiltered. Uncensored. Uncompromising.
          </p>
        </div>

        {/* Jump nav */}
        <nav aria-label="Page sections" className="mb-8 border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">
            Jump to
          </p>
          <ul className="flex flex-wrap gap-2">
            {SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="text-xs font-bold text-[#D70606] hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mission */}
        <section id="mission" className="mb-10 scroll-mt-20">
          <SectionHeader icon={Newspaper} label="Mission Statement" />
          {standards?.missionStatement ? (
            <p className="leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
              {standards.missionStatement}
            </p>
          ) : (
            <MissionFallback />
          )}
        </section>

        {/* Editorial Process */}
        <section id="process" className="mb-10 scroll-mt-20">
          <SectionHeader icon={CheckCircle} label="Editorial Process" />
          {standards?.editorialProcess ? (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <PortableText value={standards.editorialProcess} />
            </div>
          ) : (
            <EditorialProcessFallback />
          )}
        </section>

        {/* Corrections */}
        <section id="corrections" className="mb-10 scroll-mt-20">
          <SectionHeader icon={AlertTriangle} label="Corrections Policy" />
          {standards?.correctionsPolicy ? (
            <p className="leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
              {standards.correctionsPolicy}
            </p>
          ) : (
            <CorrectionsFallback />
          )}
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
            To request a correction, email{' '}
            <a
              href="mailto:corrections@untelevised.media"
              className="text-[#D70606] hover:underline"
            >
              corrections@untelevised.media
            </a>
          </p>
        </section>

        {/* Funding */}
        <section id="funding" className="mb-10 scroll-mt-20">
          <SectionHeader icon={DollarSign} label="Independence & Funding Transparency" />
          {standards?.fundingTransparency ? (
            <p className="leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
              {standards.fundingTransparency}
            </p>
          ) : (
            <FundingFallback />
          )}
          <div className="mt-4">
            <Link
              href="/donate"
              className="inline-block bg-[#D70606] py-3 px-4 text-xs font-black uppercase tracking-widest text-white hover:bg-red-700 transition-colors"
            >
              Support Independent Journalism
            </Link>
          </div>
        </section>

        {/* Privacy & Sources */}
        <section id="sources" className="mb-10 scroll-mt-20">
          <SectionHeader icon={Lock} label="Privacy & Source Protection" />
          {standards?.privacyCommitment ? (
            <p className="leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
              {standards.privacyCommitment}
            </p>
          ) : (
            <PrivacyFallback />
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/secure-contact"
              className="inline-block border border-[#D70606] py-2 px-3 text-xs font-black uppercase tracking-widest text-[#D70606] hover:bg-[#D70606] hover:text-white transition-colors"
            >
              Secure Contact
            </Link>
            <Link
              href="/whistleblower"
              className="inline-block border border-[#D70606] py-2 px-3 text-xs font-black uppercase tracking-widest text-[#D70606] hover:bg-[#D70606] hover:text-white transition-colors"
            >
              Whistleblower Submissions
            </Link>
          </div>
        </section>

        {/* Ethics */}
        <section id="ethics" className="mb-10 scroll-mt-20">
          <SectionHeader icon={Shield} label="Ethics & Conflicts of Interest" />
          {standards?.ethicsPolicy ? (
            <p className="leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
              {standards.ethicsPolicy}
            </p>
          ) : (
            <EthicsFallback />
          )}
        </section>

        {/* Team */}
        <section id="team" className="mb-10 scroll-mt-20">
          <SectionHeader icon={Users} label="Meet The Newsroom" />
          <p className="text-neutral-700 dark:text-neutral-300">
            UnTelevised Media is staffed by journalists, editors, and independent contributors
            committed to accountability reporting.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/staff"
              className="inline-block bg-[#D70606] py-3 px-4 text-xs font-black uppercase tracking-widest text-white hover:bg-red-700 transition-colors"
            >
              View Staff
            </Link>
            <Link
              href="/policies"
              className="inline-block border border-neutral-300 dark:border-neutral-600 py-3 px-4 text-xs font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300 hover:border-[#D70606] hover:text-[#D70606] transition-colors"
            >
              Editorial Policies
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-200 dark:border-neutral-700">
      <Icon className="h-4 w-4 text-[#D70606]" aria-hidden="true" />
      <h2 className="text-xs font-black uppercase tracking-widest text-neutral-800 dark:text-neutral-200">
        {label}
      </h2>
    </div>
  );
}

// Fallback components render static content when CMS data is not yet populated
function MissionFallback() {
  return (
    <p className="leading-relaxed text-neutral-700 dark:text-neutral-300">
      UnTelevised Media is an independent journalism outlet covering breaking news, live events,
      investigative reporting, and stories that mainstream media ignores or suppresses. We are not
      owned by a corporation, a political party, or an advertiser. Our mission is to report what is
      true, protect those who come forward, and hold power accountable.
    </p>
  );
}

function EditorialProcessFallback() {
  return (
    <ul className="space-y-2 text-neutral-700 dark:text-neutral-300 text-sm">
      <li>• Stories are assigned based on public interest, source leads, and original reporting opportunities.</li>
      <li>• Factual claims require a minimum of two independent sources before publication.</li>
      <li>• All articles pass through an editorial review before being published.</li>
      <li>• Breaking news may publish ahead of full verification — any updates are clearly timestamped.</li>
    </ul>
  );
}

function CorrectionsFallback() {
  return (
    <p className="leading-relaxed text-neutral-700 dark:text-neutral-300">
      We correct errors promptly and transparently. Corrections are displayed at the top of the
      affected article and noted in the article's publication history. We distinguish between
      corrections (factual errors), clarifications (added context), updates (new developments),
      and retractions (articles withdrawn entirely).
    </p>
  );
}

function FundingFallback() {
  return (
    <p className="leading-relaxed text-neutral-700 dark:text-neutral-300">
      UnTelevised Media is funded through advertising, reader donations, and memberships. Advertisers
      do not influence our editorial decisions. No advertiser has the right to approve, review, or
      kill a story. Our editorial independence is not for sale.
    </p>
  );
}

function PrivacyFallback() {
  return (
    <p className="leading-relaxed text-neutral-700 dark:text-neutral-300">
      We take source protection seriously. Confidential sources are never identified without explicit
      consent. We offer encrypted, anonymous submission channels for sensitive information. We do not
      store unnecessary metadata that could be used to identify a source.
    </p>
  );
}

function EthicsFallback() {
  return (
    <p className="leading-relaxed text-neutral-700 dark:text-neutral-300">
      Staff members are required to disclose potential conflicts of interest before covering a story.
      Reporters recuse themselves from topics where they have a financial, personal, or political
      conflict. We do not accept gifts, free travel, or paid appearances that could compromise editorial independence.
    </p>
  );
}
```

## Implementation Plan

1. **Schema** — Create `src/models/schema/editorialStandards.ts` as a singleton document.
2. **Register schema** — Add to `src/models/schema/index.ts`.
3. **Studio structure** — Add singleton to `src/lib/sanity/structure.ts` so it appears in the Studio sidebar.
4. **GROQ query** — Add `queryEditorialStandards` to `src/lib/sanity/lib/queries.ts`.
5. **JSON-LD builder** — Create `src/lib/seo/aboutPageJsonLd.ts` with `AboutPage` and `NewsMediaOrganization` types.
6. **About page** — Rewrite `src/app/(user)/about/page.tsx` with all 7 sections, fallback content, metadata, and JSON-LD injection.
7. **Content entry** — Populate the `editorialStandards` singleton in Sanity Studio.
8. **QA** — Verify all internal links work, dark mode, mobile layout.

## Files Affected

- `src/models/schema/editorialStandards.ts` — **new file**
- `src/models/schema/index.ts` — register schema
- `src/lib/sanity/structure.ts` — add singleton to studio desk
- `src/lib/sanity/lib/queries.ts` — add `queryEditorialStandards`
- `src/lib/seo/aboutPageJsonLd.ts` — **new file**
- `src/app/(user)/about/page.tsx` — full rewrite

## Deliverables Checklist

### Schema & CMS
- [ ] `editorialStandards` singleton schema created with all 7 content fields
- [ ] Schema registered in index
- [ ] Singleton appears in Sanity Studio sidebar as a single editable document
- [ ] `seoObject` field included for SEO override

### GROQ & Data
- [ ] `queryEditorialStandards` fetches all 7 content fields
- [ ] `sanityFetch` uses `tags: ['editorialStandards']` for ISR

### SEO & Structured Data
- [ ] `generateMetadata` returns EEAT-targeted title and description
- [ ] `AboutPage` JSON-LD injected on page
- [ ] `NewsMediaOrganization` nested in JSON-LD with `ethicsPolicy`, `correctionsPolicy`, `masthead`, `actionableFeedbackPolicy`, `unnamedSourcesPolicy`, `ownershipFundingInfo` fields

### Page Sections
- [ ] Mission Statement section present
- [ ] Editorial Process section present (PortableText if CMS data available, fallback otherwise)
- [ ] Corrections Policy section with `corrections@untelevised.media` email link
- [ ] Independence & Funding section with link to `/donate`
- [ ] Privacy & Source Protection with links to `/secure-contact` and `/whistleblower`
- [ ] Ethics & Conflicts section present
- [ ] Meet The Newsroom with links to `/staff` and `/policies`
- [ ] Jump-to navigation at top of page

### QA
- [ ] All internal links verified (`/staff`, `/secure-contact`, `/whistleblower`, `/policies`, `/donate`)
- [ ] Fallback content renders correctly when CMS fields are empty
- [ ] Dark mode renders correctly
- [ ] Mobile layout verified
- [ ] Page accessible — section headings, landmark roles, skip nav
