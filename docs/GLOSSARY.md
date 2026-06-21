# Glossary

**Last Updated:** June 2026

Common terms, acronyms, and project-specific vocabulary used throughout UnTelevised Media.

---

## A

### Admin
User role with full access to all features including user management. See [Roles](./features/admin/ROLES.md).

### Algolia
Search-as-a-service platform for full-text search and faceted search. We use it to index articles, products, and other content. See [Search](./features/search/ALGOLIA.md).

### API
Application Programming Interface. Our routes at `/api/*` that handle server-side operations.

### Article
Primary content type on the news section. Contains title, body, metadata, and publishing info.

### Author
Content creator role. Can create, edit own articles and view earnings. See [Roles](./features/admin/ROLES.md).

---

## B

### BlockNote
Rich text editor library used in the Portal for article editing. Supports formatting, images, embeds.

### Bookstore
E-commerce section of the platform selling books (physical and digital) and merchandise.

### Brief
Editorial assignment for an author. Contains story angle, research direction, deadline.

---

## C

### Category
Content classification system. Articles, timelines, and other content are organized by category.

### Checkout Session
Stripe checkout flow. User selects items, enters payment info, completes purchase.

### Clerk
Authentication provider handling login/signup, sessions, and user metadata.

### CLI
Command-line interface. E.g., `npm run dev` is a CLI command.

### CPM
Cost Per Mille (per 1000 views). Revenue model for content creators. E.g., $5 CPM = $5 per 1000 views.

### CORS
Cross-Origin Resource Sharing. Security mechanism preventing cross-domain requests.

### CMS
Content Management System. We use Sanity to manage all content (articles, products, etc.).

### CSV
Comma-separated values. Text file format for data export/import (e.g., subscriber lists).

---

## D

### Database
Structured data store. We use Supabase (PostgreSQL) for orders, users, reviews, analytics.

### Draft Mode
Sanity feature allowing preview of unpublished content via `/api/draft`.

### Dynamic Route
Route with parameters, e.g., `/articles/[slug]/` where slug changes per article.

---

## E

### Editor
Content management role. Can create/edit any article, approve submissions. See [Roles](./features/admin/ROLES.md).

### Edge Function
Serverless function running at global edge locations (Vercel). Lower latency than origin.

### Edge Caching
Caching at edge locations (CDN). Speeds up repeated requests for same content.

### ePub
E-book format (XML-based). Alternative to PDF for digital books.

---

## F

### Fact-Check Article
Specialized article type with structured verdict (True/False/Misleading/etc.) and ClaimReview schema.

### Fetch
Retrieve data from API or database. E.g., "fetch article from Sanity".

### Frontmatter
Metadata at top of markdown files. Not used in our stack but common in CMS.

---

## G

### GDPR
General Data Protection Regulation (EU privacy law). We comply via consent banner, privacy settings.

### Geo-location
User's country/region. We track this in view events for analytics.

### Git
Version control system. We use GitHub for code management.

### GROQ
Graph-Relational Object Query. Query language used by Sanity to fetch content. E.g., `*[_type == "article"]`.

### GTM
Google Tag Manager. Tracks user interactions and events for analytics.

---

## H

### Hydration
Process of React making static HTML interactive in the browser. Critical for performance.

### HTTP
HyperText Transfer Protocol. Standard protocol for web requests (GET, POST, PATCH, etc.).

### HTTPS
Secure version of HTTP with encryption. Required for all production URLs.

---

## I

### ISR
Incremental Static Regeneration. Next.js feature that regenerates static pages on-demand.

### Invoice
Document sent to customers for orders. Contains items, prices, payment info.

---

## J

### JSON
JavaScript Object Notation. Standard data format for APIs and configuration.

### JWT
JSON Web Token. Signed token containing user data, used for authentication.

---

## K

### Keywords
Search terms people use to find content. Part of SEO metadata.

---

## L

### Lazy Loading
Deferring load of images/components until needed. Improves performance.

### LMS
Learning Management System. Not applicable to our platform.

### LSP
Language Server Protocol. Used by code editors for autocomplete/type checking.

---

## M

### Markdown
Plain text format with simple syntax. Not used in our CMS but used in documentation.

### Middleware
Software layer that handles requests before they reach route handlers. We use Clerk middleware for auth.

### Migration
Database schema change (add table, add column, rename field, etc.). Managed in Supabase.

### Music Artist
Profile for music creator. Can have albums, songs, reviews.

---

## N

### Newsletter
Email sent to subscribers with latest articles/updates. Uses Resend for delivery.

### Next.js
React framework providing SSR, SSG, ISR, API routes, and edge functions.

---

## O

### OG Image
Open Graph image used when content is shared on social media. Automatically generated for articles.

### Order
Customer purchase record. Contains items, total, shipping address, status.

### Ordering System
Complete flow from cart → checkout → payment → fulfillment.

---

## P

### PDF
Portable Document Format. Used for downloadable books and documents.

### Portal
Contributor dashboard where authors manage articles, track earnings, submit pitches.

### Portable Text
Block content format used by Sanity. Flexible, can include custom blocks.

### Payout
Money sent to author's bank account. Typically monthly when threshold reached.

---

## Q

### Query
Request for data, typically from Sanity (GROQ) or Supabase (SQL).

### Queue
Ordered list of items to process. E.g., view events queued for batch processing.

---

## R

### Rate Limiting
Restricting number of requests from user/IP in time period. We use Upstash Redis for this.

### Revalidate
Trigger rebuild/recache of static pages. Done when content changes in CMS.

### Review
Customer rating + comment on a product. 1-5 stars + text.

### Role
User permission level: admin, editor, author, sales. See [Roles](./features/admin/ROLES.md).

### Route Handler
API endpoint file (route.ts). Handles GET, POST, PATCH, DELETE requests.

### RSC
React Server Components. Components that run only on server, reduce JS bundle.

---

## S

### Sales Role
Limited role for sales team. Can only view/update orders, no content access.

### Sanity
Headless CMS used for all content management (articles, books, metadata).

### SEO
Search Engine Optimization. Techniques to improve search visibility (metadata, schemas, links).

### Session
Authenticated user connection. Stored in cookie or JWT token.

### Slug
URL-friendly identifier for content. E.g., "my-article-title" for `/articles/my-article-title/`.

### Supabase
PostgreSQL database platform. We use it for structured data (orders, users, analytics).

### Swagger / OpenAPI
API documentation format. Not used in our project but industry standard.

---

## T

### Tailwind CSS
Utility-first CSS framework. We use for styling all UI components.

### Template
Reusable component or page structure. E.g., article template used for all articles.

### Timeline
Collection of related events presented chronologically. E.g., "2024 Election Timeline".

### Transaction
Database operation or payment operation. Atomic (all or nothing).

### Turnstile
Cloudflare bot protection. Used for form verification (CAPTCHA alternative).

### TypeScript
Superset of JavaScript with type checking. Prevents many bugs at compile time.

---

## U

### Upstash
Redis as-a-service. We use for rate limiting and temporary data storage.

### URL
Uniform Resource Locator. Web address, e.g., `https://www.untelevised.media/articles/my-article/`.

### UUID
Universally Unique Identifier. 128-bit identifier used for primary keys (database).

---

## V

### Vercel
Edge platform for deploying Next.js apps. Handles hosting, caching, edge functions.

### View Count
Number of times article has been viewed. Tracked in Supabase via view events.

### View Event
Individual pageview tracking record. Contains article ID, user ID (optional), country, timestamp.

---

## W

### Webhook
URL that external service calls when something happens. E.g., Stripe calls us when payment succeeds.

### Wishlist
Collection of products user wants to buy later. Persistent across sessions.

---

## X

### XML
Extensible Markup Language. Used for sitemaps, RSS feeds, and data interchange.

---

## Y

### YAML
YAML Ain't Markup Language. Config file format (e.g., .env, GitHub Actions).

---

## Z

### Zod
TypeScript-first schema validation library. We use for validating API request data.

### Zustand
State management library. Lightweight alternative to Redux/Context. Used for client state.

---

## Acronyms

| Acronym | Full Name |
|---------|-----------|
| API | Application Programming Interface |
| CAPTCHA | Completely Automated Public Turing Test |
| CLI | Command-Line Interface |
| CORS | Cross-Origin Resource Sharing |
| CPM | Cost Per Mille |
| CRUD | Create, Read, Update, Delete |
| CSV | Comma-Separated Values |
| DOM | Document Object Model |
| HTTP | HyperText Transfer Protocol |
| HTTPS | HTTP Secure |
| ISR | Incremental Static Regeneration |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| OG | Open Graph |
| PDF | Portable Document Format |
| PK | Primary Key |
| REST | Representational State Transfer |
| RLS | Row-Level Security |
| RSC | React Server Components |
| SEO | Search Engine Optimization |
| SQL | Structured Query Language |
| SSG | Static Site Generation |
| SSR | Server-Side Rendering |
| UUID | Universally Unique Identifier |
| XML | Extensible Markup Language |
| YAML | YAML Ain't Markup Language |

---

## Role Definitions

See [Roles](./features/admin/ROLES.md) for complete details.

| Role | Access Level | Use Case |
|------|--------------|----------|
| **Admin** | Full | Platform management |
| **Editor** | Editorial | Content management, approval |
| **Author** | Limited | Content creation |
| **Sales** | Orders only | Order management |
| **None** | Public | Regular visitors |

---

## Content Types

| Type | Location | Purpose |
|------|----------|---------|
| **Article** | News section | Main content type for news/features |
| **Breaking News** | `/breaking/` | Urgent updates |
| **Fact-Check** | `/fact-checks/` | Structured verification |
| **Timeline** | `/timeline/` | Event narratives |
| **Album** | Music section | Music release |
| **Song/Lyrics** | Music section | Song information |
| **Artist Profile** | Music section | Musician information |
| **Book (Physical)** | Bookstore | Printed book for sale |
| **Book (Digital)** | Bookstore | PDF/ePub for download |

---

## URL Patterns

| Pattern | Example | Purpose |
|---------|---------|---------|
| `/articles/[slug]/` | `/articles/my-story/` | Article page |
| `/category/[slug]/` | `/category/politics/` | Category articles |
| `/author/[slug]/` | `/author/jane-doe/` | Author profile |
| `/timeline/[slug]/` | `/timeline/2024-election/` | Event timeline |
| `/bookstore/book/[slug]/` | `/bookstore/book/my-book/` | Product page |
| `/portal/articles/` | `/portal/articles/` | My articles (logged in) |
| `/api/[endpoint]` | `/api/view` | API endpoint |

---

## Common Command Patterns

```bash
# Development
npm run dev                  # Start dev server
npm run dev:turbo            # Faster dev (experimental)

# Quality
npm run type-check           # TypeScript errors
npm run lint                 # ESLint violations
npm run lint:fix             # Auto-fix linting
npm run format               # Prettier formatting
npm run test                 # Run tests

# Building
npm run build                # Production build
npm run start                # Run built app

# Utilities
npm run algolia:index        # Sync content to search
npm run convert:webp         # Convert images format

# Deployment
npm run deploy               # Deploy to Vercel preview
npm run deploy:prod          # Deploy to production
```

---

## Environment Variable Categories

| Category | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_*` | Client-visible config | App URL, Clerk keys |
| `*_SECRET_KEY` | Server-only secrets | Stripe, Supabase keys |
| `*_API_TOKEN` | API authentication | Sanity token, Algolia token |
| `*_WEBHOOK_SECRET` | Webhook verification | Stripe, Clerk webhook secrets |

---

## Database Terminology

| Term | Meaning | Example |
|------|---------|---------|
| **Table** | Collection of records | `users`, `orders` |
| **Column** | Field/property | `user_id`, `total_price` |
| **Row** | Individual record | One order record |
| **PK** | Primary key (unique ID) | `id`, `user_id` |
| **FK** | Foreign key (reference) | `order_id` references orders |
| **Index** | Optimization for searches | `idx_user_email` on users table |
| **RLS** | Row-level security | User sees only own orders |
| **Migration** | Schema change | Adding new column to table |

---

## API Terminology

| Term | Meaning | Example |
|------|---------|---------|
| **Endpoint** | API URL path | `/api/newsletter-subscribe` |
| **Method** | HTTP verb | GET, POST, PATCH, DELETE |
| **Request** | Data sent to server | JSON body with email |
| **Response** | Data returned from server | JSON with success status |
| **Payload** | Request/response body | `{ email: "..." }` |
| **Status Code** | Response result | 200 OK, 401 Unauthorized |
| **Rate Limit** | Max requests per time | 10 per minute |
| **Webhook** | Server-to-server callback | Stripe notifies us of payment |

---

## CSS & Styling

| Term | Meaning | Example |
|------|---------|---------|
| **Utility Class** | Tailwind CSS class | `flex`, `text-lg`, `bg-blue-500` |
| **Component** | Shadcn UI component | `<Button />`, `<Card />` |
| **Modifier** | Conditional styling | `hover:bg-blue-600`, `md:flex` |
| **Breakpoint** | Responsive size | `sm`, `md`, `lg`, `xl`, `2xl` |
| **Dark Mode** | Theme toggle | `dark:bg-gray-900` |

---

## Questions?

- See [Documentation Index](./DOCUMENTATION_INDEX.md) for complete docs
- Check feature-specific docs for detailed information
- Use Ctrl+F to search this glossary

---

## Contributing

When adding new terms:
1. Use alphabetical order
2. Include definition
3. Link to related docs where applicable
4. Add examples when helpful
5. Update acronym list if needed
