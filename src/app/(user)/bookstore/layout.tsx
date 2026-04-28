// src/app/(user)/bookstore/layout.tsx
// Bookstore section layout — wraps all /bookstore/* routes within the (user) layout.
// The outer (user)/layout.tsx already provides Header, Nav, Footer.

export default function BookstoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {children}
    </div>
  );
}
