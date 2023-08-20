/* eslint-disable react/function-component-definition */
import '@/app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/c/global/Header';
import Banner from '@/c/global/Banner';
import dynamic from 'next/dynamic';
import { draftMode } from 'next/headers';
import { token } from '@/lib/sanity.fetch';
import PreviewProvider from '@/components/PreviewProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UnTelevised Media',
  description: 'The Revolution will be UnTelevised',
  referrer: 'origin-when-cross-origin',
  keywords: ['Next.js', 'React', 'JavaScript'],
  authors: [
    { name: 'Radical Edward' },
    {
      name: 'Digitl Alchemyst',
      url: 'https://digitl-alchemyst-portfolio.vercel.app/',
    },
  ],
  // colorScheme: 'dark',
  creator: 'Radical Edward',
  publisher: 'Digitl Alchemyst',
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={` bg-slate-400/80 ${inter.className}`}>
        <Header />
        <Banner />
        {children}
      </body>
    </html>
  );
}
