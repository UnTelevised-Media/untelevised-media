// src/app/(user)/layout.tsx
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Inter } from 'next/font/google';
import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import ThemeProvider from '@/components/providers/ThemeProvider';
import Footer from '@/components/global/Footer';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';

// // Import environment validation
// import '@/lib/env';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
  display: 'swap',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Next.js 15 Boilerplate',
    template: '%s | Next.js 15 Boilerplate',
  },
  description:
    'A comprehensive Next.js 15 boilerplate with TypeScript, Tailwind CSS, Clerk Auth, Sanity CMS, and more.',
  keywords: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Clerk', 'Sanity'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'Next.js 15 Boilerplate',
    description: 'A comprehensive Next.js 15 boilerplate',
    siteName: 'Next.js 15 Boilerplate',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Next.js 15 Boilerplate',
    description: 'A comprehensive Next.js 15 boilerplate',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
      <html lang='en' suppressHydrationWarning>
        <head>
          <link rel='icon' href='/favicon.ico' sizes='any' />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased`}
        >
          <ErrorBoundary>
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange
            >
              <div className='relative flex min-h-screen flex-col'>
                <main className='flex-1'>
                  <ErrorBoundary>{children}</ErrorBoundary>
                </main>
                <Footer />
              </div>
              <Toaster />
            </ThemeProvider>
          </ErrorBoundary>

          {/* Analytics */}
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
  );
}

export default RootLayout;