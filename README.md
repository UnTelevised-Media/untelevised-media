# Untelevised Media

Independent digital media platform covering news, music, and culture. Built on Next.js with a full editorial workflow, contributor portal, and integrated bookstore.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC)

## Platform Sections

| Section | Path | Description |
|---|---|---|
| News | `/` | Articles, breaking news, fact-checks, timelines |
| Music | `/albums`, `/lyrics`, `/music-artists` | Album reviews, lyrics, artist profiles |
| Bookstore | `/bookstore` | E-commerce with downloads, orders, wishlist |
| Portal | `/portal` | Contributor dashboard — pitch, write, earn |
| Studio | `/studio` | Sanity CMS for editors |

## Tech Stack

- **Framework** — Next.js 16 App Router, React 19, TypeScript 5.9
- **CMS** — Sanity v5 with Visual Editing and live preview
- **Auth** — Clerk (sign-in, sign-up, session management)
- **Search** — Algolia with React InstantSearch
- **Database** — Supabase (PostgreSQL)
- **Payments** — Stripe
- **Email** — Resend + React Email templates
- **Rate limiting** — Upstash Redis
- **Error monitoring** — Sentry
- **Editors** — TipTap, BlockNote (rich text in portal)
- **UI** — Shadcn UI, Radix UI, Framer Motion, Tailwind CSS
- **Bot protection** — Cloudflare Turnstile
- **Deployment** — Vercel

## Getting Started

### Prerequisites

- Node.js >= 18.18.0
- npm >= 9.0.0

### Installation

```bash
git clone https://github.com/UnTelevised-Media/untelevised-media.git
cd untelevised-media
npm install
cp .env.example .env.local
npm run dev
```

### Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_TOKEN=
SANITY_WEBHOOK_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=
ALGOLIA_ADMIN_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# Upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

## Scripts

```bash
npm run dev              # Development server
npm run dev:turbo        # Development with Turbopack
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier
npm run type-check       # TypeScript check
npm run test             # Jest
npm run test:coverage    # Jest with coverage
npm run analyze          # Bundle analyzer
npm run algolia:index    # Index content to Algolia
npm run convert:webp     # Convert images to WebP
npm run deploy           # Deploy to Vercel preview
npm run deploy:prod      # Deploy to Vercel production
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Clerk sign-in / sign-up
│   ├── (music)/         # Albums, lyrics, artists
│   ├── (news)/          # Articles, breaking, fact-checks, timelines
│   ├── (portal)/        # Contributor dashboard
│   ├── (studio)/        # Sanity Studio
│   └── (user)/          # Bookstore, orders, downloads
├── components/
│   ├── ui/              # Shadcn base components
│   ├── global/          # Header, footer, nav
│   ├── providers/       # Context providers
│   └── ...              # Feature components
├── hooks/               # Custom React hooks
├── lib/                 # Client configurations (sanity, algolia, stripe…)
├── server/              # Server-only utilities and actions
└── scripts/             # CLI scripts (Algolia indexing, image conversion)
```

## Commit Convention

Follows [Conventional Commits](https://www.conventionalcommits.org/):
`feat:` `fix:` `docs:` `style:` `refactor:` `test:` `chore:`
