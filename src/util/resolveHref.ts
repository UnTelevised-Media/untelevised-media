// src/util/resolveHref.ts

// Define a type for the PageInfo object
type PageInfo = {
  path: string;
};

// Define a type for the pageRoutes object
type PageRoutes = Record<string, PageInfo>;

// Define the pageRoutes object with type annotations
const pageRoutes: PageRoutes = {
  home: { path: '/' },
  article: { path: '/articles/:slug' },
  category: { path: '/category/:slug' },
  liveevent: { path: '/live-event/:slug' },
  policies: { path: '/policies/:slug' },
  author: { path: '/author/:slug' },
  timeline: { path: '/timeline/:slug' },
  timelineevent: { path: '/timeline/event/:slug' },
  timelinecategory: { path: '/timeline/category/:slug' },
  timelines: { path: '/timelines' },
};

// Define the resolveHref function with type annotations
export default function resolveHref(pageType: string, slug?: string): string | undefined {
  if (pageType === undefined) {
    throw new Error('pageType is required');
  }

  const page = pageRoutes[pageType! as string];
  if (!page) {
    console.warn('Invalid page type:', pageType);
    return;
  }
  return page.path.replace(':slug', slug ?? '');
}
