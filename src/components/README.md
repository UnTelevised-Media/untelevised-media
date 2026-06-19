# Components Directory

Guidelines for organizing and building components in UnTelevised Media.

## Component Types

### Smart Components (Container Components)

Components that manage state, handle logic, and call server actions.

**Characteristics:**
- Use hooks (useState, useEffect, useContext)
- Import from services/, server/, hooks/
- Manage local and global state
- Handle data fetching and mutations
- Have side effects

**Typical locations:**
- `portal/` - Portal-specific forms and dashboards
- `bookstore/` - E-commerce containers
- `analytics/` - Tracking and analytics

**Example:**
```typescript
'use client';
import { useCart } from '@/hooks/bookstore/useCart';
import { useConsentAwareTracking } from '@/hooks/googleAdSense/useConsentAwareTracking';
import { addCartItem } from '@/server/actions/cart';

export default function ArticleEditorForm({ articleId }: { articleId: string }) {
  const [title, setTitle] = useState('');
  const { trackEvent } = useConsentAwareTracking();

  const handleSave = async () => {
    await addCartItem(articleId);
    trackEvent('article_saved');
  };

  return <form onSubmit={handleSave}>...</form>;
}
```

---

### Dumb Components (Presentational Components)

Components that only accept props and render UI.

**Characteristics:**
- No hooks (except rarely useCallback for event handling)
- No imports from services/, server/, hooks/
- Props-only interface
- Pure rendering logic
- Reusable across contexts

**Typical locations:**
- `ui/` - Base UI components (Button, Input, Card)
- `archive/` - Archive-specific presentational components
- `post/` - Article/post display components

**Example:**
```typescript
interface BookCardProps {
  title: string;
  author: string;
  price: number;
  onAddToCart: () => void;
}

export function BookCard({ title, author, price, onAddToCart }: BookCardProps) {
  return (
    <div className='book-card'>
      <h3>{title}</h3>
      <p>{author}</p>
      <span>${price}</span>
      <button onClick={onAddToCart}>Add to Cart</button>
    </div>
  );
}
```

---

### Wrapper Components (Layout/Provider Components)

Components that wrap other components and provide context.

**Characteristics:**
- Provide context/state to children
- Usually in `providers/` directory
- May have minimal UI
- Handle cross-cutting concerns

**Typical locations:**
- `providers/` - Global providers (Theme, Sentry, etc.)
- Root layout components

**Example:**
```typescript
'use client';
import { ConsentProvider } from '@/hooks/googleAdSense/useConsent';
import { ThemeProvider } from './ThemeProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </ConsentProvider>
  );
}
```

---

## Directory Structure

```
src/components/
├── analytics/              Smart - Analytics & tracking
│   ├── ConsentAwareAnalytics.tsx
│   ├── PageViewTracker.tsx
│   └── ...
├── bookstore/              Smart - E-commerce
│   ├── AddToCartButton.tsx
│   ├── CartPage.tsx
│   ├── BookCard.tsx
│   └── ...
├── consent/                Smart - Consent management
│   ├── CookieConsentBanner.tsx
│   ├── AdBlockerMessage.tsx
│   └── ...
├── error/                  Smart - Error handling
│   ├── ErrorBoundary.tsx
│   └── ...
├── global/                 Mixed - Global UI
│   ├── Nav.tsx
│   ├── Footer.tsx
│   └── ...
├── googleAdSense/          Mixed - Ad components
│   ├── AdManager.tsx       Smart - Ad context provider
│   ├── BannerAd.tsx        Dumb - Ad display
│   ├── ConsentAwareGoogleAdSense.tsx
│   └── ...
├── newsletter/             Smart - Newsletter
│   ├── NewsletterSignup.tsx
│   └── ...
├── pages/                  Smart - Page layouts
│   ├── PastEventsPage.tsx
│   └── ...
├── portal/                 Smart - Portal-specific
│   ├── ArticleEditorForm.tsx
│   ├── ArticleDashboard.tsx
│   └── ...
├── providers/              Wrapper - Context providers
│   ├── ThemeProvider.tsx
│   ├── SentryUserSync.tsx
│   └── ...
└── ui/                     Dumb - Reusable UI
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    ├── form.tsx
    └── ...
```

---

## Guidelines

### File Organization

✓ **DO:**
- One component per file
- Co-locate styles with component
- Name files after component (PascalCase)
- Export default function
- Keep related components together

❌ **DON'T:**
- Multiple components per file
- Separate CSS files for small components
- Default export + named exports mixed
- Generic names like `Container.tsx`

### Naming

✓ **Component names:**
- PascalCase file names: `ArticleCard.tsx`
- Export default: `export default function ArticleCard() {}`
- Match file name and component name

✓ **Props interfaces:**
- Name: `ComponentNameProps`
- Example: `ArticleCardProps`
- Define above component
- Use clear, semantic names

✓ **Event handlers:**
- Prefix with `on`: `onClick`, `onSubmit`
- Pass from parent
- Example: `onAddToCart`, `onDelete`

### Imports

✓ **Import order:**
1. React and framework imports
2. Third-party libraries
3. Internal modules (@/...)
4. Relative imports (./...)

```typescript
import React, { useState } from 'react';
import Script from 'next/script';
import { Flame } from 'lucide-react';

import { useCart } from '@/hooks/bookstore/useCart';
import type { Article } from '@/models/types/news';
import cn from '@/util/utils';

import { RelatedArticles } from './RelatedArticles';
```

❌ **DON'T:**
- Import entire modules for single exports
- Circular imports
- Barrel imports from components/
- Mix import order inconsistently

### Accessibility

✓ **DO:**
- Use semantic HTML (button, form, section, etc.)
- Add ARIA labels where needed
- Test with keyboard navigation
- Provide alt text for images
- Announce dynamic content

Example:
```typescript
<button
  onClick={handleClick}
  aria-label="Add to cart"
  aria-pressed={isInCart}
>
  Add to Cart
</button>
```

### Performance

✓ **DO:**
- Use React.memo for pure dumb components
- Lazy-load heavy components
- Memoize callbacks and values
- Avoid unnecessary re-renders

```typescript
import { memo } from 'react';

export const BookCard = memo(function BookCard({ book }: Props) {
  return <div>{book.title}</div>;
});
```

❌ **DON'T:**
- Render lists without keys
- Create components inside render
- Inline function props without memoization
- Large monolithic components

### Testing

✓ **DO:**
- Test smart components with hooks
- Test dumb components with props
- Mock external dependencies
- Test user interactions

❌ **DON'T:**
- Test implementation details
- Mock hooks incorrectly
- Skip integration testing
- Only test happy path

---

## Component Patterns

### Form Component

```typescript
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { submitForm } from '@/server/actions/forms';

interface FormProps {
  onSuccess?: () => void;
}

export function MyForm({ onSuccess }: FormProps) {
  const [isPending, setIsPending] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(mySchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    try {
      await submitForm(data);
      onSuccess?.();
    } finally {
      setIsPending(false);
    }
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

### List Component

```typescript
import type { Article } from '@/models/types/news';
import { ArticleCard } from './ArticleCard';

interface ArticleListProps {
  articles: Article[];
  onSelectArticle?: (id: string) => void;
}

export function ArticleList({ articles, onSelectArticle }: ArticleListProps) {
  return (
    <div className='article-list'>
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onSelect={() => onSelectArticle?.(article.id)}
        />
      ))}
    </div>
  );
}
```

### Context Consumer Hook

```typescript
'use client';
import { useContext } from 'react';
import { ConsentContext } from '@/hooks/googleAdSense/useConsent';

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within ConsentProvider');
  }
  return context;
}
```

---

## Architecture in Components

### Separation of Concerns

✓ **DO:**
- Keep business logic in services/
- Keep state management in hooks/
- Keep styling co-located
- Keep API calls in services/

```typescript
// ✓ CORRECT: Logic in hook, rendering in component
function useArticleData(id: string) {
  const [article, setArticle] = useState(null);
  useEffect(() => {
    fetchArticle(id).then(setArticle);
  }, [id]);
  return article;
}

function ArticleDetail({ id }: { id: string }) {
  const article = useArticleData(id);
  return <div>{article?.title}</div>;
}
```

❌ **DON'T:**
- Fetch data directly in component
- Complex business logic in render
- Mixed concerns (data + render + styling)

### Server Actions in Components

✓ **DO:**
- Call server actions from onClick handlers
- Handle loading states
- Show error feedback
- Optimize with useTransition

```typescript
'use client';
import { useTransition } from 'react';
import { deleteArticle } from '@/server/actions/articles';

export function DeleteButton({ articleId }: { articleId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => deleteArticle(articleId))}
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

❌ **DON'T:**
- Call server actions from useEffect
- Ignore loading states
- Block UI without feedback
- No error handling

---

## Component Checklist

Before submitting a component:

- [ ] File name matches component name (PascalCase)
- [ ] Only one component per file
- [ ] Default export, no named exports
- [ ] Props interface defined
- [ ] Imports organized correctly
- [ ] No circular dependencies
- [ ] No prop drilling (use context if needed)
- [ ] Keyboard accessible
- [ ] Responsive design tested
- [ ] Error handling added
- [ ] Loading states handled
- [ ] Comments only for non-obvious logic
- [ ] No hardcoded values
- [ ] Types properly imported
- [ ] Server actions wrapped if needed

---

## Common Mistakes

❌ **Multiple exports per file:**
```typescript
export function Component1() { }
export function Component2() { }
```

✓ **Use separate files:**
```
Component1.tsx
Component2.tsx
```

---

❌ **Prop drilling:**
```typescript
function Parent({ user }) {
  return <Child user={user} />;
}

function Child({ user }) {
  return <GrandChild user={user} />;
}

function GrandChild({ user }) {
  return <div>{user.name}</div>;
}
```

✓ **Use context:**
```typescript
const UserContext = createContext();

function Parent({ user }) {
  return (
    <UserContext.Provider value={user}>
      <Child />
    </UserContext.Provider>
  );
}

function GrandChild() {
  const user = useContext(UserContext);
  return <div>{user.name}</div>;
}
```

---

## Questions?

Refer to `src/ARCHITECTURE.md` for full architecture guidelines.
