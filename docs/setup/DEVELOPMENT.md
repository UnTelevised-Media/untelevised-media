# Development Setup

**Last Updated:** June 2026

Complete guide to setting up the local development environment for UnTelevised Media.

---

## Prerequisites

- **Node.js** >= 22.22.3 (check: `node --version`)
- **npm** >= 9.0.0 (check: `npm --version`)
- Git
- A code editor (VS Code recommended)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/UnTelevised-Media/untelevised-media.git
cd untelevised-media
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your credentials (see [Environment Variables](./ENVIRONMENT.md)).

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

---

## Available Scripts

### Development

```bash
npm run dev              # Start dev server (standard)
npm run dev:turbo        # Start dev server with Turbopack (faster)
```

### Building & Starting

```bash
npm run build            # Create production build
npm run start            # Start production server (after build)
npm run analyze          # Build with bundle analysis (creates .next/analyze/output.json)
```

### Code Quality

```bash
npm run type-check       # TypeScript type checking
npm run lint             # Run ESLint
npm run lint:fix         # Run ESLint with auto-fix
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without changes
```

### Testing

```bash
npm run test             # Run Jest tests once
npm run test:watch       # Run Jest in watch mode
npm run test:coverage    # Generate coverage report
```

### Database & Content

```bash
npm run algolia:index    # Sync all content to Algolia search
npm run convert:webp     # Batch convert images to WebP format
```

### Deployment

```bash
npm run deploy           # Deploy to Vercel preview
npm run deploy:prod      # Deploy to Vercel production
```

---

## Development Workflow

### Starting the Dev Server

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2 (optional): Watch tests
npm run test:watch

# Terminal 3 (optional): Monitor type errors
npm run type-check
```

The Turbopack option (`npm run dev:turbo`) offers significantly faster rebuilds but is still experimental.

### Connecting to Sanity Studio

When the dev server runs, Sanity Studio is available at:
- **URL:** `http://localhost:3000/studio`
- **Requires:** Valid `SANITY_API_TOKEN` in `.env.local`

### Connecting to Supabase

The app connects to Supabase via environment variables. Make sure these are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### File Structure

```
src/
├── app/                 # Next.js App Router (routes and pages)
│   ├── (news)/         # News section pages
│   ├── (music)/        # Music section pages
│   ├── (user)/         # User/bookstore section
│   ├── (portal)/       # Contributor portal
│   ├── (studio)/       # Sanity Studio
│   ├── api/            # API route handlers
│   └── layout.tsx      # Root layout
├── components/         # React components
├── hooks/             # Custom React hooks
├── lib/               # Utilities and client configs
└── models/            # Sanity schema definitions
```

---

## Common Development Tasks

### Adding a New Article Page

1. Create new page component in `src/app/(news)/articles/[slug]/page.tsx`
2. Add GROQ query in `src/lib/sanity/lib/queries.ts`
3. Update schema in Sanity if needed
4. Add to sitemap generation if not dynamic

### Adding a Bookstore Product

1. Create product in Sanity Studio or database
2. Add to bookstore schema in `src/models/schema/`
3. Create product page in `src/app/(user)/bookstore/book/[slug]/`
4. Add product pricing/metadata

### Creating an API Route

1. Create file at `src/app/api/[feature]/route.ts`
2. Export HTTP method handlers: `export async function GET() {}`, `export async function POST() {}`
3. Import and use `requireRole()` for auth checks if needed
4. Add error handling and logging

### Adding a Server Component

1. Create component file in `src/components/`
2. Use `async` function for data fetching
3. Import from `src/lib/sanity/lib/fetch.ts` for CMS data
4. Export component as default

---

## Debugging

### VS Code Extensions (Recommended)

- **ESLint** — Real-time linting feedback
- **Prettier** — Code formatter integration
- **Tailwind CSS IntelliSense** — Tailwind class suggestions
- **Sanity** — Sanity CMS integration
- **Thunder Client** or **REST Client** — API testing

### Debug Environment Variable Issues

```bash
# Check which env vars are loaded
node -e "console.log(JSON.stringify(process.env, null, 2))" | grep NEXT_PUBLIC

# Verify .env.local is being read
npm run type-check  # Will error if missing required vars
```

### Debug Build Issues

```bash
# Run the full build
npm run build

# Check for TypeScript errors
npm run type-check

# Lint the entire codebase
npm run lint
```

### Debug Runtime Issues

1. **Check the browser console** for client-side errors
2. **Check terminal output** for server-side errors
3. **Inspect network tab** for API call failures
4. **Check Application → Storage** for cookie/localStorage issues
5. **Use `console.log()` in server components** — appears in terminal
6. **Use React DevTools** for component debugging

### Enable Debug Logging

Add to `.env.local`:
```env
DEBUG=*
```

This enables verbose logging for many libraries.

---

## Performance Optimization During Development

### Turbopack Dev Server

```bash
npm run dev:turbo  # ~5x faster rebuilds on large projects
```

### Incremental Type Checking

TypeScript checking is slow. Only check types when needed:
```bash
npm run type-check  # Only when you suspect type errors
```

### Selective Testing

```bash
npm run test:watch -- --testNamePattern="ArticleCard"  # Test one component
npm run test -- --coverage                              # Full coverage report
```

---

## Troubleshooting

### "Module not found" errors

```bash
rm -rf node_modules .next
npm install
npm run build
```

### Port 3000 already in use

```bash
# Use a different port
PORT=3001 npm run dev

# Or kill the process on port 3000
# On macOS/Linux:
lsof -ti:3000 | xargs kill -9
# On Windows:
netstat -ano | findstr :3000
```

### Sanity Studio not loading

- Verify `NEXT_PUBLIC_SANITY_PROJECT_ID` is set
- Verify `SANITY_API_TOKEN` is set
- Check that Sanity project exists and is accessible
- Try: `npm run build && npm run start` (production build might work)

### Clerk authentication issues

- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Verify `CLERK_SECRET_KEY` is set
- Check Clerk Dashboard that dev instance is created
- Clear browser cookies and try again

### Supabase connection errors

- Verify `NEXT_PUBLIC_SUPABASE_URL` format: `https://xxxxx.supabase.co`
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the anon key, not service key
- Check Supabase project is active
- Test connection with: `npm run type-check`

### Algolia search not working

- Verify `NEXT_PUBLIC_ALGOLIA_APP_ID` is set
- Verify `ALGOLIA_ADMIN_KEY` is set (for server operations)
- Run: `npm run algolia:index` to index content
- Check Algolia dashboard that indices exist

---

## Next Steps

- Read [Code Style](./CODE_STYLE.md) for conventions
- Read [Git Workflow](./GIT_WORKFLOW.md) for branch practices
- Read [Architecture](../architecture/ARCHITECTURE.md) for system design
- Check [Environment Variables](./ENVIRONMENT.md) for all required configs
