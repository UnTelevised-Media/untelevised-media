// src/app/(user)/shop/layout.tsx
// Shop section layout — wraps all /shop/* routes within the (user) layout.
// The outer (user)/layout.tsx already provides Header, Nav, Footer.

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100'>
      {children}
    </div>
  );
}
