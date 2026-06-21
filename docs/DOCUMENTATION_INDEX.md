# UnTelevised Media Documentation Index

**Last Updated:** June 17, 2026  
**App Version:** 2.2.2  
**Status:** Comprehensive documentation overhaul

This is the master index for all project documentation. Browse by feature, technical area, or use case below.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Feature Documentation](#feature-documentation)
- [Technical Documentation](#technical-documentation)
- [Content & Editorial](#content--editorial)
- [Deployment & Operations](#deployment--operations)

---

## Getting Started

- **[Development Setup](./setup/DEVELOPMENT.md)** — Local environment setup, dependencies, running the dev server
- **[Project Architecture](./architecture/ARCHITECTURE.md)** — Tech stack, file structure, data flow, design patterns
- **[Environment Variables](./setup/ENVIRONMENT.md)** — Complete env reference with descriptions
- **[Glossary](./GLOSSARY.md)** — Common terms, acronyms, and project-specific vocabulary

---

## Feature Documentation

### News & Editorial
- **[News Section Overview](./features/news/README.md)** — News homepage, article pages, categories, archives
- **[Articles](./features/news/ARTICLES.md)** — Creating, publishing, managing articles
- **[Breaking News](./features/news/BREAKING_NEWS.md)** — Breaking news ticker and alerts
- **[Fact-Checking](./features/news/FACT_CHECKING.md)** — Fact-check articles and verdict system
- **[Timelines & Events](./features/news/TIMELINES.md)** — Event timelines and timeline feature
- **[Author Profiles](./features/news/AUTHORS.md)** — Author pages and metadata
- **[Categories & Tags](./features/news/CATEGORIES.md)** — Content organization and filtering

### Music Section
- **[Music Section Overview](./features/music/README.md)** — Albums, lyrics, artists
- **[Albums](./features/music/ALBUMS.md)** — Album reviews and metadata
- **[Lyrics](./features/music/LYRICS.md)** — Song lyrics and lyrics database
- **[Artist Profiles](./features/music/ARTISTS.md)** — Music artist profiles

### Bookstore & Commerce
- **[Bookstore Overview](./features/bookstore/README.md)** — E-commerce platform features
- **[Products](./features/bookstore/PRODUCTS.md)** — Book metadata, pricing, inventory
- **[Cart & Checkout](./features/bookstore/CHECKOUT.md)** — Shopping cart, payment processing, order flow
- **[Orders & Fulfillment](./features/bookstore/ORDERS.md)** — Order management, shipping, returns
- **[Digital Downloads](./features/bookstore/DOWNLOADS.md)** — Digital product delivery and resend links
- **[Reviews & Ratings](./features/bookstore/REVIEWS.md)** — Customer reviews system

### Contributor Portal
- **[Portal Overview](./features/portal/README.md)** — Contributor dashboard, permissions, access
- **[Article Workflow](./features/portal/ARTICLE_WORKFLOW.md)** — Creating, editing, publishing articles
- **[Pitches & Briefs](./features/portal/PITCHES.md)** — Pitch submissions and brief management
- **[Author Profile](./features/portal/AUTHOR_PROFILE.md)** — Author account settings
- **[Earnings & Payouts](./features/portal/EARNINGS.md)** — Payment tracking and analytics
- **[Portal Applications](./features/portal/APPLICATIONS.md)** — Contributor application process

### Membership & Payments
- **[Membership Overview](./features/membership/README.md)** — Membership tiers and benefits
- **[Stripe Integration](./features/membership/STRIPE.md)** — Payment processing, webhooks
- **[Donations](./features/membership/DONATIONS.md)** — One-time donations
- **[Subscriptions](./features/membership/SUBSCRIPTIONS.md)** — Recurring subscriptions

### Search & Discovery
- **[Search Overview](./features/search/README.md)** — Full-text search functionality
- **[Algolia Integration](./features/search/ALGOLIA.md)** — Search indexing, synchronization, analytics
- **[Trending Content](./features/search/TRENDING.md)** — Trending articles calculation and display

### View Tracking & Analytics
- **[View Counting System](./features/analytics/VIEW_TRACKING.md)** — Supabase-based view tracking
- **[Trending Articles](./features/analytics/TRENDING.md)** — Calculating and displaying trending content
- **[Analytics Integration](./features/analytics/ANALYTICS.md)** — Vercel Analytics, Google Tag Manager

### User Engagement
- **[Newsletter System](./features/engagement/NEWSLETTER.md)** — Email newsletters, subscriptions, unsubscribe
- **[Bookmarks](./features/engagement/BOOKMARKS.md)** — User bookmarking system
- **[Wishlist](./features/engagement/WISHLIST.md)** — Product wishlist functionality
- **[Comments (Coral)](./features/engagement/COMMENTS.md)** — Comment system integration

### Admin & Moderation
- **[Admin Overview](./features/admin/README.md)** — Admin capabilities and tools
- **[User Roles](./features/admin/ROLES.md)** — Role-based access control, permissions
- **[Moderation](./features/admin/MODERATION.md)** — Content moderation and removal

### Content & CMS
- **[Sanity CMS Setup](./features/cms/SANITY.md)** — Sanity configuration, schemas, studio
- **[Content Schemas](./features/cms/SCHEMAS.md)** — All content type definitions
- **[GROQ Queries](./features/cms/GROQ.md)** — Query examples and patterns
- **[Draft & Previews](./features/cms/DRAFT_MODE.md)** — Draft mode and content previews

### Authentication & Security
- **[Authentication](./features/auth/AUTHENTICATION.md)** — Clerk integration, session management
- **[Verification & Captcha](./features/auth/VERIFICATION.md)** — Form verification with Turnstile
- **[Security Best Practices](./features/security/SECURITY.md)** — Security guidelines and vulnerabilities

---

## Technical Documentation

### Architecture & Design
- **[System Architecture](./architecture/ARCHITECTURE.md)** — Overall system design
- **[Data Flow](./architecture/DATA_FLOW.md)** — How data moves through the system
- **[Content Modeling](./architecture/CONTENT_MODELING.md)** — Schema design patterns
- **[API Design](./architecture/API_DESIGN.md)** — API conventions and standards

### Backend & API
- **[API Routes Overview](./technical/api/README.md)** — All API endpoints reference
- **[Route Handlers](./technical/api/ROUTE_HANDLERS.md)** — Next.js route handler patterns
- **[Middleware & Proxy](./technical/api/MIDDLEWARE.md)** — Edge middleware, proxies
- **[Rate Limiting](./technical/api/RATE_LIMITING.md)** — Upstash rate limiting
- **[Error Handling](./technical/api/ERROR_HANDLING.md)** — Error responses and logging

### Database
- **[Supabase Overview](./technical/database/SUPABASE.md)** — PostgreSQL database setup
- **[Migrations](./technical/database/MIGRATIONS.md)** — Database migration strategy
- **[Schema Reference](./technical/database/SCHEMA.md)** — Table structure and relationships
- **[Queries & Performance](./technical/database/QUERIES.md)** — Query optimization

### Frontend & UI
- **[Component Architecture](./technical/frontend/COMPONENTS.md)** — Component patterns and conventions
- **[Styling System](./technical/frontend/STYLING.md)** — Tailwind CSS setup and patterns
- **[State Management](./technical/frontend/STATE.md)** — Zustand stores, context providers
- **[Server Components](./technical/frontend/RSC.md)** — React Server Components patterns

### Performance & Optimization
- **[Performance Guide](./technical/performance/OPTIMIZATION.md)** — Performance best practices
- **[Caching Strategy](./technical/performance/CACHING.md)** — ISR, revalidation, edge caching
- **[Bundle Analysis](./technical/performance/BUNDLING.md)** — Code splitting and bundle optimization
- **[Image Optimization](./technical/performance/IMAGES.md)** — Image loading and optimization

### Testing & Quality
- **[Testing Strategy](./technical/testing/STRATEGY.md)** — Testing approach and patterns
- **[Unit Tests](./technical/testing/UNIT_TESTS.md)** — Jest unit testing
- **[Integration Tests](./technical/testing/INTEGRATION.md)** — Integration testing approach
- **[Type Safety](./technical/testing/TYPES.md)** — TypeScript setup and checks

### Development Workflow
- **[Development Guide](./setup/DEVELOPMENT.md)** — Local development setup
- **[Code Style](./setup/CODE_STYLE.md)** — ESLint, Prettier, conventions
- **[Git Workflow](./setup/GIT_WORKFLOW.md)** — Branching, commits, PRs
- **[Debugging](./setup/DEBUGGING.md)** — Tools and techniques

---

## Content & Editorial

- **[Editorial Standards](./editorial/STANDARDS.md)** — Editorial guidelines and best practices
- **[Fact-Checking Standards](./editorial/FACT_CHECKING.md)** — Fact-check verification process
- **[Content Calendar](./editorial/CALENDAR.md)** — Planning and scheduling
- **[Style Guide](./editorial/STYLE_GUIDE.md)** — Writing style and terminology
- **[Brand Guidelines](./branding/BRAND_GUIDELINES.md)** — Brand voice and visual identity
- **[Legal Policies](./legal/POLICIES.md)** — Privacy, terms, disclaimers

---

## Deployment & Operations

### Deployment
- **[Deployment Guide](./operations/DEPLOYMENT.md)** — Deploy to production on Vercel
- **[Environments](./operations/ENVIRONMENTS.md)** — Dev, staging, production setup
- **[CI/CD Pipeline](./operations/CI_CD.md)** — GitHub Actions, automated testing
- **[Rollback Procedures](./operations/ROLLBACK.md)** — How to rollback deployments

### Monitoring & Observability
- **[Monitoring Setup](./operations/MONITORING.md)** — Error tracking, performance monitoring
- **[Sentry Integration](./operations/SENTRY.md)** — Error reporting with Sentry
- **[Logging](./operations/LOGGING.md)** — Application logging strategy
- **[Alerts & Incidents](./operations/ALERTS.md)** — Alert configuration and incident response

### Maintenance
- **[Maintenance Guide](./operations/MAINTENANCE.md)** — Regular maintenance tasks
- **[Database Maintenance](./operations/DATABASE_MAINTENANCE.md)** — Backups, optimization
- **[Dependency Updates](./operations/DEPENDENCIES.md)** — Keeping packages up to date
- **[Health Checks](./operations/HEALTH_CHECKS.md)** — Monitoring system health

### Infrastructure
- **[Hosting on Vercel](./operations/VERCEL.md)** — Vercel configuration and optimization
- **[Environment Configuration](./operations/ENV_CONFIG.md)** — Production secrets management
- **[CDN & Caching](./operations/CDN.md)** — Edge caching strategy

---

## Quick Links

| Need | Link |
|------|------|
| **How do I run the app locally?** | [Development Setup](./setup/DEVELOPMENT.md) |
| **How do I publish an article?** | [Articles](./features/news/ARTICLES.md) |
| **How do I create a new product?** | [Products](./features/bookstore/PRODUCTS.md) |
| **How do I fix a bug?** | [Debugging](./setup/DEBUGGING.md) |
| **Where is the API documentation?** | [API Routes](./technical/api/README.md) |
| **How do I deploy?** | [Deployment Guide](./operations/DEPLOYMENT.md) |
| **What's the tech stack?** | [Architecture](./architecture/ARCHITECTURE.md) |
| **How do I write tests?** | [Testing Strategy](./technical/testing/STRATEGY.md) |

---

## Status by Section

| Section | Status | Last Updated |
|---------|--------|--------------|
| News & Editorial | ✅ Complete | June 2026 |
| Music | ✅ Complete | June 2026 |
| Bookstore | ✅ Complete | June 2026 |
| Portal | ✅ Complete | June 2026 |
| Membership | ✅ Complete | June 2026 |
| Search | ✅ Complete | June 2026 |
| Admin & Roles | ✅ Complete | June 2026 |
| API & Backend | ✅ Complete | June 2026 |
| Frontend | ✅ Complete | June 2026 |
| Deployment | ✅ Complete | June 2026 |
| Testing | ✅ Complete | June 2026 |

---

## Contributing to Docs

When updating documentation:
1. Update the relevant feature or technical doc
2. Keep this index current
3. Link between related docs with markdown links
4. Include code examples where helpful
5. Update the "Last Updated" timestamp in relevant docs

For major changes, update this index's "Status by Section" table.
